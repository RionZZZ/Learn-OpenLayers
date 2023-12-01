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
  <button @click="startMove">start animate</button>
  <div ref="popup" class="popup" v-show="tip">{{ tip }}</div>
</template>

<script setup lang="ts">
import { Feature, Map, MapBrowserEvent, Overlay, View } from "ol";
import { Coordinate } from "ol/coordinate";
import { LineString, Point } from "ol/geom";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import { transform } from "ol/proj";
import RenderEvent from "ol/render/Event";
import { Vector, XYZ } from "ol/source";
import { Fill, Icon, Stroke, Style, Text } from "ol/style";
import { onBeforeUnmount, onMounted, ref } from "vue";

import truckIcon from "../assets/truck.png";
import truckIcon2 from "../assets/truck2.png";
import startIcon from "../assets/start.png";
import endIcon from "../assets/end.png";
const map = ref();
const featureLayer = ref();
const passCoordinates = ref<Coordinate[]>([]);

//  记录开始动画的时间
const startTime = ref(0);
// 轨迹分割的颗粒度，数值越小分的越细
const particle = 2;
// 轨迹动画的速度，数值越大位移越快
const speed = 60;

const popup = ref();
const tip = ref("");

onMounted(() => {
  initMap();
  addTrack();
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
      center: transform([114.1, 30.25], "EPSG:4326", "EPSG:3857"),
      zoom: 10,
      minZoom: 2
    })
  });
};

const coordinates = [
  transform([114.0, 30.0], "EPSG:4326", "EPSG:3857"),
  transform([114.1, 30.1], "EPSG:4326", "EPSG:3857"),
  transform([114.3, 30.1], "EPSG:4326", "EPSG:3857"),
  transform([114.25, 30.4], "EPSG:4326", "EPSG:3857"),
  transform([114.4, 30.24], "EPSG:4326", "EPSG:3857"),
  transform([114.23, 30.12], "EPSG:4326", "EPSG:3857"),
  transform([114.44, 30.34], "EPSG:4326", "EPSG:3857"),
  transform([114.56, 30.45], "EPSG:4326", "EPSG:3857"),
  transform([114.05, 30.53], "EPSG:4326", "EPSG:3857"),
  transform([114.12, 30.23], "EPSG:4326", "EPSG:3857"),
  transform([114.16, 30.16], "EPSG:4326", "EPSG:3857")
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
    type: "start",
    geometry: new Point(passCoordinates.value[0]!)
  });
  const endMarker = new Feature({
    type: "end",
    geometry: new Point(passCoordinates.value.at(-1)!)
  });

  const styles: { [k in string]: Style } = {
    track: new Style({
      stroke: new Stroke({
        width: 6,
        color: [220, 30, 60, 0.9]
      })
    }),
    start: new Style({
      image: new Icon({
        anchor: [0.5, 1],
        scale: 0.4,
        src: startIcon
      })
    }),
    end: new Style({
      image: new Icon({
        anchor: [0.5, 1],
        scale: 0.4,
        src: endIcon
      })
    }),
    geoMarker: new Style({
      image: new Icon({
        src: truckIcon2
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
  map.value.on("postcompose", move);
  // 第一次需要手动调用一遍，否则不执行postcompose
  map.value.render();
};

const stopMove = () => {
  map.value.un("postcompose", move);
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

const setFeature = (point: Coordinate, data: any) => {
  const feature = new Feature({
    geometry: new Point(transform(point, "EPSG:4326", "EPSG:3857")),
    data,
    id: "truck"
  });
  feature.setStyle(
    new Style({
      image: new Icon({
        anchor: [0.5, 30],
        anchorXUnits: "fraction",
        anchorYUnits: "pixels",
        // scale: 0.4,
        width: 50,
        height: 50,
        opacity: 0.8,
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
        text: data.title,
        //文本填充样式（即文字颜色）
        fill: new Fill({ color: "#0f0" }),
        stroke: new Stroke({ color: "#f00", width: 2 }),
        offsetY: 35
      })
    })
  );
  return feature;
};

const addPic = () => {
  const features = [
    setFeature([114.3, 30.5], {
      title: "鄂A86686",
      tip: "开往武汉站的货车"
    }),
    setFeature([114.4, 30.6], {
      title: "鄂A86686",
      tip: "开往武汉站的货车"
    }),
    setFeature([114.5, 30.6], {
      title: "鄂A77563",
      tip: "开往忻州的货车"
    }),
    setFeature([114.5, 30.2], {
      title: "鄂A67823",
      tip: "开往柳州的货车"
    }),
    setFeature([114.33, 30.11], {
      title: "鄂A34551",
      tip: "开往大兴的货车"
    }),
    setFeature([114.34, 30.22], {
      title: "鄂A34111",
      tip: "开往上户的货车"
    }),
    setFeature([114.51, 30.77], {
      title: "鄂A12348",
      tip: "开往崇州的货车"
    })
  ];
  const source = new Vector({ features });
  const layer = new VectorLayer({ source });
  map.value.addLayer(layer);
};

const pointerMove = (evt: MapBrowserEvent<PointerEvent>) => {
  const pixel = map.value.getEventPixel(evt.originalEvent);
  const hit = map.value.hasFeatureAtPixel(pixel);

  if (hit) {
    map.value.getTargetElement().style.cursor = "pointer";
  } else {
    map.value.getTargetElement().style.cursor = "";
    tip.value = "";
  }
  map.value.forEachFeatureAtPixel(evt.pixel, (feature: Feature) => {
    if (feature && feature.get("id") === "truck") {
      const overlay = new Overlay({
        element: popup.value,
        autoPan: false,
        positioning: "center-center",
        stopEvent: false
      });
      overlay.setPosition(evt.coordinate);
      map.value.addOverlay(overlay);
      tip.value = feature.get("data").tip;
    }
  });
};

const showModal = (evt: MapBrowserEvent<PointerEvent>) => {
  map.value.forEachFeatureAtPixel(evt.pixel, (feature: Feature) => {
    if (feature && feature.get("id") === "truck") {
      alert(feature.get("data").tip);
    }
  });
};

const addPopup = () => {
  map.value.on("pointermove", pointerMove);
  map.value.on("click", showModal);
};

onBeforeUnmount(() => {
  stopMove();
  map.value.un("pointermove", pointerMove);
  map.value.un("click", showModal);
});
</script>

<style lang="scss" scoped>
.map {
  width: 100vw;
  height: 80vh;
  margin: 30px auto;
}
.routes {
  a {
    padding: 0 10px;
    text-decoration: underline;
  }

  .popup {
    min-width: 200px;
    min-height: 140px;
    padding: 10px 20px;
    background-color: #fff;
    color: rgb(24, 11, 139);
  }
}
</style>
