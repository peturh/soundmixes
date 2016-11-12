/**
 * Webpack config file, some stuff that's not needed for this project, but it's just my standard go-to config file.
 *
 */

var path = require('path');
var webpack = require('webpack');
var CopyWebpackPlugin = require('copy-webpack-plugin');

// Directory path constants
var JS_PATH = path.resolve(__dirname, "src/js/");
var LESS_PATH = path.resolve(__dirname, "src/less/");
var PARTS_PATH = path.resolve(__dirname, "src/parts/");

var DIST_PATH = path.resolve(__dirname, "dist");

module.exports = {

    entry: {
        javascript: __dirname + "/src/entry"
    },

    output: {
        path: DIST_PATH,
        filename: 'bundle.js'
    },
    resolve: {
        extensions: ["", ".js"],
        root: [ JS_PATH, LESS_PATH, PARTS_PATH ],
        modulesDirectories: ['lib', 'node_modules']
    },
    module: {
        preLoaders: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: "jshint-loader"
            }
        ],
        loaders: [
            {
                test: /index.html/,
                loader: 'file?name=[name].[ext]'
            },
            {
                test: /\.html$/,
                exclude: /index.html/,
                loader: 'ngtemplate?relativeTo=' + ( PARTS_PATH ) + '/!html'
            },
            {
                test: /\.less$/,
                loader: "style!css!less"
            },
            {
                test: /\.css$/,
                loader: "style!css"
            },
            {
                test: /[\/\\]node_modules[\/\\]some-legacy-script[\/\\]index\.js$/,
                loader: "legacy"
            }
        ]
    },
    jshint: {
        camelcase: true,
        emitErrors: false,
        failOnHint: false,

        reporter: function (errors) {
            if (errors && errors.length) {
                console.log('Notice: There are ' + errors.length + ' jshint errors');
            }
        }
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            include: /\.min\.js$/,
            minimize: true,
            sourceMap: false,
            mangle: true
        }),

        new CopyWebpackPlugin([
            { from: 'src/assets', to: 'assets' },
            {from : 'src/index.html' ,to:'index.html'}])
    ],
    watch: false
};
