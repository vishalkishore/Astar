import DeckGL from "@deck.gl/react";
import { Map as MapGL } from "react-map-gl";
import maplibregl from "maplibre-gl";
import { PolygonLayer, ScatterplotLayer } from "@deck.gl/layers";
import { FlyToInterpolator } from "deck.gl";
import { TripsLayer } from "@deck.gl/geo-layers";
import { createGeoJSONCircle } from "../utils/helpers";
import { useEffect, useRef, useState } from "react";
import "../../public/maplibre-gl.css";

function mapClick(info) {
	console.log(info);
}
const MAP_STYLE = "./map_style.json";

export default function Map() {
	const [viewState, setViewState] = useState({
		longitude: -0.127,
		latitude: 51.507,
		zoom: 13,
		pitch: 0,
		bearing: 0,
	});

	return (
		<>
			<div
				onContextMenu={(e) => {
					e.preventDefault();
				}}
			>
				<DeckGL
					initialViewState={viewState}
					controller={{ doubleClickZoom: false, keyboard: false }}
					onClick={mapClick}
				>
					<MapGL
						reuseMaps
						mapLib={maplibregl}
						mapStyle="./map_style.json"
						doubleClickZoom={false}
					/>
				</DeckGL>
			</div>
		</>
	);
}
