<template>
  <div class="map" id="map" ref="myMap"></div>
</template>

<script setup lang="ts">
import { Feature, Map, View } from "ol";
import { Point } from "ol/geom";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import { transform } from "ol/proj";
import { Vector, XYZ } from "ol/source";
import { Circle, Fill, Stroke, Style } from "ol/style";
import { onMounted, ref } from "vue";

const map = ref();
onMounted(() => {
  initMap();

  addPoint();
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

const pointStyle = new Style({
  image: new Circle({
    radius: 8,
    fill: new Fill({ color: "#f00" }),
    stroke: new Stroke({ color: "#333", width: 2 })
  })
});
const addPoint = () => {
  const point = new Feature({
    geometry: new Point(transform([114.3, 30.5], "EPSG:4326", "EPSG:3857"))
  });
  point.setStyle(pointStyle);
  const source = new Vector({ features: [point] });
  const layer = new VectorLayer({ source });
  map.value.addLayer(layer);
};
</script>

<style lang="scss" scoped>
.map {
  width: 100vw;
  height: 100vh;
}
</style>
