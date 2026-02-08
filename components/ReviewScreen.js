import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions, Modal } from 'react-native';
import { Image } from 'expo-image';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');
const ITEM_SIZE = (width - 40) / 3;

export default function ReviewScreen({ assets, onConfirm, onCancel, onRestore }) {
    const [focusedAsset, setFocusedAsset] = useState(null);

    // Fallback if empty (should be handled by parent, but safe to have)
    if (!assets || assets.length === 0) {
        return null;
    }

    const handleRestore = (id) => {
        onRestore(id);
        if (focusedAsset?.id === id) {
            setFocusedAsset(null);
        }
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity 
            style={styles.itemContainer}
            onPress={() => setFocusedAsset(item)}
            activeOpacity={0.7}
        >
            <Image 
                source={item.uri} 
                style={styles.thumbnail}
                cachePolicy="memory-disk"
            />
            <TouchableOpacity 
                style={styles.restoreBtn} 
                onPress={() => handleRestore(item.id)}
            >
                <MaterialCommunityIcons name="restore" size={20} color="#fff" />
            </TouchableOpacity>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Review Deletion</Text>
                <Text style={styles.subtitle}>{assets.length} items to delete</Text>
            </View>

            <FlatList
                data={assets}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                numColumns={3}
                contentContainerStyle={styles.grid}
            />

            <View style={styles.footer}>
                <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
                    <Text style={styles.cancelText}>Keep Swiping</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.confirmBtn} onPress={onConfirm}>
                    <Text style={styles.confirmText}>Delete All</Text>
                </TouchableOpacity>
            </View>

            <Modal
                visible={!!focusedAsset}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setFocusedAsset(null)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalCloseArea}>
                         {focusedAsset && (
                            <Image 
                                source={focusedAsset.uri} 
                                style={styles.fullImage}
                                contentFit="contain"
                            />
                        )}
                    </View>

                    <View style={styles.modalControls}>
                        <TouchableOpacity 
                            style={[styles.modalBtn, { backgroundColor: '#333' }]}
                            onPress={() => setFocusedAsset(null)}
                        >
                             <MaterialCommunityIcons name="close" size={24} color="#fff" />
                             <Text style={[styles.modalBtnText, { marginLeft: 8 }]}>Close</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            style={[styles.modalBtn, { backgroundColor: '#4ade80' }]}
                            onPress={() => handleRestore(focusedAsset.id)}
                        >
                             <MaterialCommunityIcons name="restore" size={24} color="#fff" />
                             <Text style={[styles.modalBtnText, { marginLeft: 8 }]}>Restore</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000', paddingTop: 60 },
    header: { paddingHorizontal: 20, marginBottom: 20 },
    title: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
    subtitle: { color: '#888', fontSize: 16, marginTop: 4 },
    grid: { paddingHorizontal: 15, paddingBottom: 100 },
    itemContainer: { width: ITEM_SIZE, height: ITEM_SIZE, margin: 5, position: 'relative' },
    thumbnail: { width: '100%', height: '100%', borderRadius: 8, backgroundColor: '#222' },
    restoreBtn: {
        position: 'absolute',
        top: 4,
        right: 4,
        backgroundColor: 'rgba(0,0,0,0.6)',
        borderRadius: 20,
        padding: 4,
        zIndex: 10
    },
    footer: {
        position: 'absolute',
        bottom: 40,
        left: 20,
        right: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 15
    },
    cancelBtn: {
        flex: 1,
        backgroundColor: '#333',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center'
    },
    confirmBtn: {
        flex: 1,
        backgroundColor: '#ef4444',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center'
    },
    cancelText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    confirmText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.95)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    modalCloseArea: {
        flex: 1,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    fullImage: {
        width: width,
        height: height * 0.8,
    },
    modalControls: {
        position: 'absolute',
        bottom: 50,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
        width: '100%'
    },
    modalBtn: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 30,
        flexDirection: 'row',
        alignItems: 'center'
    },
    modalBtnText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16
    }
});
