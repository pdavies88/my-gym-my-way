// https://docs.expo.dev/guides/customizing-metro/
const { getDefaultConfig } = require('expo/metro-config');
const path = require('node:path');

const config = getDefaultConfig(__dirname);

// three 0.186+ ships a CommonJS shim that calls `process.emitWarning`, which React Native lacks.
// Resolve `three` to its ES module build so the shim never loads.
const threeModule = path.resolve(__dirname, 'node_modules/three/build/three.module.js');
const upstreamResolve = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'three') return { type: 'sourceFile', filePath: threeModule };
  return (upstreamResolve ?? context.resolveRequest)(context, moduleName, platform);
};

module.exports = config;
