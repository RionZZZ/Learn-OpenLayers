<template>
  <div class="routes">
    Routes:
    <router-link to="/">index</router-link>
    <router-link to="/map">Map</router-link>
    <router-link to="/mark">Mark</router-link>
    <router-link to="/static">Static</router-link>
    <router-link to="/popup">Popup</router-link>
    <router-link to="/event">Event</router-link>
    <router-link to="/track">Track</router-link>
    <router-link to="/draw">Draw</router-link>
    <router-link to="/free-draw">FreeDraw</router-link>
    <router-link to="/cluster">Cluster</router-link>
  </div>
  <div class="map" id="map" ref="myMap"></div>
</template>

<script setup lang="ts">
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import { transform } from "ol/proj";
import { XYZ } from "ol/source";
import { onMounted, ref } from "vue";

const map = ref();
onMounted(() => {
  initMap();
});
const initMap = () => {
  const amap = new TileLayer({
    source: new XYZ({
      url: "http://wprd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=7&x={x}&y={y}&z={z}",
      wrapX: false
    })
  });
  map.value = new Map({
    target: "map",
    layers: [amap],
    view: new View({
      center: transform([114.3, 30.5], "EPSG:4326", "EPSG:3857"),
      zoom: 12,
      minZoom: 3
    })
  });
};
</script>

<style lang="scss" scoped>
.map {
  width: 100vw;
  height: 100vh;
}
.routes {
  a {
    padding: 0 10px;
    text-decoration: underline;
  }
}
</style>
