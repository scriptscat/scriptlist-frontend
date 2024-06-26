/**
 * @type {import('@remix-run/dev').AppConfig}
 */
module.exports = {
  serverDependenciesToBundle: ["lodash-es"],
  ignoredRouteFiles: ['**/.*', '**/*.css'],
  // appDirectory: "app",
  // assetsBuildDirectory: "public/build",
  // serverBuildPath: "build/index.js",
  // publicPath: "/build/",
  future: {
    v2_meta: true,
    unstable_tailwind: true,
  },
};
