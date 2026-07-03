const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: {
    DevTrail: "./src/DevTrail/DevTrail.tsx"
  },
  output: {
    filename: "[name]/[name].js",
    path: path.resolve(__dirname, "dist"),
    publicPath: "./",
    clean: true
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
    alias: {
      "azure-devops-extension-sdk": path.resolve(
        __dirname,
        "node_modules/azure-devops-extension-sdk"
      )
    }
  },
  module: {
    rules: [
      { test: /\.tsx?$/, loader: "ts-loader", exclude: /node_modules/ },
      { test: /\.css$/, use: ["style-loader", "css-loader"] }
    ]
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [{ from: "src/DevTrail/DevTrail.html", to: "DevTrail/DevTrail.html" }]
    })
  ],
  devtool: "source-map",
  performance: { hints: false }
};
