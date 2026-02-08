module.exports = function (api) {
    api.cache(true);
    return {
        presets: ['babel-preset-expo'],
        plugins: [
            // This must ALWAYS be the last plugin in the list
            'react-native-reanimated/plugin',
            
        ],
    };
};