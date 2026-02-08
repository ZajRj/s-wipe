
import { StyleSheet } from 'react-native';
import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    full: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 60,
        paddingHorizontal: 20,
        zIndex: 100,
    },
    backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#222', justifyContent: 'center', alignItems: 'center' },
    backBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    albumTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', flex: 1, textAlign: 'center' },
    card: {
        width: width * 0.94,
        height: height * 0.76,
        borderRadius: 28,
        position: 'absolute',
        backgroundColor: '#111',
        elevation: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.5,
        shadowRadius: 16,
        overflow: 'hidden'
    },
    
    image: { width: '100%', height: '100%',objectFit: 'contain' , borderRadius: 28 },
    
    overlay: { position: 'absolute', top: 60, borderWidth: 4, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 },
    keep: { left: 30, borderColor: '#4ade80', transform: [{ rotate: '-15deg' }] },
    delete: { right: 30, borderColor: '#f87171', transform: [{ rotate: '15deg' }] },
    overlayText: { fontSize: 32, fontWeight: 'bold' },
    finishedContainer: { alignItems: 'center', justifyContent: 'center' },
    finishedText: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
    exitBtn: { backgroundColor: '#222', paddingHorizontal: 30, paddingVertical: 15, borderRadius: 30 },
    exitBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    trashContainer: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
    badge: { position: 'absolute', top: -4, right: -4, backgroundColor: '#f87171', width: 18, height: 18, borderRadius: 9, justifyContent: 'center', alignItems: 'center' },
    badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
    deleteBtn: { backgroundColor: '#f87171', paddingHorizontal: 40, paddingVertical: 18, borderRadius: 36, shadowColor: "#f87171", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 10 },
    deleteBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    controlBar: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        paddingHorizontal: 20,
        width: '100%',
        position: 'absolute',
        bottom: 60,
        zIndex: 100
    },
    controlBtn: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#222',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5
    },
    undoBtnSmall: {
        width: 48,
        height: 48,
        borderRadius: 24,
    },
    deleteBtnSmall: {},
    keepBtnSmall: {},
});