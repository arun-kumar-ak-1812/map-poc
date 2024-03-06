import { useReducer } from "react";
import * as d3 from "d3";
import "./App.css";
import { MapContext } from "./store/MapContext";
import PerformanceMap from "./components/PerformanceMap";
import CanvasMap from "./components/CanvasMap";
import BubbleMap from "./components/BubbleMap";
import BubbleMapCanvas from "./components/BubbleMapCanvas";
import NewMapCanvas from "./components/NewCanvasMap";

export interface IMapState {
  projection: d3.GeoProjection;
  updateWhenZoom: ((
    projection: d3.GeoProjection,
    transform: d3.ZoomTransform,
  ) => void)[];
}

function App() {
  const width = 700;
  const height = 500;

  const [mapState, setMapState] = useReducer(
    (reducerState: Partial<IMapState>, payload: Partial<IMapState>) => ({
      ...reducerState,
      ...payload,
    }),
    {
      updateWhenZoom: [],
    },
  );

  return (
    <MapContext.Provider value={{ ...mapState, setMapState }}>
      {/* <h3>SVG Map</h3>
      <div style={{ width, height }} className="map-wrapper">
        <PerformanceMap width={width} height={height} />
      </div> */}
      <h3>Canvas Map</h3>
      <div style={{ width, height }} className="map-wrapper">
        <NewMapCanvas width={width} height={height} />
      </div>
      {/* <div style={{ width, height }} className="map-wrapper">
        <BubbleMap width={width} height={height} />
      </div> */}
      {/* <div style={{ width, height }} className="map-wrapper">
        <BubbleMapCanvas width={width} height={height} />
      </div> */}
    </MapContext.Provider>
  );
}

export default App;
