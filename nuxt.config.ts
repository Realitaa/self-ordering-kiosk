// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    "@nuxt/eslint",
    "@nuxt/ui",
    "@vueuse/nuxt",
    "@pinia/nuxt",
    "nuxt-auth-utils",
  ],

  devtools: {
    enabled: true,
  },

  css: ["~/assets/css/main.css"],

  routeRules: {
    "/": { prerender: true },
  },

  compatibilityDate: "2025-01-15",

  eslint: {
    config: {
      stylistic: {
        commaDangle: "never",
        braceStyle: "1tbs",
      },
    },
  },

  fonts: {
    families: [{ name: "Funnel Sans", provider: "google" }],
  },

  vite: {
    optimizeDeps: {
      include: ["zod", "dayjs", "dayjs/locale/id"],
    },
  },

  runtimeConfig: {
    sessionTokenAge: 1,
  },

  nitro: {
    externals: {
      external: ['pg-native']
    }
  },
});