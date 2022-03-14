const URL = "https://us-central1-blog-test01-ec54b.cloudfunctions.net";
const MomentLocalesPlugin = require("moment-locales-webpack-plugin");

require("dotenv").config();

export default {
  mode: "universal",
  /*
   ** Headers of the page
   */
  head: {
    title: process.env.npm_package_name || "",
    script: [
      {
        src: "https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js",
      },
      { src: "https://js.stripe.com/v3" },
      {
        src: "https://cdn.jsdelivr.net/gh/fengyuanchen/compressorjs/dist/compressor.min.js",
      },

      {
        src: "https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@10.2.0/build/highlight.min.js",
      },
      {
        src: "https://cdnjs.cloudflare.com/ajax/libs/medium-editor/5.23.3/js/medium-editor.js",
      },
      {
        src: "https://unpkg.com/embedo/embedo.min.js",
      },
    ],
    meta: [
      { charset: "utf-8" },
      {
        name: "viewport",
        content:
          "width=device-width, initial-scale=1, maximum-scale=1.0, user-scalable=0",
      },
      {
        hid: "description",
        name: "description",
        content: process.env.npm_package_description || "",
      },
    ],
    link: [
      { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
      {
        rel: "stylesheet",
        href: "//fonts.googleapis.com/css?family=Roboto:400,500,700,400italic|Material+Icons",
      },
      {
        rel: "stylesheet",
        href: "https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css",
      },
      {
        rel: "stylesheet",
        href: "https://cdn.jsdelivr.net/npm/@voerro/vue-tagsinput@2.2.0/dist/style.css",
      },
      {
        rel: "stylesheet",
        href: "//cdn.jsdelivr.net/gh/highlightjs/cdn-release@10.2.0/build/styles/default.min.css",
      },
      {
        rel: "stylesheet",
        href: "https://cdnjs.cloudflare.com/ajax/libs/medium-editor/5.23.3/css/medium-editor.min.css",
      },
      {
        rel: "stylesheet",
        href: "https://cdnjs.cloudflare.com/ajax/libs/medium-editor/5.23.3/css/themes/default.css",
      },
      { rel: "stylesheet", href: "/css/default.css" },
      // { rel: "stylesheet", href: "/vuejs-medium-editor/css/default.css" }, // https://github.com/manuelgeek/vuejs-medium-editor/blob/master/src/themes/default.css
      { rel: "stylesheet", href: "/vuejs-medium-editor/css/extend.css" },
      {
        rel: "stylesheet",
        href: "/path/to/medium-editor-embed-button.min.css",
      },
    ],
  },

  // /*
  //  ** Customize the progress-bar color
  //  */
  loading: { color: "#fff" },
  // /*
  //  ** Global CSS
  //  */
  // css: [],
  // /*
  //  ** Plugins to load before mounting the App
  //  */
  plugins: [
    { src: "~/plugins/firebase", ssr: false },
    { src: "~/plugins/vue-select.js", ssr: false },
    { src: "~/plugins/vue-infinite-loading", ssr: false },
    { src: "~/plugins/vue-tagsinput", ssr: false },
    { src: "~/plugins/medium-zoom", ssr: false },
  ],
  // /*
  //  ** Nuxt.js dev-modules
  //  */
  buildModules: [
    "@nuxtjs/vuetify",
    ["@nuxtjs/google-analytics", { id: "UA-159174546-1" }],
    "@nuxtjs/dotenv",
    "@nuxtjs/device",
  ],
  // vuetify: {
  //   /* module options */
  // },
  /*
   ** Nuxt.js modules
   */

  modules: ["@nuxtjs/axios"],
  /*
   ** Axios module configuration
   ** See https://axios.nuxtjs.org/options
   */
  axios: {
    proxy: true,
    prefix: "/api",
  },
  proxy: {
    "/api": {
      target: URL,
      pathRewrite: {
        "^/api/": "/",
      },
    },
  },
  // proxy: { "/api/": { target: "http://localhost:9001" } },

  // /*
  //  ** Build configuration
  //  */
  build: {
    /*
     ** You can extend webpack config here
     */
    analyze: true,
    plugins: [new MomentLocalesPlugin()],

    extend(config) {
      config.performance = config.performance || {};
      config.performance.maxEntrypointSize = 2700 * 1024;
      config.performance.maxAssetSize = 1000 * 1024;
      config.devtool = "source-map";
    },
  },

  router: {
    // extendRoutes(routes, resolve) {
    // routes
    //   .push
    //   {
    //     name: "profile",
    //     path: "/:profile",
    //     component: resolve(__dirname, "pages/profile/profile.vue")
    //   },
    //   {
    //     name: "detailpost",
    //     path: "/:detailpost",
    //     component: resolve(__dirname, "pages/detailpost.vue")
    //   }
    //   ();
    // }
  },
};
