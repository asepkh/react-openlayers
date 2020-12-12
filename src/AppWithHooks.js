import React, { useEffect, useState } from "react";

import { Draw as OlDraw } from "ol/interaction";
import { OSM as OlSourceOSM, Vector as OlSourceVector } from "ol/source";
import { Tile as OlTileLayer, Vector as OlVectorLayer } from "ol/layer";
import {
  defaults as defaultControls,
  FullScreen as OlFullScreen,
  ScaleLine as OlScaleLine,
} from "ol/control";

import OlMap from "ol/Map";
import OlView from "ol/View";

import { Icon, Style } from "ol/style";
import "./App.css";
import "ol/ol.css";

export default function App() {
  const initialOptions = {
    center: [51966969.48271899, -688971.3316195873], // Jakarta Coordinate
    zoom: 14,
  };

  const iconStyle = new Style({
    image: new Icon({
      anchor: [0.5, 35],
      anchorXUnits: "fraction",
      anchorYUnits: "pixels",
      src: "https://img.icons8.com/nolan/40/map-pin.png",
    }),
  });

  const vectorSource = new OlSourceVector();

  const layer = [
    new OlTileLayer({
      source: new OlSourceOSM(),
    }),
    new OlVectorLayer({
      source: vectorSource,
      style: iconStyle,
    }),
  ];

  const map = new OlMap({
    target: null,
    controls: defaultControls().extend([
      new OlFullScreen({
        source: "fullscreen",
      }),
      new OlScaleLine(),
    ]),
    layers: layer,
    view: new OlView({
      center: initialOptions.center,
      zoom: initialOptions.zoom,
    }),
  });

  useEffect(() => {
    map.setTarget("map");
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div id="fullscreen" className="fullscreen">
      <div className="container-fluid">
        <div className="row">
          <div className="col-10" style={{ padding: 0 }}>
            <div id="map" style={{ width: "100%", height: "100vh" }}></div>
          </div>
          <div
            className="col-2"
            style={{
              padding: 0,
            }}
          >
            <div className="sidebar">
              <h4>React Openlayers</h4>
              <p style={{ fontWeight: 700 }}>( Sidebar )</p>
              <hr style={{ backgroundColor: "white" }} />
              <button
                onClick={(e) => {
                  e.preventDefault();
                  map.getView().setCenter(initialOptions.center);
                  map.getView().setZoom(initialOptions.zoom);
                }}
                className="btn btn-secondary btn-block"
              >
                Set default coordinate
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
