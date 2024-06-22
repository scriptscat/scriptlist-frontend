const {
  createRoutesFromFolders,
} = require("@remix-run/v1-route-convention");
/**
 * @type {import('@remix-run/dev').AppConfig}
 */
module.exports = {
  serverDependenciesToBundle: ['axios', 'marked', 'lodash-es'],
  ignoredRouteFiles: ['**/.*', '**/*.css'],
  tailwind: true,
  // appDirectory: "app",
  // assetsBuildDirectory: "public/build",
  // serverBuildPath: "build/index.js",
  // publicPath: "/build/",
  future: {
    v2_dev: {
      port: 8002,
    },
    v2_meta: true,
    v2_errorBoundary: true,
    v2_normalizeFormMethod: true,
    v2_headers: true,
    v2_routeConvention: true,
  },
  routes(defineRoutes) {
    // uses the v1 convention, works in v1.15+ and v2
    return createRoutesFromFolders(defineRoutes);
  },
  serverModuleFormat: 'cjs',
};
