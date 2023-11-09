<template>
  <div class="map" id="map" ref="myMap"></div>
</template>

<script setup lang="ts">
import { Map, View } from "ol";
import ImageLayer from "ol/layer/Image";
import ImageSource from "ol/source/ImageStatic";
import { Projection } from "ol/proj";
import { ref, onMounted } from "vue";
import { getCenter } from "ol/extent";

console.log(View);
console.log(Map);

const myMap = ref();
onMounted(() => initMap());

const initMap = () => {
  console.log(myMap.value);

  // const extent = [0, 0, myMap.value.offsetWidth, myMap.value.offsetHeight];
  const extent = [0, 0, 1024, 968];

  const projection = new Projection({
    code: "xkcd-image",
    units: "pixels",
    extent
  });

  const imageLayer = new ImageLayer({
    source: new ImageSource({
      url: "https://imgse.com/content/images/system/home_cover_1601010270144_8921bc.jpg",
      imageExtent: extent,
      projection
    })
  });
  // 初始化OL地图
  new Map({
    target: "map",
    layers: [imageLayer],
    view: new View({
      center: getCenter(extent),
      zoom: 2,
      maxZoom: 8,
      projection
    })
  });
};
</script>

<style lang="scss" scoped>
.map {
  width: 100vw;
  height: 100vh;
}
</style>
