import { useRef, useEffect } from "react";
import * as d3 from "d3";
import geoData from "../assets/world-geo.json";
import { clusterData } from "../assets/CluserData";
import { TwoMClusterData } from "../assets/TwoMClusterData";

interface IMapCanvas {
  width: number;
  height: number;
}

// function calculateZoomLevel(zoomScale: number) {
//   const scale = zoomScale * 2 * Math.PI;
//   const zoomLevel = Math.log(scale / 256) / Math.LN2;
//   return zoomLevel;
// }

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

    const projection = d3.geoMercator().translate([0, 0]).scale(100);

    const path = d3.geoPath().projection(projection).context(context);

    const draw = (scale: number) => {
      context.beginPath();
      path(geoData);
      context.fillStyle = "#ccc";
      context.fill();

      context.lineWidth = 1 / scale;
      context.strokeStyle = "#333";
      context.stroke();

      context.fillStyle = "crimson";
      TwoMClusterData.forEach((cluster, index) => {
        if(index > 10000) return;
        const points = projection(
          cluster.geometry.coordinates as [number, number]
        );
        if (!points) return;
        const [x, y] = points;
        if (x && y) {
          context?.beginPath();
          context.arc(x, y, 7 / scale, 0, 2 * Math.PI);
          context.fill();
          context.lineWidth = 2 / scale;
          context.strokeStyle = "black"; // Stroke color
          context.lineWidth = 2 / scale;
          context.stroke();
        }
      });
    };

    const zoomed = ({ transform }: { transform: d3.ZoomTransform }) => {
      context.clearRect(0, 0, width, height);
      context.save();
      context.translate(transform.x, transform.y);
      context.scale(transform.k, transform.k);
      // console.log(calculateZoomLevel(100 * transform.k))
      draw(transform.k);
      context.restore();
    };

    const zoom = d3
      .zoom()
      .scaleExtent([0.5, 1 << 15])
      .on("zoom", zoomed);

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
