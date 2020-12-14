import React from "react";
import { Modal, Form, Button } from "react-bootstrap";

const ModalCustom = (props) => {
  const { show, handleChange, handleSubmit, handleClose } = props;
  return (
    <Modal show={show} onHide={handleClose} keyboard={false} backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Mark options</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group>
            <Form.Control
              type="text"
              placeholder="Enter mark title ..."
              name="title"
              onChange={handleChange}
            />
            <Form.Text className="text-muted">* required</Form.Text>
          </Form.Group>
          <Form.Group>
            <Form.Control
              as="textarea"
              placeholder="Enter mark description ..."
              name="desc"
              onChange={handleChange}
            />
            <Form.Text className="text-muted">* required</Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button value="Save" as="input" type="submit" variant="primary" />
          <Button variant="danger" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ModalCustom;
