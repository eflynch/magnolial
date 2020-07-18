var webpack = require('webpack');
var path = require('path');
var WebpackNotifierPlugin = require('webpack-notifier');

var BUILD_DIR = path.resolve(__dirname, 'app')
var APP_DIR = path.resolve(__dirname, 'src')

var config = {
    entry: APP_DIR + '/main.js',
    mode: "development",
    output: {
        path: BUILD_DIR,
        filename: 'main.js'
    },
    module: {
        rules: [
            {
                test: /\.jsx?/,
                include: APP_DIR,
                loader: 'babel-loader'
            },
        ]
    },
    plugins: [
        new WebpackNotifierPlugin(),
    ]
};

module.exports = config;
