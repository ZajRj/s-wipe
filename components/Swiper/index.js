import { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import CardSlot from '../CardSlot';
import ReviewScreen from '../ReviewScreen';
import { styles } from './styles';
import { SLOTS } from './constants';
import { useAlbumAssets, useSwipeGesture } from './hooks';

export default function Swiper({ album, onBack, onAlbumUpdate }) {
    const {
        assets,
        loading,
        slots,
        finished,
        setFinished,
        updateSlotUri,
        totalAssetsRef,
        addToDeletedBuffer,
        deletedAssets,
        deleteBufferedAssets,
        removeAssetFromDeleteBuffer,
        restoreSlot
    } = useAlbumAssets(album);

    const [showReview, setShowReview] = useState(false);

    const {
        activeSlot,
        swipedCount,
        translations,
        gesture,
        undoGesture,
        programmaticSwipe,
        currentIndex
    } = useSwipeGesture({
        totalAssetsRef,
        setFinished,
        updateSlotUri,
        onAction: (type, slotIndex) => {
            if (type === 'DELETE') {
                const slot = slots[slotIndex];
                if (slot?.id) addToDeletedBuffer({ id: slot.id, uri: slot.uri });
            }
        }
    });

    // Reset translation values when album changes
    useEffect(() => {
        swipedCount.value = 0;
        translations.forEach(t => t.value = 0);
    }, [album]);

    const handleReviewToggle = () => {
        setShowReview(true);
    };

    const handleConfirmDelete = async () => {
        const count = deletedAssets.length;
        const success = await deleteBufferedAssets();
        if (success) {
            if (onAlbumUpdate) {
                onAlbumUpdate(album.id, count);
            }
            onBack();
        }
    };

    const handleUndo = () => {
        const result = undoGesture();
        if (result) {
            // Restore proper data state
            restoreSlot(result.slotIndex, result.assetIndex);
        }
    };

    const handleSwipeLeft = () => {
        programmaticSwipe(-1);
    };

    const handleSwipeRight = () => {
        programmaticSwipe(1);
    };

    if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#fff" /></View>;

    if (showReview) {
        return (
            <ReviewScreen 
                assets={deletedAssets}
                onConfirm={handleConfirmDelete}
                onCancel={() => setShowReview(false)}
                onRestore={removeAssetFromDeleteBuffer}
            />
        );
    }

    return (
        <GestureHandlerRootView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backBtn}><Text style={styles.backBtnText}>✕</Text></TouchableOpacity>
                <View style={{ flex: 1, alignItems: 'center' }}>
                    <Text style={styles.albumTitle} numberOfLines={1}>{album.title}</Text>
                    <Text style={{ color: '#888', fontSize: 12, marginTop: 2 }}>{Math.min(currentIndex, assets.length)} of {assets.length}</Text>
                </View>

                <TouchableOpacity
                    style={styles.trashContainer}
                    onPress={handleReviewToggle}
                    disabled={deletedAssets.length === 0}
                >
                    <MaterialCommunityIcons
                        name="trash-can-outline"
                        size={24}
                        color={deletedAssets.length > 0 ? "#f87171" : "#444"}
                    />
                    {deletedAssets.length > 0 && (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{deletedAssets.length}</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            <View style={styles.full}>
                {finished ? (
                    <Animated.View entering={FadeIn.duration(400)} style={styles.finishedContainer}>
                        <Text style={styles.finishedText}>All Swiped! ✨</Text>

                        {deletedAssets.length > 0 ? (
                            <TouchableOpacity style={styles.deleteBtn} onPress={handleReviewToggle}>
                                <Text style={styles.deleteBtnText}>Review {deletedAssets.length} Photos</Text>
                            </TouchableOpacity>
                        ) : (
                            <Text style={{ color: '#888', marginBottom: 20 }}>No photos to delete.</Text>
                        )}

                        <TouchableOpacity style={[styles.exitBtn, { marginTop: 20 }]} onPress={onBack}>
                            <Text style={styles.exitBtnText}>Exit</Text>
                        </TouchableOpacity>
                    </Animated.View>
                ) : (
                    <View style={styles.full}>
                        <GestureDetector gesture={gesture}>
                            <Animated.View entering={FadeIn.duration(400)} exiting={FadeOut.duration(300)} style={styles.full}>
                                {SLOTS.map((i) => (
                                    <CardSlot
                                        key={i}
                                        index={i}
                                        activeSlot={activeSlot}
                                        translation={translations[i]}
                                        topTranslation={translations}
                                        uri={slots[i]?.uri}
                                        absoluteIndex={slots[i]?.absoluteIndex || 0}
                                        total={assets.length}
                                    />
                                ))}
                            </Animated.View>
                        </GestureDetector>

                        <View style={styles.controlBar}>
                            <TouchableOpacity style={[styles.controlBtn, styles.deleteBtnSmall]} onPress={handleSwipeLeft}>
                                <MaterialCommunityIcons name="close" size={30} color="#ef4444" />
                            </TouchableOpacity>

                            <TouchableOpacity style={[styles.controlBtn, styles.undoBtnSmall]} onPress={handleUndo}>
                                <MaterialCommunityIcons name="undo-variant" size={24} color="#f59e0b" />
                            </TouchableOpacity>

                            <TouchableOpacity style={[styles.controlBtn, styles.keepBtnSmall]} onPress={handleSwipeRight}>
                                <MaterialCommunityIcons name="check" size={30} color="#10b981" />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </View>
        </GestureHandlerRootView>
    );
}