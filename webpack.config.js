const path = require("path");

module.exports = {
  entry: {
    background: path.join(__dirname, "src/background/index.ts"),
    popup: path.join(__dirname, "src/popup/index.ts"),
    // blockedTab: path.join(__dirname, "src/blockedTab/index.ts"),
    // content: path.join(__dirname, "src/content/index.ts"),
    // options: path.join(__dirname, "src/options/index.ts"),
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  output: {
    path: path.join(__dirname, "dist/js"),
    filename: "[name].js"
  },
};
