import React from "react";
import { OverlayTrigger, Tooltip, Button } from "react-bootstrap";
import { MdLocationOn, MdLocationOff } from "react-icons/md";

const Sidebar = (props) => {
  const { options, initialOptions, flyTo, toggleMark } = props;
  return (
    <div className="sidebar">
      <h4>React Openlayers</h4>
      <p className="note">( Sidebar )</p>
      <hr />
      <p className="coordinate">
        <u>Current Coordinate</u>
        <br />X : {options.center[0]}
        <br />Y : {options.center[1]}
        <br /> Zoom : {options.zoom}
        <hr />
      </p>
      <div className="mark-box">
        <u className="coordinate">
          New mark location list | Total: {options.markedFeature.length}
        </u>
        <div className="mark-box-container">
          <p className="coordinate">
            {options.markedFeature.map((mark, key) => (
              <OverlayTrigger
                placement="left"
                overlay={
                  <Tooltip>
                    X: {Math.round(mark.coordinate[0])}
                    <br />
                    Y: {Math.round(mark.coordinate[1])}
                  </Tooltip>
                }
              >
                <Button
                  variant="primary"
                  onClick={() => flyTo(mark.coordinate)}
                  block
                >
                  {mark.title + " (" + mark.id + ")"}
                </Button>
              </OverlayTrigger>
            ))}
          </p>
        </div>
      </div>
      <br />
      <button
        onClick={() => flyTo(initialOptions.center, initialOptions.zoom)}
        className="btn btn-light btn-block"
      >
        Set default view coordinate
      </button>
      {options.zoom > 4.5 && (
        <button
          onClick={() => toggleMark()}
          className={`btn ${
            options.mark ? "btn-danger" : "btn-success"
          } btn-block`}
        >
          {options.mark ? (
            <MdLocationOff size="26" />
          ) : (
            <MdLocationOn size="26" />
          )}
        </button>
      )}
    </div>
  );
};

export default Sidebar;
