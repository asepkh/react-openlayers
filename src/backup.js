import React, { Component } from "react";

import { MdLocationOn, MdLocationOff } from "react-icons/md";
import { Draw as OlDraw, Modify as OlModify } from "ol/interaction";
import {
  OSM as OlSourceOSM,
  Vector as OlSourceVector,
  Cluster as OlSourceCluster,
} from "ol/source";
import { Tile as OlTileLayer, Vector as OlVectorLayer } from "ol/layer";
import {
  defaults as defaultControls,
  FullScreen as OlFullScreen,
  ScaleLine as OlScaleLine,
  OverviewMap as OlOverviewMap,
} from "ol/control";

import OlFeature from "ol/Feature";
import OlMap from "ol/Map";
import OlView from "ol/View";

import { Point } from "ol/geom";
import { Icon, Circle, Fill, Stroke, Style, Text } from "ol/style";

import "./App.scss";
import "ol/ol.css";

const initialOptions = {
  center: [79974184.97513326, -31426.48475497072],
  zoom: 3.5,
};

// const clusterCount = 2000;
// const clusterDistance = 50;
// const pinClusterFeatures = new Array(clusterCount);
// for (let i = 0; i < clusterCount; ++i) {
//   const coordinates = [
//     2 * 7000000 * Math.random() - 7000000,
//     2 * 4500000 * Math.random() - 4500000,
//   ];
//   pinClusterFeatures[i] = new OlFeature(new Point(coordinates));
// }

// let pinClusterSource = new OlSourceVector({
//   features: pinClusterFeatures,
// });
class App extends Component {
  constructor(props) {
    super(props);

    this.state = { ...initialOptions, pin: false, pinnedCoordinate: [] };

    // Pin Location Icon Layer
    this.pinSourceVector = new OlSourceVector({
      features: [
        new OlFeature({
          type: "icon",
        }),
      ],
    });
    this.pinStyle = new Style({
      image: new Circle({
        radius: 10,
        stroke: new Stroke({
          color: "white",
        }),
      }),
    });
    this.pinVectorLayer = new OlVectorLayer({
      source: this.pinSourceVector,
      style: this.pinStyle,
    });

    // // Cluster Pin Location
    // this.clusterSource = new OlSourceCluster({
    //   distance: clusterDistance,
    //   source: pinClusterSource,
    // });

    // this.styleCache = {};
    // this.clusterVectorLayer = new OlVectorLayer({
    //   source: this.clusterSource,
    //   style: (feature) => {
    //     const size = feature.get("features").length;
    //     let style = this.styleCache[size];
    //     if (!style) {
    //       style =
    //         size > 1
    //           ? new Style({
    //               image: new Circle({
    //                 radius: size >= 10 ? size : size <= 4 ? 8 : size * 2,
    //                 stroke: new Stroke({
    //                   color: "white",
    //                 }),
    //                 fill: new Fill({
    //                   color: "rgba(0, 0, 0, 0.5)",
    //                 }),
    //               }),
    //               text: new Text({
    //                 text: size.toString(),
    //                 fill: new Fill({
    //                   color: "#fff",
    //                 }),
    //               }),
    //             })
    //           : new Style({
    //               image: new Icon({
    //                 anchor: [0.5, 250],
    //                 anchorXUnits: "fraction",
    //                 anchorYUnits: "pixels",
    //                 scale: 0.1,
    //                 src:
    //                   "https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678111-map-marker-256.png",
    //               }),
    //             });
    //       this.styleCache[size] = style;
    //     }
    //     return style;
    //   },
    // });

    // Interaction for draw pin location icon
    this.pinInteractionList = [
      new OlDraw({
        source: this.pinSourceVector,
        type: "Point",
      }),
      new OlModify({ source: this.pinSourceVector }),
    ];

    // Layers
    this.layers = [
      new OlTileLayer({
        source: new OlSourceOSM(),
      }),
      this.pinVectorLayer,
    ];

    // Openlayers build map
    this.map = new OlMap({
      target: null,
      controls: defaultControls({ attribution: false }).extend([
        new OlFullScreen({
          source: "fullscreen",
        }),
        new OlScaleLine(),
        new OlOverviewMap({
          layers: [
            new OlTileLayer({
              source: new OlSourceOSM(),
            }),
          ],
        }),
      ]),
      layers: this.layers,
      view: new OlView({
        center: this.state.center,
        zoom: this.state.zoom,
      }),
    });
  }

  togglePin() {
    this.setState({ pin: !this.state.pin }, () =>
      this.state.pin
        ? this.pinInteractionList.map((interaction) =>
            this.map.addInteraction(interaction)
          )
        : this.pinInteractionList.map((interaction) =>
            this.map.removeInteraction(interaction)
          )
    );
  }

  updateMap() {
    this.map.getView().setCenter(this.state.center);
    this.map.getView().setZoom(this.state.zoom);
  }

  componentDidMount() {
    // Set map target (DOM)
    this.map.setTarget("map");

    // Add map event callback
    this.map.on("moveend", () => {
      let center = this.map.getView().getCenter();
      let zoom = this.map.getView().getZoom();
      if (zoom <= 5) this.state.pin && this.togglePin();
      this.setState({ center, zoom });
    });

    this.map.on("click", (evt) => {
      console.log(evt.coordinate);

      this.setState({
        pinnedCoordinate: [], // Reset
      });

      this.pinSourceVector.forEachFeature((feature) => {
        const featureCoordinate = feature.getGeometry().flatCoordinates;
        this.setState({
          pinnedCoordinate: [
            ...this.state.pinnedCoordinate,
            { X: featureCoordinate[0], Y: featureCoordinate[1] }, // Refetch
          ],
        });
      });
    });
  }

  componentDidUpdate() {
    this.updateMap();
  }

  render() {
    return (
      <div id="fullscreen" className="fullscreen">
        <div className="container-fluid">
          <div className="row">
            <div className="col-sm-10" style={{ padding: 0 }}>
              <div id="map" className="map"></div>
            </div>
            <div className="col-sm-2">
              <div className="sidebar">
                <h4>React Openlayers</h4>
                <p className="note">( Sidebar )</p>
                <hr />
                <p className="coordinate">
                  <u>Current Coordinate</u>
                  <br />X : {this.state.center[0]}
                  <br />Y : {this.state.center[1]}
                  <br /> Zoom : {this.state.zoom}
                  <hr />
                </p>
                <div className="pin-box">
                  <u className="coordinate">Pinned Coordinate</u>
                  <div className="pin-box-container">
                    <p className="coordinate">
                      <br />
                      {this.state.pinnedCoordinate.map((pin, key) => (
                        <>
                          X : {pin.X}
                          <br />Y : {pin.Y}
                          <hr />
                        </>
                      ))}
                    </p>
                  </div>
                </div>
                <br />
                <button
                  onClick={() => this.setState(initialOptions)}
                  className="btn btn-light btn-block"
                >
                  Set default view coordinate
                </button>
                {this.state.zoom >= 5 && (
                  <button
                    onClick={() => this.togglePin()}
                    className={`btn ${
                      this.state.pin ? "btn-danger" : "btn-success"
                    } btn-block`}
                  >
                    {this.state.pin ? (
                      <MdLocationOff size="26" />
                    ) : (
                      <MdLocationOn size="26" />
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;