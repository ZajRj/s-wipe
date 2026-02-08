import { View, Text, FlatList, TouchableOpacity, Dimensions } from 'react-native';
import { Image } from 'expo-image'; // High-performance image component
import { styles } from './styles';

const COLUMN_COUNT = 2;

export default function AlbumPicker({ albums, loading, onSelectAlbum }) {

    const renderAlbum = ({ item }) => (
        <TouchableOpacity
            style={styles.albumCard}
            onPress={() => onSelectAlbum(item)}
            activeOpacity={0.8}
        >
            <Image
                source={item.coverUri}
                style={styles.albumArt}
                contentFit="cover"
                transition={200}
            />
            <View style={styles.albumInfo}>
                <Text style={styles.albumTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.albumCount}>{item.assetCount} Photos</Text>
            </View>
        </TouchableOpacity>
    );

    if (loading) return <View style={styles.center}><Text style={{ color: '#fff' }}>Loading Albums...</Text></View>;

    return (
        <View style={styles.container}>
            <Text style={styles.header}>S-WIPE</Text>
            <FlatList
                data={albums}
                renderItem={renderAlbum}
                keyExtractor={(item) => item.id}
                numColumns={COLUMN_COUNT}
                contentContainerStyle={styles.listContent}
                columnWrapperStyle={styles.row}
            />
        </View>
    );
}

