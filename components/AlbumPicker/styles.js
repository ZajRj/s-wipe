import { StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 2;
const ITEM_WIDTH = (width - 40) / COLUMN_COUNT;

export const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000', paddingTop: 60 },
    center: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
    header: { color: '#fff', fontSize: 32, fontWeight: '800', marginHorizontal: 20, marginBottom: 20 },
    listContent: { paddingHorizontal: 15 },
    row: { justifyContent: 'space-between' },
    albumCard: {
        width: ITEM_WIDTH,
        marginBottom: 20,
    },
    albumArt: {
        width: ITEM_WIDTH,
        height: ITEM_WIDTH,
        borderRadius: 12,
        backgroundColor: '#1a1a1a'
    },
    albumInfo: { marginTop: 8, paddingHorizontal: 4 },
    albumTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    albumCount: { color: '#666', fontSize: 13, marginTop: 2 },
});