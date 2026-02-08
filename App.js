
import { useState, useEffect } from 'react';
import { UIManager, Platform, LayoutAnimation } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import AlbumPicker from './components/AlbumPicker';
import Swiper from './components/Swiper';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

export default function App() {
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        setLoading(false);
        return;
      }

      const fetchedAlbums = await MediaLibrary.getAlbumsAsync({
        includeSmartAlbums: true,
      });

      const filteredAlbums = [];

      for (const album of fetchedAlbums) {
        // Manually verify that the album contains at least one photo
        const { assets } = await MediaLibrary.getAssetsAsync({
          album: album.id,
          mediaType: [MediaLibrary.MediaType.photo],
          first: 1, // We only need the first one for the thumbnail
        });

        if (assets.length > 0) {
          filteredAlbums.push({
            ...album,
            coverUri: assets[0].uri, // Use the latest photo as cover
          });
        }
      }

      // Sort albums by count (highest first)
      setAlbums(filteredAlbums.sort((a, b) => b.assetCount - a.assetCount));
      setLoading(false);
    })();
  }, []);

  const handleSelectAlbum = (album) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectedAlbum(album);
  };

  const handleBack = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectedAlbum(null);
  };

  if (!selectedAlbum) {
    return (
      <AlbumPicker
        albums={albums}
        loading={loading}
        onSelectAlbum={handleSelectAlbum}
      />
    );
  }

  return (
    <Swiper
      album={selectedAlbum}
      onBack={handleBack}
    />
  );
}
