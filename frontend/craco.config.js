const path = require("path")

const CracoWasm = require('./plugins/craco-wasm')
const CracoCompatibility = require('./plugins/craco-compatibility')

module.exports = {
  devServer: {
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin'
    },
  },
  webpack: {
    alias: {
      "@components": path.resolve(__dirname, "./src/components"),
      "@constants": path.resolve(__dirname, "./src/constants"),
      "@hooks": path.resolve(__dirname, "./src/hooks"),
      "@utils": path.resolve(__dirname, "./src/utils"),
      "@pages": path.resolve(__dirname, "./src/pages"),
      "@workers": path.resolve(__dirname, "./src/workers"),
    },
    resolve: {
        fallback: {
          buffer: require.resolve('buffer/'),
          util: require.resolve("util/"),
        },
    },
  },
  plugins: [
    {
      plugin: CracoWasm,
    },
    {
      plugin: CracoCompatibility,
    },
  ],
  jest: {
    configure: {
      moduleNameMapper: {
        "^fetsorn(.*)$": "<rootDir>/src/mocks$1",
        "^@utils(.*)$": "<rootDir>/src/utils$1"
      }
    }
  }
}
