import { useRef, useEffect } from "react";
import * as d3 from "d3";
import geoData from "../assets/world-geo.json";
// import threeLData from "../assets/6LmapData.json";
import twoLakhData from "../assets/2LWorldCitiesData.json";
import { mapCache } from "../store/MapCache";

interface IMapCanvas {
  width: number;
  height: number;
}

// interface I1LData {
//   residence_lat: number;
//   residence_lng: number;
// }

interface I2LCitiesData {
  Latitude: number;
  Longitude: number;
}

// const threeLakhData = threeLData as I1LData[];
const twoLData = twoLakhData as I2LCitiesData[];

const MapCanvas = ({ width, height }: IMapCanvas) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = d3.select(canvasRef.current);
    const context = canvas.node()?.getContext("2d");
    if (!context) return;

    const scale = window.devicePixelRatio ?? 1;
    canvasRef.current.width = Math.floor(width * scale);
    canvasRef.current.height = Math.floor(height * scale);
    context.scale(scale, scale);

    const projection = d3
      .geoMercator()
      .translate([0, 0])
      .scale(100)
      .precision(1);

    const path = d3.geoPath().projection(projection).context(context);

    const onDraw = (scale: number, transformX: number, transformY: number) => {
      context.clearRect(0, 0, width, height);
      context.save();
      context.translate(transformX, transformY);
      context.scale(scale, scale);
      context.beginPath();
      context.fillStyle = "#ccc";
      path(geoData);
      context.fill();

      context.lineWidth = 1 / scale;
      context.strokeStyle = "#333333";
      context.stroke();

      const radius = 5 / scale;
      context.fillStyle = "#178fff";
      context.lineWidth = 1 / scale;
      context.strokeStyle = "#333333"; // Stroke color

      context.beginPath();
      const { pointCacheArr } = mapCache;
      let incrementUpdate = 0;
      pointCacheArr.forEach((points) => {
        const { x, y } = points;
        if (x && y) {
          context.moveTo(x + radius, y);
          context.arc(x, y, radius, 0, 2 * Math.PI);
          incrementUpdate++;
          if (incrementUpdate > 50000) {
            context.globalAlpha = 1;
            context.stroke();
            // context.globalAlpha = 0.7;
            context.fill();
            incrementUpdate = 0;
          }
        }
      });
      context.globalAlpha = 1;
      context.stroke();
      context.globalAlpha = 0.7;
      context.fill();
      context.restore();
    };

    const zoomed = ({ transform }: { transform: d3.ZoomTransform }) => {
      onDraw(transform.k, transform.x, transform.y);
    };

    const onZoomEnd = ({ transform }: { transform: d3.ZoomTransform }) => {
      context.clearRect(0, 0, width, height);
      context.save();
      context.translate(transform.x, transform.y);
      context.scale(transform.k, transform.k);
      context.beginPath();
      context.fillStyle = "#ccc";
      path(geoData);
      context.fill();

      context.lineWidth = 1 / transform.k;
      context.strokeStyle = "#333333";
      context.stroke();

      const radius = 5 / transform.k;
      context.fillStyle = "#178fff";
      context.lineWidth = 1 / transform.k;
      context.strokeStyle = "#333333"; // Stroke color

      mapCache.pointCacheArr = [];
      // cacheMap = new Map();
      const { pointCacheArr } = mapCache;
      twoLData.forEach((cluster, index) => {
        if (index > 100000) return;
        const points = projection([cluster.Longitude, cluster.Latitude] as [
          number,
          number,
        ]);
        if (!points) return;
        const [x, y] = points;
        // const key = `${x}${y}${radius}`;
        if (x && y) {
          // && !cacheMap.get(key)) {
          context.beginPath();
          context.arc(x, y, radius, 0, 2 * Math.PI);
          pointCacheArr.push({ x, y });
          // cacheMap.set(key, { x, y });
          context.globalAlpha = 0.7;
          context.fill();
          context.globalAlpha = 1;
          context.stroke();
        }
      });
      context.restore();
    };

    const zoom = d3
      .zoom()
      .scaleExtent([0.5, 1 << 15])
      .on("zoom", zoomed)
      .on("end", onZoomEnd);

    const newTranslate = d3.zoomIdentity
      .translate(width / 2, height / 2)
      .scale(projection.scale() / 100);

    canvas.call(zoom).call(zoom.transform, newTranslate);
  }, []);

  return (
    <canvas
      id="bubble-map"
      width={width}
      height={height}
      style={{
        // objectFit: "contain",
        width: `${width}px`,
        height: `${height}px`,
      }}
      ref={canvasRef}
    />
  );
};

export default MapCanvas;
