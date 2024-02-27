import { useRef, useEffect } from "react";
import * as d3 from "d3";
import geoData from "../assets/world-geo.json";
import { clusterData } from "../assets/CluserData";

interface IMapCanvas {
  width: number;
  height: number;
}

const MapCanvas = ({ width, height }: IMapCanvas) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = d3.select(canvasRef.current);
    const context = canvas.node()?.getContext("2d");
    if (!context) return;

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
      clusterData.forEach((cluster) => {
        const [x, y] = projection(cluster.geometry.coordinates);
        if (x && y) {
          context?.beginPath();
          context.arc(x, y, 5 / scale, 0, 2 * Math.PI);
          context.fill();
          context.strokeStyle = "black"; // Stroke color
          context.stroke();
        }
      });
    };

    const zoomed = ({ transform }: { transform: d3.ZoomTransform }) => {
      context.clearRect(0, 0, width, height);
      context.save();
      context.translate(transform.x, transform.y);
      context.scale(transform.k, transform.k);
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
    <canvas id="bubble-map" width={width} height={height} ref={canvasRef} />
  );
};

export default MapCanvas;
