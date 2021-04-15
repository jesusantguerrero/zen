const { clear } = require("console");
const path = require("path");

module.exports = {
  stories: ["../src/**/*.stories.mdx", "../src/**/*.stories.@(js|jsx|ts|tsx)"],
  plugins: [
    require('tailwindcss'),
    require('autoprefixer')
  ],
  webpackFinal: async (config, { configType }) => {
    config.module.rules.push({
      test: /\.scss$/,
      use: [
        "style-loader",
        "css-loader",
        {
          loader: "sass-loader",
          options: {
            additionalData: '@import "@/assets/scss/main.scss";'
          }
        },
      ],
      include: path.resolve(__dirname, "../"),
    });

    config.resolve.alias["@"] = path.resolve(__dirname, "../src/");
    config.resolve.alias["@atoms"] = path.resolve(
      __dirname,
      "../src/components/atoms"
    );

    return config;
  },
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    {
      name: "@storybook/addon-postcss",
      options: {
        postcssLoaderOptions: {
          implementation: require("postcss")
        },
      },
    },
  ],
};
