import { Feature } from "ol";
import { Point } from "ol/geom";
import { map } from "./event.vue";

export const addEvent = () => {
const source = new Vector({});
const layer = new ol.layer.Vector({ source });
map.addLayer(layer);
map.value.on("click", (evt) => {
console.log(evt);
const { coordinate } = evt;
const point = new Feature({
geometry: new Point(coordinate)
});
source.addFeature(point);

// 点击漫游
const view = map.getView();
view.animate({ center: coordinate });
});
};
