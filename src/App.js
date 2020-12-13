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
import { Circle, Fill, Stroke, Style, Text } from "ol/style";

import Shadow from "ol-ext/style/Shadow";
import FontSymbol from "ol-ext/style/FontSymbol";
import Popup from "ol-ext/overlay/Popup";

import { Modal, Form } from "react-bootstrap";

import "./App.scss";
import "ol/ol.css";
import "ol-ext/dist/ol-ext.min.css";

const clusterCount = 2000;
const clusterDistance = 50;
const initialOptions = {
  center: [53566969.48271899, -688971.3316195873],
  zoom: 5.1,
};
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ...initialOptions,
      mark: false,
      markedFeature: [],
      title: "",
      desc: "",
      featureCache: null,
      modalShow: false,
    };

    // Mark Location Icon Layer
    this.markSourceVector = new OlSourceVector();
    this.markVectorLayer = new OlVectorLayer({
      source: this.markSourceVector,
      style: [
        new Style({
          image: new Shadow({
            radius: 10,
            blur: 5,
            offsetX: 0,
            offsetY: 0,
            fill: new Fill({
              color: "rgba(0,0,0,0.5)",
            }),
          }),
        }),
        new Style({
          image: new FontSymbol({
            form: "marker",
            fontSize: 0.9,
            radius: 18,
            offsetY: -15,
            glyph: "⦿",
            gradient: false,
            rotation: (10 * Math.PI) / 180,
            fill: new Fill({
              color: "#e74c3c",
            }),
            stroke: new Stroke({
              color: "white",
              width: 2,
            }),
            color: "white",
          }),
          stroke: new Stroke({
            width: 2,
            color: "#f80",
          }),
          fill: new Fill({
            color: [255, 136, 0, 0.6],
          }),
        }),
      ],
      minZoom: 4.5,
    });

    // Interaction for draw mark
    this.markInteractionList = [
      new OlDraw({
        source: this.markSourceVector,
        type: "Point",
      }),
      new OlModify({ source: this.markSourceVector }),
    ];

    // Overlay popup
    this.popup = new Popup({
      popupClass: "default anim",
      closeBox: true,
      positioning: "bottom-auto",
      autoPan: true,
      autoPanAnimation: { duration: 100 },
    });

    // Cluster mark
    this.markClusterFeatures = new Array(clusterCount);
    for (let i = 0; i < clusterCount; ++i) {
      const coordinates = [
        54000000 + 2 * 3000000 * Math.random() - 3000000,
        2 * 600000 * Math.random() - 600000 - 600000,
      ];
      this.markClusterFeatures[i] = new OlFeature({
        geometry: new Point(coordinates),
        title: "Random mark location",
        desc:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin ut lorem id elit iaculis vestibulum ut eget libero. Cras eget.",
        id: i,
      });
    }

    this.markClusterSource = new OlSourceVector({
      features: this.markClusterFeatures,
    });

    this.clusterSource = new OlSourceCluster({
      distance: clusterDistance,
      source: this.markClusterSource,
    });

    this.styleCache = {};
    this.clusterVectorLayer = new OlVectorLayer({
      source: this.clusterSource,
      style: (feature) => {
        const size = feature.get("features").length;
        let style = this.styleCache[size];
        if (!style) {
          style =
            size > 1
              ? new Style({
                  image: new Circle({
                    radius:
                      size >= 10
                        ? size >= 50
                          ? size / 2
                          : size
                        : size <= 4
                        ? 8
                        : size * 2, // Optimize oversize circle cluster
                    stroke: new Stroke({
                      color: "white",
                    }),
                    fill: new Fill({
                      color: "rgba(0, 0, 0, 0.5)",
                    }),
                  }),
                  text: new Text({
                    text: size.toString(),
                    fill: new Fill({
                      color: "#fff",
                    }),
                  }),
                })
              : [
                  new Style({
                    image: new Shadow({
                      radius: 10,
                      blur: 5,
                      offsetX: 0,
                      offsetY: 0,
                      fill: new Fill({
                        color: "rgba(0,0,0,0.5)",
                      }),
                    }),
                  }),
                  new Style({
                    image: new FontSymbol({
                      form: "marker",
                      fontSize: 0.9,
                      radius: 18,
                      rotation: (10 * Math.PI) / 180, // Random from -20 to 20
                      glyph: "⦿",
                      gradient: false,
                      fill: new Fill({
                        color: "gray",
                      }),
                      stroke: new Stroke({
                        color: "white",
                        width: 2,
                      }),
                      color: "white",
                    }),
                    stroke: new Stroke({
                      width: 2,
                      color: "#f80",
                    }),
                    fill: new Fill({
                      color: [255, 136, 0, 0.6],
                    }),
                  }),
                ];
          this.styleCache[size] = style;
        }
        return style;
      },
      minZoom: 4.5,
    });

    // Layers
    this.layers = [
      new OlTileLayer({
        source: new OlSourceOSM(),
      }),
      this.clusterVectorLayer,
      this.markVectorLayer,
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
      overlays: [this.popup],
    });
  }

  handleChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  handleSubmit = (event) => {
    event.preventDefault();
    if (this.state.title.length <= 3 || this.state.desc.length <= 10) {
      alert(
        "Fill the form correctly, (min 3 character on title and 10 character on description"
      );
      return;
    }

    this.state.featureCache.setProperties({
      title: this.state.title,
      desc: this.state.desc,
    });
    this.setState((prevState) => ({
      title: "",
      desc: "",
      modalShow: false,
      featureCache: null,
      markedFeature: [
        ...prevState.markedFeature,
        {
          id: prevState.markedFeature + 1,
          title: prevState.title,
          desc: prevState.desc,
          coordinate: prevState.featureCache.getGeometry().getCoordinates(),
        },
      ],
    }));
  };

  handleClose = () => {
    this.setState({ title: "", desc: "", modalShow: false }, () => {
      this.markSourceVector.removeFeature(this.state.featureCache);
    });
  };

  toggleMark = () => {
    this.setState(
      (prevState) => ({ mark: !prevState.mark }),
      () =>
        this.markInteractionList.map((interaction) =>
          this.state.mark
            ? this.map.addInteraction(interaction)
            : this.map.removeInteraction(interaction)
        )
    );
  };

  flyTo = (location, zoomEnd) => {
    let duration = 2000,
      zoom = this.map.getView().getZoom(),
      parts = 2,
      called = false;

    function callback(complete) {
      --parts;
      if (called) {
        return;
      }
      if (parts === 0 || !complete) {
        called = true;
      }
    }

    this.map.getView().animate(
      {
        center: location,
        duration: duration,
      },
      callback
    );

    this.map.getView().animate(
      {
        zoom: zoom - 0.6,
        duration: duration / 2,
      },
      {
        zoom: zoomEnd ? zoomEnd : zoom + 1.5,
        duration: duration / 2,
      },
      callback
    );
  };

  componentDidMount() {
    // Set map target (DOM)
    this.map.setTarget("map");

    // Add map event callback
    this.map.on("click", (evt) => {
      if (this.state.mark) return;

      let feature = this.map.forEachFeatureAtPixel(evt.pixel, (feature) => {
        return feature;
      });

      if (feature) {
        let coordinates = feature.getGeometry().getCoordinates(),
          element;
        const isCluster = feature.get("features");

        if (isCluster) {
          const clusterLength = isCluster.length;
          if (clusterLength > 1)
            element = `<b>Cluster Zone (${clusterLength} Mark)</b>`;
          else {
            element = `<b>${isCluster[0].getProperties().title} (${
              isCluster[0].getProperties().id
            })</b><p>${isCluster[0].getProperties().desc}</p>`;
          }
        } else {
          element = `<b>${feature.getProperties().title} 
          </b><p>${feature.getProperties().desc}</p>`;
        }

        this.popup.show(coordinates, element);
        console.log(feature);
      } else {
        this.popup.hide();
      }
    });

    this.map.on("moveend", () => {
      // Update coordinate and zoom state
      let center = this.map.getView().getCenter();
      let zoom = this.map.getView().getZoom();
      this.setState({ center, zoom });

      if (zoom < 4.5) this.state.mark && this.toggleMark();
    });

    // Drawend mark event
    this.markInteractionList[0].on("drawend", (evt) => {
      this.setState(
        {
          featureCache: evt.feature,
        },
        () => this.setState({ modalShow: true })
      );
    });
  }

  render() {
    return (
      <div id="fullscreen" className="fullscreen">
        <div className="container-fluid">
          <div className="row">
            <div className="col-sm-10" style={{ padding: 0 }}>
              <div id="map" className="map">
                <Modal
                  show={this.state.modalShow}
                  onHide={this.handleClose}
                  backdrop="static"
                  keyboard={false}
                >
                  <Form onSubmit={this.handleSubmit}>
                    <Modal.Header closeButton>
                      <Modal.Title>Mark options</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                      <Form.Group>
                        <Form.Control
                          type="text"
                          placeholder="Enter mark title"
                          name="title"
                          value={this.state.title}
                          onChange={this.handleChange}
                        />
                        <Form.Text className="text-muted">*required</Form.Text>
                      </Form.Group>
                      <Form.Group>
                        <Form.Control
                          as="textarea"
                          placeholder="Enter mark description"
                          name="desc"
                          onChange={this.handleChange}
                        />
                        <Form.Text className="text-muted">*required</Form.Text>
                      </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                      <button type="submit" className="btn btn-primary">
                        Save
                      </button>
                    </Modal.Footer>
                  </Form>
                </Modal>
              </div>
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
                <div className="mark-box">
                  <u className="coordinate">New mark location list</u>
                  <div className="mark-box-container">
                    <p className="coordinate">
                      {this.state.markedFeature.map((mark) => (
                        <>
                          <button
                            className="btn btn-primary btn-sm btn-block"
                            onClick={() => this.flyTo(mark.coordinate)}
                          >
                            {mark.title}
                          </button>
                        </>
                      ))}
                    </p>
                  </div>
                </div>
                <br />
                <button
                  onClick={() =>
                    this.flyTo(initialOptions.center, initialOptions.zoom)
                  }
                  className="btn btn-light btn-block"
                >
                  Set default view coordinate
                </button>
                {this.state.zoom > 4.5 && (
                  <button
                    onClick={() => this.toggleMark()}
                    className={`btn ${
                      this.state.mark ? "btn-danger" : "btn-success"
                    } btn-block`}
                  >
                    {this.state.mark ? (
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
