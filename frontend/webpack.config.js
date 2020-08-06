const TerserWebpackPlugin = require("terser-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const autoPrefixPlugin = require("autoprefixer");
const WebpackModuleNoModulePlugin = require("webpack-module-nomodule-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const { basename } = require("path");

const isProd = basename(__filename).includes(".prod");

const mode = isProd ? "production" : "development";
const cfg = require("./.babelrc");
function prodOrDev(a, b) {
  return isProd ? a : b;
}

const jsLoaderOptions = (isLegacy) => ({
  test: /\.m?js$/,
  exclude: /(node_modules\/(?!@hydrophobefireman))|(injectables)/,
  use: {
    loader: "babel-loader",
    options: cfg.env[isLegacy ? "legacy" : "modern"],
  },
});
const cssLoaderOptions = {
  test: /\.css$/,
  use: [
    { loader: MiniCssExtractPlugin.loader },
    {
      loader: "css-loader",
    },
    {
      loader: "postcss-loader",
      options: { ident: "postcss", plugins: [autoPrefixPlugin()] },
    },
  ],
};
const contentLoaderOptions = {
  test: /\.(png|jpg|gif|ico|svg)$/,
  use: [{ loader: "url-loader", options: { fallback: "file-loader" } }],
};
function getCfg(isLegacy) {
  return {
    cache: {
      type: "filesystem",

      buildDependencies: {
        config: [__filename],
      },
    },
    devServer: {
      contentBase: `${__dirname}/docs`,
      compress: !0,
      port: 4200,
      historyApiFallback: true,
    },
    module: {
      rules: [
        jsLoaderOptions(isLegacy),
        cssLoaderOptions,
        contentLoaderOptions,
      ],
    },
    entry: `${__dirname}/static/App.js`,
    output: {
      path: `${__dirname}/docs`,
      filename: `[name]/${isLegacy ? "legacy" : "es6"}/[contenthash].js`,
      ecmaVersion: isLegacy ? 5 : 6,
    },
    mode,
    optimization: {
      minimizer: prodOrDev(
        [
          new TerserWebpackPlugin({ parallel: !0 }),
          new OptimizeCSSAssetsPlugin({}),
        ],
        []
      ),
      splitChunks: {
        chunks: "all",
      },
    },
    plugins: [
      new HtmlWebpackPlugin({
        templateParameters: async function templateParametersGenerator(
          compilation,
          assets,
          assetTags,
          options
        ) {
          return {
            compilation: compilation,
            webpackConfig: compilation.options,
            htmlWebpackPlugin: {
              tags: assetTags,
              files: assets,
              options: Object.assign(options, {
                mouseOrTouch: await require("./injectables/getMouseOrTouch.js").create(),
                preloadPaths: await require("./injectables/preloadPaths.js").create(),
                preconnectOrigins: require("./injectables/createLinkTags.js").create(
                  require("./injectables/preconnectOrigins.json"),
                  "preconnect"
                ),
              }),
            },
          };
        },
        inject: "body",
        template: `${__dirname}/index.html`,
        xhtml: !0,
        favicon: "./favicon.ico",
        minify: prodOrDev(
          {
            collapseBooleanAttributes: !0,
            collapseWhitespace: !0,
            html5: !0,
            minifyCSS: !0,
            removeEmptyAttributes: !0,
            removeRedundantAttributes: !0,
          },
          !1
        ),
      }),
      new WebpackModuleNoModulePlugin(isLegacy ? "legacy" : "modern"),
      new MiniCssExtractPlugin({
        filename: "[name]/[hash].css",
      }),
    ],
  };
}

module.exports = isProd ? [getCfg(false), getCfg(true)] : getCfg(false);
