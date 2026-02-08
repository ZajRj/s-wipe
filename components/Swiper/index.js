
import { useEffect } from 'react';
import { View, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import CardSlot from '../CardSlot';
import { styles } from './styles';
import { SLOTS } from './constants';
import { useAlbumAssets, useSwipeGesture } from './hooks';

export default function Swiper({ album, onBack }) {
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

    const {
        activeSlot,
        swipedCount,
        translations,
        gesture,
        undoGesture,
        programmaticSwipe
    } = useSwipeGesture({
        totalAssetsRef,
        setFinished,
        updateSlotUri,
        onAction: (type, slotIndex) => {
            if (type === 'DELETE') {
                const slot = slots[slotIndex];
                if (slot?.id) addToDeletedBuffer(slot.id);
            }
        }
    });

    // Reset translation values when album changes
    useEffect(() => {
        swipedCount.value = 0;
        translations.forEach(t => t.value = 0);
    }, [album]);

    const handleDelete = async () => {
        const success = await deleteBufferedAssets();
        if (success) {
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

    return (
        <GestureHandlerRootView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backBtn}><Text style={styles.backBtnText}>✕</Text></TouchableOpacity>
                <Text style={styles.albumTitle} numberOfLines={1}>{album.title}</Text>

                <TouchableOpacity
                    style={styles.trashContainer}
                    onPress={handleDelete}
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
                            <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
                                <Text style={styles.deleteBtnText}>Delete {deletedAssets.length} Photos</Text>
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