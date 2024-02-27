import { useEffect, useRef } from "react";
import * as d3 from "d3";
import * as d3Tile from "d3-tile";
import geoData from "../assets/world-geo.json";
import { clusterData } from "../assets/CluserData";

const url = (x: number, y: number, z: number) =>
  `https://tile.openstreetmap.org/${z}/${x}/${y}.png`;

const TAU = 2 * Math.PI;

export interface IVectorMap {
  width: number;
  height: number;
}

const PerformanceMap = (props: IVectorMap) => {
  const { width, height } = props;
  const mapRef = useRef(null);

  useEffect(() => {
    const svg = d3.select(mapRef.current);
    svg.selectChildren().remove();

    const projection = d3.geoMercator().translate([0, 0]).scale(100);

    const tile = d3Tile
      .tile()
      .extent([
        [0, 0],
        [width, height],
      ])
      .tileSize(256)
      .clampX(false);

    const tileLayer = svg.append("g");

    const zoomLayer = svg.append("g");

    const path = d3.geoPath(projection);

    const vectorLayer = zoomLayer.append("g");

    const pointLayer = zoomLayer.append("g");

    vectorLayer
      .selectAll("path")
      .data(geoData.features)
      .enter()
      .append("path")
      .attr("d", path)
      .style("stroke", "#000")
      .style("fill", "lightblue")
      .style("opacity", 0.5);

    clusterData.forEach((cluster) => {
      const points = projection(cluster.geometry.coordinates);
      pointLayer
        .append("circle")
        .attr("cx", points[0])
        .attr("cy", points[1])
        .attr("r", 5)
        .style("fill", "crimson")
        .style("stroke", "#333");
    });

    const updateTile = (tiles) => {
      tileLayer
        .selectAll("image")
        .data(tiles, (d) => d)
        .join("image")
        .attr("xlink:href", (d) => url(...d3Tile.tileWrap(d)))
        .attr("x", ([x]) => (x + tiles.translate[0]) * tiles.scale)
        .attr("y", ([, y]) => (y + tiles.translate[1]) * tiles.scale)
        .attr("width", tiles.scale)
        .attr("height", tiles.scale);
    };

    const zoom = d3
      .zoom()
      .scaleExtent([0.5, 1 << 15])
      .on("zoom", zoomed);

    const newTranslate = d3.zoomIdentity
      .translate(width / 2, height / 2)
      .scale(projection.scale() / 100);

    svg.call(zoom).call(zoom.transform, newTranslate);

    function zoomed({ transform }: { transform: d3.ZoomTransform }) {
      zoomLayer.attr("transform", transform.toString());
      vectorLayer.style("stroke-width", 1 / transform.k);
      pointLayer
        .selectAll("circle")
        .attr("r", 7 / transform.k)
        .attr("stroke-width", 2 / transform.k);
      const tiles = tile
        .scale(100 * transform.k * TAU)
        .translate([transform.x, transform.y])();
      updateTile(tiles);
    }

    // tile.translate([width / 2, height / 2]).scale(projection.scale() * TAU);

    // updateTile(tile());
  }, []);

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0,0,${width},${height}`}
      ref={mapRef}
    />
  );
};

export default PerformanceMap;
