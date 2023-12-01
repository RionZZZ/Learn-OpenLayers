<template>
  <div class="map" id="map" ref="myMap"></div>
  <button @click="onZoomClick">zoom</button>
  <button @click="onMoveClick">move</button>
</template>

<script setup lang="ts">
import { Map, View, Feature } from "ol";
import ImageLayer from "ol/layer/Image";
import ImageSource from "ol/source/ImageStatic";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { Projection } from "ol/proj";
import { Style, Icon } from "ol/style";
import { Point } from "ol/geom";
import { ref, onMounted } from "vue";
import { getCenter } from "ol/extent";
import zcBg from "../assets/zc.png";

console.log(View);
console.log(Map);

const myMap = ref();
const map = ref();
const canvasLayer = ref();
onMounted(() => initMap());

const initMap = () => {
  console.log(myMap.value);

  // const extent = [0, 0, myMap.value.offsetWidth, myMap.value.offsetHeight];
  const extent = [0, 0, 2048, 403];

  const projection = new Projection({
    code: "xkcd-image",
    units: "pixels",
    extent
  });

  canvasLayer.value = new VectorLayer({
    source: new VectorSource()
  });

  const imageLayer = new ImageLayer({
    source: new ImageSource({
      url: zcBg,
      imageExtent: extent,
      projection
    })
  });
  // 初始化OL地图
  map.value = new Map({
    target: "map",
    layers: [imageLayer, canvasLayer.value],
    view: new View({
      center: getCenter(extent),
      zoom: 3,
      maxZoom: 5,
      projection
    })
  });

  setMark();
};

const setMark = () => {
  // 绘制canvas
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const size = 40;
  canvas.width = size;
  canvas.height = size;
  var radius = 10;
  var increase = true;
  const draw = () => {
    // 首先清除形状
    ctx!.clearRect(0, 0, size, size);
    // 外部大圈
    ctx!.beginPath();
    ctx!.arc(size / 2, size / 2, radius, 0, Math.PI * 2);
    ctx!.closePath();
    ctx!.fillStyle = "#f00";
    ctx!.fill();
    // 内部小圈
    ctx!.beginPath();
    ctx!.arc(size / 2, size / 2, 8, 0, Math.PI * 2);
    ctx!.closePath();
    ctx!.fillStyle = "#5d5d5d";
    ctx!.fill();
    if (radius > 18) {
      increase = false;
    } else if (radius < 10) {
      increase = true;
    }
    increase ? radius++ : radius--;

    map.value.render();
  };
  setInterval(draw, 50);

  const point1 = new Feature({
    geometry: new Point([120, 120])
  });
  const point2 = new Feature({
    geometry: new Point([250, 250])
  });
  const pointStyle = new Style({
    image: new Icon({
      img: canvas,
      size: [canvas.width, canvas.height]
    })
  });
  canvasLayer.value.getSource().addFeatures([point1, point2]);
  canvasLayer.value.setStyle(pointStyle);
};

const onZoomClick = () => {
  const view = map.value.getView();
  const zoom = view.getZoom();
  view.setZoom(zoom + 1);
};

const onMoveClick = () => {
  const view = map.value.getView();
  view.setCenter([200, 200]);
};
</script>

<style lang="scss" scoped>
.map {
  width: 100vw;
  height: 100vh;
}
</style>
