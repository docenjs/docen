import { defineNuxtConfig } from "nuxt/config";

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  ssr: false,
  app: {
    keepalive: true,
  },
  typescript: {
    tsConfig: {
      compilerOptions: {
        forceConsistentCasingInFileNames: true,
      },
    },
  },
  experimental: {
    payloadExtraction: false,
  },
});
