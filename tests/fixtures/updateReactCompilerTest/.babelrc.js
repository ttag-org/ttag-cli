module.exports = function(api) {
    api.cache(true);
    return {
        presets: [],
        plugins: [
            ["babel-plugin-react-compiler"]
        ]
    };
};
