import { createContext, Dispatch } from "react";
import { IMapState } from "../App";

export interface IMapContext extends Partial<IMapState> {
  setMapState: Dispatch<Partial<IMapState>>;
}

export const MapContext = createContext<IMapContext>(undefined);
