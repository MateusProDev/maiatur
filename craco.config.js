module.exports = {
  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      if (webpackConfig && Array.isArray(webpackConfig.plugins)) {
        // Remove ForkTsCheckerWebpackPlugin which can trigger TypeScript internal errors on Windows
        webpackConfig.plugins = webpackConfig.plugins.filter((plugin) => {
          const name = plugin && plugin.constructor && plugin.constructor.name;
          if (!name) return true;
          if (name === 'ForkTsCheckerWebpackPlugin' || name.includes('ForkTsChecker')) {
            return false;
          }
          return true;
        });

        // Suppress mini-css-extract-plugin "Conflicting order" warnings by setting ignoreOrder.
        // This avoids the build noise while we plan a proper CSS scoping/refactor.
        webpackConfig.plugins.forEach((plugin) => {
          const name = plugin && plugin.constructor && plugin.constructor.name;
          if (name === 'MiniCssExtractPlugin') {
            plugin.options = plugin.options || {};
            plugin.options.ignoreOrder = true;
          }
        });
      }
      return webpackConfig;
    }
  }
  ,
  devServer: (devServerConfig) => {
    if (!devServerConfig) return devServerConfig;

    const before = devServerConfig.onBeforeSetupMiddleware;
    const after = devServerConfig.onAfterSetupMiddleware;

    if ((before || after) && !devServerConfig.setupMiddlewares) {
      devServerConfig.setupMiddlewares = (middlewares, devServer) => {
        try {
          if (typeof before === 'function') before(devServer);
        } catch (e) {
          // don't break dev server on shim errors
          // eslint-disable-next-line no-console
          console.error('Error running onBeforeSetupMiddleware shim', e);
        }

        // keep existing middlewares intact

        try {
          if (typeof after === 'function') after(devServer);
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error('Error running onAfterSetupMiddleware shim', e);
        }

        return middlewares;
      };

      // remove legacy hooks to avoid deprecation warnings
      delete devServerConfig.onBeforeSetupMiddleware;
      delete devServerConfig.onAfterSetupMiddleware;
    }

    return devServerConfig;
  }
};
