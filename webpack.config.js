const path = require('path');
const CopyPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
    // mode: 'development', // development oder production

    entry: './src/index.js',

    node: {
        global: false,
        __filename: false,
        __dirname: false,

    },

    resolve: {

        fallback: {
            "fs": false,
            "path": false,
            "crypto": false,
        }
    },

    plugins: [
        new CopyPlugin({
            patterns: [
                { from: 'node_modules/sql.js/dist/sql-wasm.wasm', to: '' },
                { from: 'src/index.html', to: '' },
                { from: 'src/data', to: 'data' },
                { from: 'src/icons', to: 'icons' },
                { from: 'src/images', to: 'images' },
            ],
        }),
        new MiniCssExtractPlugin(),
    ],

    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'dist'),
        clean: true,
    },

    devServer: {
        contentBase: 'dist', //Hier sucht der Webserver nach Dateien
    },

    module: {
        rules: [
          /*{
            test: /\.css$/i,
            use: ['style-loader', 'css-loader'],
          },*/
          {
            test: /\.(woff|woff2|eot|ttf|otf)$/i,
            type: 'asset/resource',
          },
          {
            test: /\.css$/i,
            use: [MiniCssExtractPlugin.loader, "css-loader"],
          },
        ],
      },
};