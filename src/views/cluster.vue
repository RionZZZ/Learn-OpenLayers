<template>
  <div class="map" id="map" ref="myMap"></div>
</template>

<script setup lang="ts">
import { Feature, Map, View } from "ol";
import { boundingExtent } from "ol/extent";
import { Point } from "ol/geom";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import { transform } from "ol/proj";
import { Cluster, Vector, XYZ } from "ol/source";
import { Circle, Fill, Icon, Stroke, Style, Text } from "ol/style";
import { onMounted, ref } from "vue";
import truckIcon from "../assets/truck.png";

const map = ref();
onMounted(() => {
  initMap();
  initCluster();
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

const initCluster = () => {
  const count = 8000;
  const features = new Array(count);
  for (let i = 0; i < count; i++) {
    const coordinates = transform(
      [360 * Math.random() - 180, 180 * Math.random() - 90],
      "EPSG:4326",
      "EPSG:3857"
    );
    features[i] = new Feature(new Point(coordinates));
  }

  const source = new Vector({ features });
  const cluster = new Cluster({
    distance: 50,
    source
  });
  const layer = new VectorLayer({
    source: cluster,
    style: (feature) => {
      const size = feature.get("features").length;
      let style;
      if (size > 1) {
        style = new Style({
          image: new Circle({
            radius: 10,
            stroke: new Stroke({
              color: "#fff"
            }),
            fill: new Fill({
              color: "#3399CC"
            })
          }),
          text: new Text({
            text: size.toString(),
            fill: new Fill({
              color: "#fff"
            })
          })
        });
      } else {
        style = new Style({
          image: new Icon({
            src: truckIcon,
            scale: 0.4
          })
        });
      }

      return style;
    }
  });
  map.value.addLayer(layer);

  map.value.on("click", (evt: any) => {
    layer.getFeatures(evt.pixel).then((clicked) => {
      if (clicked.length) {
        const features = clicked[0].get("features");
        console.log(features);
        if (features.length > 1) {
          const extent = boundingExtent(
            features.map((f: Feature) => f.getGeometry()!.getExtent())
          );
          console.log(extent);

          map.value
            .getView()
            .fit(extent, { duration: 1000, padding: [50, 50, 50, 50] });
        }
      }
    });
  });
};
</script>

<style lang="scss" scoped>
.map {
  width: 100vw;
  height: 100vh;
}
</style>
