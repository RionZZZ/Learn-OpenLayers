<template>
  <div class="map" id="map" ref="myMap"></div>
</template>

<script setup lang="ts">
import { Feature, Map, View } from "ol";
import { LineString, Point, Polygon } from "ol/geom";
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
  addLine();
  addArea();
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

const style = new Style({
  fill: new Fill({ color: "#0f0" }),
  stroke: new Stroke({ color: "#00f", width: 2 }),
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
  point.setStyle(style);
  const source = new Vector({ features: [point] });
  const layer = new VectorLayer({ source });
  map.value.addLayer(layer);
};
const addLine = () => {
  const line = new Feature({
    geometry: new LineString([
      transform([113.8, 30.6], "EPSG:4326", "EPSG:3857"),
      transform([114.5, 30.6], "EPSG:4326", "EPSG:3857")
    ])
  });
  line.setStyle(style);
  const source = new Vector({ features: [line] });
  const layer = new VectorLayer({ source });
  map.value.addLayer(layer);
};
const addArea = () => {
  const rect = new Feature({
    geometry: new Polygon([
      [
        transform([113.9, 30.4], "EPSG:4326", "EPSG:3857"),
        transform([114.3, 30.4], "EPSG:4326", "EPSG:3857"),
        transform([114.5, 30.5], "EPSG:4326", "EPSG:3857")
      ],
      [
        transform([113.1, 30.6], "EPSG:4326", "EPSG:3857"),
        transform([114.1, 30.9], "EPSG:4326", "EPSG:3857"),
        transform([114.3, 30.7], "EPSG:4326", "EPSG:3857")
      ]
    ])
  });
  rect.setStyle(style);
  const source = new Vector({ features: [rect] });
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
