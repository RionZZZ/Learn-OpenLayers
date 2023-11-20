import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import "ol/ol.css";
import { createRouter, createWebHashHistory } from "vue-router";

import Map from "./views/map.vue";
import Draw from "./views/draw.vue";

const routes = [
  { path: "/map", component: Map },
  { path: "/draw", component: Draw }
];
const router = createRouter({
  history: createWebHashHistory(),
  routes
});

createApp(App).use(router).mount("#app");
