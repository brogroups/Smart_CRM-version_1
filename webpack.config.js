const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

module.exports = {
    target: 'node', 
    resolve: {
        fallback: {
            fs: false, 
            path: require.resolve('path-browserify'),
        },
    },
    plugins: [
        new NodePolyfillPlugin(),
    ],
};