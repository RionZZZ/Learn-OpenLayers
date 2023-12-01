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
import { Fill, Icon, Stroke, Style, Text } from "ol/style";
import { onMounted, ref } from "vue";

import truckIcon from "../assets/truck.png";

const map = ref();
onMounted(() => {
  initMap();
  addPic();
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

const setStyle = (feature: Feature) =>
  new Style({
    image: new Icon({
      anchor: [0.5, 0.5],
      scale: 0.4,
      opacity: 0.8,
      color: "#f00",
      src: truckIcon
    }),
    text: new Text({
      //位置
      textAlign: "center",
      //基准线
      textBaseline: "middle",
      //文字样式
      font: "normal 14px 微软雅黑",
      //文本内容
      text: feature.get("title"),
      //文本填充样式（即文字颜色）
      fill: new Fill({ color: "#0f0" }),
      stroke: new Stroke({ color: "#f00", width: 2 }),
      offsetY: 30
    })
  });

const addPic = () => {
  const feature1 = new Feature({
    geometry: new Point(transform([114.3, 30.5], "EPSG:4326", "EPSG:3857")),
    title: "洪山区"
  });
  const feature2 = new Feature({
    geometry: new Point(transform([114.4, 30.6], "EPSG:4326", "EPSG:3857")),
    title: "青山区"
  });
  feature1.setStyle(setStyle(feature1));
  feature2.setStyle(setStyle(feature2));

  const source = new Vector({ features: [feature1, feature2] });
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
