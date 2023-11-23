<template>
  <div class="map" id="map" ref="myMap"></div>
  <div ref="popup" class="popup" v-show="showPopup">poppopopopopopop</div>
</template>

<script setup lang="ts">
import { Feature, Map, MapBrowserEvent, Overlay, View } from "ol";
import { Point } from "ol/geom";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import { transform } from "ol/proj";
import { Vector, XYZ } from "ol/source";
import { Fill, Icon, Stroke, Style, Text } from "ol/style";
import { onBeforeUnmount, onMounted, ref } from "vue";

const map = ref();
const popup = ref();
const showPopup = ref(false);

onMounted(() => {
  initMap();
  addPic();
  addPopup();
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
      anchor: [0.5, 50],
      anchorXUnits: "fraction",
      anchorYUnits: "pixels",
      // scale: 0.4,
      width: 50,
      height: 50,
      opacity: 0.8,
      src: "/src/assets/truck.png"
    }),
    text: new Text({
      //位置
      textAlign: "center",
      //基准线
      textBaseline: "middle",
      //文字样式
      font: "normal 14px 微软雅黑",
      //文本内容
      text: feature.get("data").title,
      //文本填充样式（即文字颜色）
      fill: new Fill({ color: "#0f0" }),
      stroke: new Stroke({ color: "#f00", width: 2 }),
      offsetY: 35
    })
  });

const addPic = () => {
  const feature1 = new Feature({
    geometry: new Point(transform([114.3, 30.5], "EPSG:4326", "EPSG:3857")),
    data: {
      title: "洪山区",
      tip: "开往武昌站的货车"
    }
  });
  const feature2 = new Feature({
    geometry: new Point(transform([114.4, 30.6], "EPSG:4326", "EPSG:3857")),
    data: {
      title: "青山区",
      tip: "开往武汉站的货车"
    }
  });
  feature1.setStyle(setStyle(feature1));
  feature2.setStyle(setStyle(feature2));

  const source = new Vector({ features: [feature1, feature2] });
  const layer = new VectorLayer({ source });
  map.value.addLayer(layer);
};

const move = (evt: MapBrowserEvent<PointerEvent>) => {
  const pixel = map.value.getEventPixel(evt.originalEvent);
  const hit = map.value.hasFeatureAtPixel(pixel);
  if (hit) {
    map.value.getTargetElement().style.cursor = "pointer";
    showPopup.value = true;
  } else {
    map.value.getTargetElement().style.cursor = "";
    showPopup.value = false;
  }
  map.value.forEachFeatureAtPixel(evt.pixel, (feature: Feature) => {
    if (feature) {
      const overlay = new Overlay({
        element: popup.value,
        autoPan: true,
        positioning: "center-center",
        stopEvent: false
      });
      overlay.setPosition(evt.coordinate);
      map.value.addOverlay(overlay);
    }
  });
};

const showModal = (evt: MapBrowserEvent<PointerEvent>) => {
  map.value.forEachFeatureAtPixel(evt.pixel, (feature: Feature) => {
    if (feature) {
      alert(feature.get("data").tip);
    }
  });
};

const addPopup = () => {
  map.value.on("pointermove", move);
  map.value.on("click", showModal);
};

onBeforeUnmount(() => {
  map.value.un("pointermove", move);
  map.value.un("click", showModal);
});
</script>

<style lang="scss" scoped>
.map {
  width: 100vw;
  height: 100vh;
}
.popup {
  padding: 10px 20px;
  background-color: #fff;
  color: #333;
}
</style>
