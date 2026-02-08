import { useAnimatedStyle, interpolate, Extrapolation, withSpring } from 'react-native-reanimated';
import Animated from 'react-native-reanimated';
import { Image } from 'expo-image';
import { StyleSheet, Text } from 'react-native';
import { SLOTS, TOTAL_SLOTS, SNAPPY_SPRING, SCREEN_WIDTH as width } from '../Swiper/constants';
import { styles } from '../Swiper/styles';

export default function CardSlot({ index, activeSlot, translation, topTranslation, uri }) {
    const style = useAnimatedStyle(() => {
        const currentActive = activeSlot.value;
        const diff = (index - currentActive + TOTAL_SLOTS) % TOTAL_SLOTS;

        const isTop = diff === 0;
        const isNext = diff === 1;
        const topTx = topTranslation[currentActive].value;

        let zIdx = 1;
        if (Math.abs(translation.value) > 0) zIdx = 20;
        else if (isTop) zIdx = 10;
        else if (isNext) zIdx = 5;

        const baseScale = isTop ? 1 : isNext ? 0.92 : 0.85;
        const dragScale = isNext ? interpolate(Math.abs(topTx), [10, width * 0.8], [0, 0.08], Extrapolation.CLAMP) : 0;

        const baseOpacity = isTop ? 1 : isNext ? 0.6 : 0;
        const dragOpacity = isNext ? interpolate(Math.abs(topTx), [10, width * 0.8], [0, 0.4], Extrapolation.CLAMP) : 0;

        return {
            transform: [
                { translateX: translation.value },
                { rotate: isTop || Math.abs(translation.value) > 0 ? `${translation.value / 22}deg` : '0deg' },
                { scale: withSpring(baseScale + dragScale, SNAPPY_SPRING) },
            ],
            zIndex: zIdx,
            opacity: withSpring(baseOpacity + dragOpacity, SNAPPY_SPRING),
        };
    });

    const keepStyle = useAnimatedStyle(() => ({
        opacity: interpolate(translation.value, [0, width * 0.3], [0, 1], Extrapolation.CLAMP),
    }));

    const deleteStyle = useAnimatedStyle(() => ({
        opacity: interpolate(translation.value, [0, -width * 0.3], [0, 1], Extrapolation.CLAMP),
    }));

    return (
        <Animated.View style={[styles.card, style]}>
            <Image
                key={uri}
                source={uri}
                style={styles.image}
                contentFit="cover"
                cachePolicy="memory-disk"
            />
            <Animated.View style={[styles.overlay, styles.keep, keepStyle]}>
                <Text style={[styles.overlayText, { color: '#4ade80' }]}>KEEP</Text>
            </Animated.View>
            <Animated.View style={[styles.overlay, styles.delete, deleteStyle]}>
                <Text style={[styles.overlayText, { color: '#f87171' }]}>DELETE</Text>
            </Animated.View>
        </Animated.View>
    );
};