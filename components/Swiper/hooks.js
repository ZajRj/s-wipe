
import { useState, useEffect, useRef } from 'react';
import * as MediaLibrary from 'expo-media-library';
import { Image } from 'expo-image';
import { Gesture } from 'react-native-gesture-handler';
import { useSharedValue, withSpring, runOnJS } from 'react-native-reanimated';
import { TOTAL_SLOTS, SLOTS, SNAPPY_SPRING, SCREEN_WIDTH } from './constants';

export const useAlbumAssets = (album) => {
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [slots, setSlots] = useState(new Array(TOTAL_SLOTS).fill(null));
    const [finished, setFinished] = useState(false);

    const dataIndexRef = useRef(0);
    const totalAssetsRef = useRef(0);

    // Initial load
    useEffect(() => {
        (async () => {
            setLoading(true);
            setFinished(false);

            const { assets: fetched } = await MediaLibrary.getAssetsAsync({
                first: 1000,
                album: album.id,
                sortBy: [MediaLibrary.SortBy.creationTime]
            });

            if (fetched && fetched.length > 0) {
                setAssets(fetched);
                totalAssetsRef.current = fetched.length;

                const initial = new Array(TOTAL_SLOTS).fill(null).map((_, i) => fetched[i] ? { id: fetched[i].id, uri: fetched[i].uri } : null);
                setSlots(initial);

                dataIndexRef.current = Math.min(fetched.length, TOTAL_SLOTS) - 1;
                Image.prefetch(fetched.slice(0, 30).map(a => a.uri));
            } else {
                setFinished(true);
            }
            setLoading(false);
        })();
    }, [album]);

    const updateSlotUri = (slotIndex) => {
        const nextData = dataIndexRef.current + 1;
        if (nextData >= assets.length) {
            setSlots(prev => {
                const n = [...prev];
                n[slotIndex] = null;
                return n;
            });
            return;
        }

        dataIndexRef.current = nextData;
        const asset = assets[nextData];
        setSlots(prev => {
            const n = [...prev];
            n[slotIndex] = { id: asset.id, uri: asset.uri };
            return n;
        });
    };

    const restoreSlot = (slotIndex, assetIndex) => {
        // Rewind data pointer
        dataIndexRef.current = Math.max(0, dataIndexRef.current - 1);

        // Restore previous asset to slot
        const asset = assets[assetIndex];
        if (asset) {
            setSlots(prev => {
                const n = [...prev];
                n[slotIndex] = { id: asset.id, uri: asset.uri };
                return n;
            });

            // Also remove from delete buffer if present
            removeAssetFromDeleteBuffer(asset.id);
        }
    };

    const [deletedAssets, setDeletedAssets] = useState([]);

    const addToDeletedBuffer = (uri) => {
        setDeletedAssets(prev => [...prev, uri]);
    };

    const removeAssetFromDeleteBuffer = (assetId) => {
        setDeletedAssets(prev => prev.filter(id => id !== assetId));
    };

    const deleteBufferedAssets = async () => {
        if (deletedAssets.length === 0) return;
        try {
            await MediaLibrary.deleteAssetsAsync(deletedAssets);
            setDeletedAssets([]); // Clear buffer on success
            return true;
        } catch (error) {
            console.error("Failed to delete assets:", error);
            return false;
        }
    };

    return {
        assets,
        loading,
        slots,
        finished,
        setFinished,
        updateSlotUri,
        totalAssetsRef,
        addToDeletedBuffer,
        removeAssetFromDeleteBuffer,
        deletedAssets,
        deleteBufferedAssets,
        dataIndexRef,
        restoreSlot // Expose this function
    };
};

export const useSwipeGesture = ({
    totalAssetsRef,
    setFinished,
    updateSlotUri,
    onAction,
}) => {
    const activeSlot = useSharedValue(0);
    const swipedCount = useSharedValue(0);
    const swipeHistory = useRef([]); // Track swipe directions

    // Explicitly define shared values to respect Rules of Hooks
    const translations = [
        useSharedValue(0),
        useSharedValue(0),
        useSharedValue(0),
        useSharedValue(0),
        useSharedValue(0),
        useSharedValue(0)
    ];

    // We need to reset swipedCount when album changes, but that logic is in the other hook...
    // ideally the orchestrator (Swiper) handles resetting or we expose a reset method.
    // For now, let's expose swipedCount so the consumer can reset it if needed.

    const onSwipeEndJS = (translateX, velocityX, currentSlot) => {
        const currentSwiped = swipedCount.value + 1;
        swipedCount.value = currentSwiped;

        // Record direction: 1 for Keep (Right), -1 for Delete (Left)
        // If translateX is 0 (unlikely but possible), default to 1
        const direction = Math.sign(translateX) || 1;
        swipeHistory.current.push(direction);

        // CHECK: Is this the last card in the entire album?
        if (currentSwiped >= totalAssetsRef.current) {
            // Determine direction for the last card too
            if (Math.sign(translateX) > 0) {
                onAction('KEEP', currentSlot);
            } else {
                onAction('DELETE', currentSlot);
            }

            translations[currentSlot].value = withSpring(
                Math.sign(translateX) * SCREEN_WIDTH * 1.5,
                { velocity: velocityX, ...SNAPPY_SPRING },
                (fin) => {
                    if (fin) {
                        translations[currentSlot].value = 0;
                        runOnJS(setFinished)(true);
                    }
                }
            );
            return;
        }

        // Normal card logic
        const nextSlot = (currentSlot + 1) % TOTAL_SLOTS;
        activeSlot.value = nextSlot;

        // Trigger action
        if (Math.sign(translateX) > 0) {
            onAction('KEEP', currentSlot);
        } else {
            onAction('DELETE', currentSlot);
        }

        translations[currentSlot].value = withSpring(
            Math.sign(translateX) * SCREEN_WIDTH * 1.5,
            { velocity: velocityX, ...SNAPPY_SPRING },
            (fin) => {
                if (fin) {
                    translations[currentSlot].value = 0;
                    runOnJS(updateSlotUri)(currentSlot);
                }
            }
        );
    };

    const gesture = Gesture.Pan()
        .onUpdate((e) => {
            'worklet';
            translations[activeSlot.value].value = e.translationX;
        })
        .onEnd((e) => {
            'worklet';
            const slot = activeSlot.value;
            if (Math.abs(e.translationX) > SCREEN_WIDTH * 0.22) {
                runOnJS(onSwipeEndJS)(e.translationX, e.velocityX, slot);
                if (Math.sign(e.translationX) > 0) {
                    console.log('KEEP', slot);
                } else {
                    console.log('DELETE', slot);
                }
            } else {
                translations[slot].value = withSpring(0, SNAPPY_SPRING);
            }
        });

    const undoGesture = () => {
        if (swipedCount.value === 0) return null;

        const currentSwiped = swipedCount.value - 1;
        swipedCount.value = currentSwiped;
        const assetIndex = currentSwiped;

        const prevSlot = (activeSlot.value - 1 + TOTAL_SLOTS) % TOTAL_SLOTS;
        activeSlot.value = prevSlot;

        // Determine start position based on history
        const lastDirection = swipeHistory.current.pop() || 1; // Default to right if unknown
        const startPos = lastDirection * SCREEN_WIDTH * 1.5;

        // Snap to off-screen position immediately
        translations[prevSlot].value = startPos;

        // Animate back to center
        translations[prevSlot].value = withSpring(0, SNAPPY_SPRING);

        return {
            slotIndex: prevSlot,
            assetIndex
        };
    };

    const programmaticSwipe = (direction) => {
        const slot = activeSlot.value;
        const velocityX = direction * 500; // Simulated velocity
        const translateX = direction * SCREEN_WIDTH * 0.5; // Simulated final translation

        runOnJS(onSwipeEndJS)(translateX, velocityX, slot);
    };

    return {
        activeSlot,
        swipedCount,
        translations,
        gesture,
        undoGesture,
        programmaticSwipe
    };
};
