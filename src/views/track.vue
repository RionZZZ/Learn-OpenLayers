<template>
  <div class="map" id="map" ref="myMap"></div>
  <button @click="startMove">start animate</button>
</template>

<script setup lang="ts">
import { Feature, Map, View } from "ol";
import { Coordinate } from "ol/coordinate";
import { LineString, Point } from "ol/geom";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import { transform } from "ol/proj";
import RenderEvent from "ol/render/Event";
import { Vector, XYZ } from "ol/source";
import { Circle, Fill, Icon, Stroke, Style } from "ol/style";
import { onBeforeUnmount, onMounted, ref } from "vue";
import markIcon from "../assets/mark.png";

const map = ref();
const featureLayer = ref();
const passCoordinates = ref<Coordinate[]>([]);

//  记录开始动画的时间
const startTime = ref(0);
// 轨迹分割的颗粒度，数值越小分的越细
const particle = 20;
// 轨迹动画的速度，数值越大位移越快
const speed = 10;

onMounted(() => {
  initMap();
  addTrack();
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
      zoom: 10,
      minZoom: 3
    })
  });
};

const coordinates = [
  transform([114.0, 30.0], "EPSG:4326", "EPSG:3857"),
  transform([114.1, 30.1], "EPSG:4326", "EPSG:3857"),
  transform([114.2, 30.1], "EPSG:4326", "EPSG:3857"),
  transform([114.2, 30.4], "EPSG:4326", "EPSG:3857"),
  transform([114.4, 30.4], "EPSG:4326", "EPSG:3857")
];

const addLayer = (trackLine: any) => {
  const trackFeature = new Feature({
    type: "track",
    geometry: trackLine
  });
  const geoMarker = new Feature({
    type: "geoMarker",
    geometry: new Point(passCoordinates.value[0]!)
  });
  geoMarker.setId("point");

  const startMarker = new Feature({
    type: "icon",
    geometry: new Point(passCoordinates.value[0]!)
  });
  const endMarker = new Feature({
    type: "icon",
    geometry: new Point(passCoordinates.value.at(-1)!)
  });

  const styles: { [k in string]: Style } = {
    track: new Style({
      stroke: new Stroke({
        width: 6,
        color: [220, 30, 60, 0.9]
      })
    }),
    icon: new Style({
      image: new Icon({
        anchor: [0.5, 1],
        scale: 0.4,
        src: markIcon
      })
    }),
    geoMarker: new Style({
      image: new Circle({
        radius: 8,
        fill: new Fill({ color: "#333" }),
        stroke: new Stroke({
          color: "#f00",
          width: 2
        })
      })
    })
  };

  featureLayer.value = new VectorLayer({
    source: new Vector({
      features: [trackFeature, geoMarker, startMarker, endMarker]
    }),
    style: (feature) => {
      return styles[feature.get("type")];
    }
  });

  map.value.addLayer(featureLayer.value);
};

const move = (evt: RenderEvent) => {
  const frameState = evt.frameState;
  // 执行动画已经过了多少时间（秒）
  const timeout = (frameState!.time - startTime.value) / 1000;
  let count = Math.round(speed * timeout);

  if (count >= passCoordinates.value.length - 1) {
    // 确保到达最后一个点位，并停止移动动画
    count = passCoordinates.value.length - 1;
    stopMove();
  }
  const point = featureLayer.value.getSource().getFeatureById("point");
  // point.setGeometry(new Point(passCoordinates.value[count]));
  point.getGeometry().setCoordinates(passCoordinates.value[count]);
  map.value.render();
};

const startMove = () => {
  startTime.value = new Date().getTime();
  map.value.on("postrender", move);
  // 第一次需要手动调用一遍，否则不执行postcompose
  map.value.render();
};

const stopMove = () => {
  map.value.un("postrender", move);
};

const addTrack = () => {
  const trackLine = new LineString(coordinates);
  // 轨迹在投影平面上的长度
  const trackLineLen = trackLine.getLength();
  // 当前平面的分辨率
  const resolution = map.value.getView().getResolution();

  // 点有可能是小数，要到终点需要手动添加最后一个点
  const pointCount = trackLineLen / (resolution * particle);
  for (let i = 0; i <= pointCount; i++) {
    passCoordinates.value.push(trackLine.getCoordinateAt(i / pointCount));
  }
  passCoordinates.value.push(coordinates.at(-1)!);

  addLayer(trackLine);
};

onBeforeUnmount(stopMove);
</script>

<style lang="scss" scoped>
.map {
  width: 100vw;
  height: 80vh;
}
</style>
