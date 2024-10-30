import DeckGL from "@deck.gl/react";
import { Map as MapGL } from "react-map-gl";
import maplibregl from "maplibre-gl";
import { PolygonLayer, ScatterplotLayer } from "@deck.gl/layers";
import { FlyToInterpolator } from "deck.gl";
import { TripsLayer } from "@deck.gl/geo-layers";
import { createGeoJSONCircle } from "../utils/helpers";
import { getBoundingBoxFromPolygon, getMapGraph, getNearestNode } from "../services/MapService";
import { useEffect, useRef, useState } from "react";
import "../../public/maplibre-gl.css";
import useSmoothStateChange from "../hooks/useSmoothStateChange";
import { fetchOverpassData } from "../utils/api";

const MAP_STYLE = "./map_style.json";
const INITIAL_COLORS = {
  startNodeFill: [70, 183, 128],
  startNodeBorder: [255, 255, 255],
  endNodeFill: [152, 4, 12],
  endNodeBorder: [0, 0, 0],
  path: [70, 183, 128],
  route: [165, 13, 32],
};

export default function Map() {
  const [viewState, setViewState] = useState({
    longitude: -0.127,
    latitude: 51.507,
    zoom: 14,
    pitch: 0,
    bearing: 0,
  });
  const [startNode, setStartNode] = useState(null);
  const [endNode, setEndNode] = useState(null);
  const [selectionRadius, setSelectionRadius] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fadeRadiusReverse, setFadeRadiusReverse] = useState(false);
  const fadeRadius = useRef();
  const selectionRadiusOpacity = useSmoothStateChange(0, 0, 1, 400, fadeRadius.current, fadeRadiusReverse);
  const [colors, setColors] = useState(INITIAL_COLORS);

  async function mapClick(e, info, radius = null) {
    setFadeRadiusReverse(false);
    fadeRadius.current = true;
    // clearPath();

    // Place end node
    if (info.rightButton) {
      if (e.layer?.id !== "selection-radius") {
        console.log("Please select a point inside the radius.", "info");
        return;
      }

      if (loading) {
        console.log("Please wait for all data to load.", "info");
        return;
      }

      const loadingHandle = setTimeout(() => {
        setLoading(true);
      }, 300);

      const node = await getNearestNode(e.coordinate[1], e.coordinate[0]);
      if (!node) {
        console.log("No path was found in the vicinity, please try another location.");
        clearTimeout(loadingHandle);
        setLoading(false);
        return;
      }
      // const realEndNode = state.current.getNode(node.id);
      setEndNode(node);

      clearTimeout(loadingHandle);
      setLoading(false);

      // if(!realEndNode) {
      //     console.log("An error occurred. Please try again.");
      //     return;
      // }
      // state.current.endNode = realEndNode;

      return;
    }

    const loadingHandle = setTimeout(() => {
      setLoading(true);
    }, 300);

    // Fectch nearest node
    const node = await getNearestNode(e.coordinate[1], e.coordinate[0]);
    if (!node) {
      console.log("No path was found in the vicinity, please try another location.");
      clearTimeout(loadingHandle);
      setLoading(false);
      return;
    }

    console.log(node, e.coordinate);

    setStartNode(node);
    setEndNode(null);
    const circle = createGeoJSONCircle([node.lon, node.lat], 5);
    setSelectionRadius([{ contour: circle }]);

    const response = await fetchOverpassData(getBoundingBoxFromPolygon(circle), false);
    const data = await response.json();
    console.log(data);

    clearTimeout(loadingHandle);
    setLoading(false);

    // Fetch nodes inside the radius
    // getMapGraph(getBoundingBoxFromPolygon(circle), node.id).then(graph => {
    //     state.current.graph = graph;
    //     // clearPath();
    //     clearTimeout(loadingHandle);
    //     setLoading(false);
    // });
  }

  function changeLocation(location) {
    setViewState({
      ...viewState,
      longitude: location.longitude,
      latitude: location.latitude,
      zoom: 13,
      transitionDuration: 1,
      transitionInterpolator: new FlyToInterpolator(),
    });
  }

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((res) => {
      changeLocation(res.coords);
    });
  }, []);

  return (
    <>
      <div
        onContextMenu={(e) => {
          e.preventDefault();
        }}
      >
        <DeckGL initialViewState={viewState} controller={{ doubleClickZoom: false, keyboard: false }} onClick={mapClick}>
          <PolygonLayer
            id={"selection-radius"}
            data={selectionRadius}
            pickable={true}
            stroked={true}
            getPolygon={(d) => d.contour}
            getFillColor={[80, 210, 0, 10]}
            getLineColor={[9, 142, 46, 175]}
            getLineWidth={3}
            opacity={selectionRadiusOpacity}
          />

          <ScatterplotLayer
            id="start-end-points"
            data={[
              ...(startNode
                ? [
                    {
                      coordinates: [startNode.lon, startNode.lat],
                      color: colors.startNodeFill,
                      lineColor: colors.startNodeBorder,
                    },
                  ]
                : []),
              ...(endNode
                ? [
                    {
                      coordinates: [endNode.lon, endNode.lat],
                      color: colors.endNodeFill,
                      lineColor: colors.endNodeBorder,
                    },
                  ]
                : []),
            ]}
            pickable={true}
            opacity={1}
            stroked={true}
            filled={true}
            radiusScale={1}
            radiusMinPixels={7}
            radiusMaxPixels={20}
            lineWidthMinPixels={1}
            lineWidthMaxPixels={3}
            getPosition={(d) => d.coordinates}
            getFillColor={(d) => d.color}
            getLineColor={(d) => d.lineColor}
          />

          <MapGL reuseMaps mapLib={maplibregl} mapStyle="./map_style.json" doubleClickZoom={false} />
        </DeckGL>
      </div>
    </>
  );
}
