import { useState } from 'react';
import { NavbarComp } from '../../components/Navbar/Navbar';
import { Card, Table, Container, Row, Col, Form, Button, Alert, Badge, Spinner } from 'react-bootstrap';
import { invoke } from "@tauri-apps/api/tauri";

import './Verify.css'

const ROOM_DICTIONARY = {
    "1": "Apartment 1",
    "2": "Apartment 2",
    "101": "Camera 101",
    "102": "Camera 102",
    "103": "Camera 103",
    "104": "Camera 104",
    "105": "Camera 105",
    "106": "Camera 106",
    "107": "Camera 107",
    "108": "Camera 108",
    "109": "Camera 109",
    "110": "Camera 110"
}

var ROOM_AVAILABLE = {
    "1": "?",
    "2": "?",
    "101": "?",
    "102": "?",
    "103": "?",
    "104": "?",
    "105": "?",
    "106": "?",
    "107": "?",
    "108": "?",
    "109": "?",
    "110": "?"
}

const STATUS_DICTIONARY = {
    "Available": "success",
    "Occupied": "danger",
    "?": "dark"
}

export const Verify = () => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [visibleMessage, setVisibleMessage] = useState(false);

    const [loading, setLoading] = useState(true);

    const spinnerStyle = { width: "3rem", height: "3rem" };

    function toyyyymmdd(date) {
        var d = new Date(date),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();

        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;

        return [year, month, day].join('-');
    }

    const handleVisible = () => {
        setVisibleMessage(true)
        setTimeout(() => {
            setVisibleMessage(false)
        }, 5000);
    }

    const handleVerify = async () => {
        setLoading(true);

        const resp = await invoke("search_between", { start: startDate, end: endDate });

        for (var key in ROOM_AVAILABLE) {
            ROOM_AVAILABLE[key] = "Available";
        }

        for (let i = 0; i < resp.length; i++) {
            ROOM_AVAILABLE[resp[i].resource_id] = "Occupied";
        }

        setLoading(false);

        setMessageType('success');
        setMessage("Verification successful.");
        handleVisible();
    }

    return (
        <>
            <NavbarComp />

            <div id="verify">
                <Alert show={visibleMessage} id="alert" key={messageType} variant={messageType}>
                    {message}
                </Alert>

                <div id="verify-header">
                    <h1>Verify availability</h1>
                </div>

                <Container>
                    <Row>
                        <Col>
                            <Card>
                                <Card.Body>
                                    <Form>
                                        <Form.Group className="mb-3" controlId="duedate">
                                            <Form.Label>Arrival date</Form.Label>
                                            <Form.Control
                                                type="date"
                                                name="duedate"
                                                placeholder="Due date"
                                                value={startDate}
                                                onChange={(e) => setStartDate(toyyyymmdd(e.target.value))}
                                            />
                                        </Form.Group>

                                        <Form.Group className="mb-3" controlId="duedate">
                                            <Form.Label>Leaving date</Form.Label>
                                            <Form.Control
                                                type="date"
                                                name="duedate"
                                                placeholder="Due date"
                                                value={endDate}
                                                onChange={(e) => setEndDate(toyyyymmdd(e.target.value))}
                                            />
                                        </Form.Group>
                                    </Form>

                                    <Button variant="primary" onClick={handleVerify}>Verify</Button>
                                </Card.Body>
                            </Card>

                        </Col>

                        <Col>
                            <Card className='cardsize'>
                                {
                                    loading ? (
                                        <>
                                            <div className="spinnerule">
                                                <Spinner style={spinnerStyle} animation="border" role="status">
                                                    <span className="visually-hidden">Loading...</span>
                                                </Spinner>
                                            </div>
                                            <h3 className="h3ul">Run a verification.</h3>
                                        </>
                                    ) : (
                                        <Card.Body>
                                            <Table striped bordered hover responsive>
                                                <thead>
                                                    <tr>
                                                        <th>Room</th>
                                                        <th>Availability</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {Object.keys(ROOM_DICTIONARY).map((key) => {
                                                        return (
                                                            <tr key={key}>
                                                                <td>{ROOM_DICTIONARY[key]}</td>
                                                                <td><Badge className="ml-5" bg={STATUS_DICTIONARY[ROOM_AVAILABLE[key]]}>{ROOM_AVAILABLE[key]}</Badge></td>
                                                            </tr>
                                                        )
                                                    }
                                                    )}
                                                </tbody>
                                            </Table>
                                        </Card.Body>
                                    )
                                }
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>
        </>
    )
}