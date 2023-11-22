<template>
  <div class="map" id="map" ref="myMap"></div>
  <button @click="onResetClick">reset</button>
</template>

<script setup lang="ts">
import { Feature, Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import { transform } from "ol/proj";
import { Vector, XYZ } from "ol/source";
import { onMounted, ref } from "vue";
import VectorLayer from "ol/layer/Vector";
import { Point } from "ol/geom";

const map = ref();
onMounted(() => {
  initMap();
  addEvent();
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
const onResetClick = () => {
  map.value.getView().animate({
    center: transform([114.3, 30.5], "EPSG:4326", "EPSG:3857"),
    zoom: 10,
    duration: 1000
  });
};
const addEvent = () => {
  const source = new Vector({});
  const layer = new VectorLayer({ source });
  map.value.addLayer(layer);
  map.value.on("click", (evt: any) => {
    const { coordinate } = evt;
    const point = new Feature({
      geometry: new Point(coordinate)
    });
    source.addFeature(point);

    // 点击漫游
    map.value.getView().animate({ center: coordinate });
  });
};
</script>

<style lang="scss" scoped>
.map {
  width: 100vw;
  height: 90vh;
}
</style>
