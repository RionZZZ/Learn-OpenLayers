<template>
  <select ref="type" @change="typeChange">
    <option value="Point">Point</option>
    <option value="LineString">LineString</option>
    <option value="Polygon">Polygon</option>
    <option value="Circle">Circle</option>
  </select>
  <div class="map" id="map" ref="myMap"></div>
</template>

<script setup lang="ts">
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import { transform } from "ol/proj";
import { Vector, XYZ } from "ol/source";
import { onMounted, ref } from "vue";
import { Draw, Modify, Snap } from "ol/interaction";

const map = ref();
const source = ref();
const type = ref();
const draw = ref();
const snap = ref();
onMounted(() => {
  initMap();
  initDrawLayer();
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
const initDrawLayer = () => {
  source.value = new Vector();
  const layer = new VectorLayer({
    source: source.value,
    style: {
      "fill-color": "rgba(255, 255, 255, 0.2)",
      "stroke-color": "#f00",
      "stroke-width": 2,
      "circle-radius": 8,
      "circle-fill-color": "#f00"
    }
  });
  map.value.addLayer(layer);

  map.value.addInteraction(new Modify({ source: source.value }));

  addInteractions();
};

const addInteractions = () => {
  draw.value = new Draw({
    source: source.value,
    type: type.value.value
  });
  map.value.addInteraction(draw.value);
  snap.value = new Snap({ source: source.value });
  map.value.addInteraction(snap.value);
};

const typeChange = () => {
  console.log(type.value.value);
  map.value.removeInteraction(draw.value);
  map.value.removeInteraction(snap.value);
  addInteractions();
};
</script>

<style lang="scss" scoped>
.map {
  width: 100vw;
  height: 80vh;
}
</style>
