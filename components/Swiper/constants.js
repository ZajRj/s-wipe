
import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const SCREEN_WIDTH = width;
export const SCREEN_HEIGHT = height;

export const SLOTS = [0, 1, 2, 3, 4, 5];
export const TOTAL_SLOTS = SLOTS.length;

export const SNAPPY_SPRING = {
    damping: 15,
    stiffness: 180,
    mass: 0.8,
};
