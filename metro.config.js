// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Excluir la carpeta supabase/functions del bundler
// (las Edge Functions se deployean aparte, no son parte de la app)
config.resolver.blockList = [
  /supabase\/functions\/.*/,
];

module.exports = withNativeWind(config, { input: "./global.css" });
