import { Feature } from "ol";
import { Vector } from "ol/source";
import VectorLayer from "ol/layer/Vector";
import { map } from "./event.vue";

export const addEvent = () => {
const source = new Vector({});
const layer = new VectorLayer({ source });
map.value.addLayer(layer);
map.value.on("click", (evt: any) => {
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
