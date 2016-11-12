/**
 * This file is used for developing with webpack
 * It compiles new changes instantly instead of having to build each change
 *
 */

const webpack = require("webpack");
const config = require("./webpack.config");
const WebpackDevServer = require("webpack-dev-server");

/**
 * Proxy the requests to our server that goes to the api
 *
 */
const server = new WebpackDevServer(webpack(config), {
        proxy: {
            "*": 'http://localhost:9090'
        }
    }
);
server.listen(9099, 'localhost');
