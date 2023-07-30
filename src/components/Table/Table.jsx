import { useState, useEffect } from 'react';
import { Badge, Table, Alert, Modal, Form, Button } from 'react-bootstrap';
import { Loading } from '../Loading/Loading';

import { invoke } from "@tauri-apps/api/tauri";

import './Table.css'

const ROOM_DICTIONARY = {
    "1": "Apartment 1",
    "2": "Apartment 2",
    "101": "Room 101",
    "102": "Room 102",
    "103": "Room 103",
    "104": "Room 104",
    "105": "Room 105",
    "106": "Room 106",
    "107": "Room 107",
    "108": "Room 108",
    "109": "Room 109",
    "110": "Room 110"
}

const STATUS_DICTIONARY = {
    "Reserved": "dark",
    "Arrived": "primary",
    "Left": "success",
    "Cancelled": "danger"
}

export const TableComp = () => {
    const [show, setShow] = useState(false);
    const [show2, setShow2] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [visibleMessage, setVisibleMessage] = useState(false);
    const [targetId, setTargetId] = useState('');

    const [loading, setLoading] = useState(true);

    const [confirm, setConfirm] = useState(false);

    const [bookings, setBookings] = useState([]);

    const [sort, setSort] = useState('creationDate');

    // MODAL DATA
    const [validDate, setValidDate] = useState(false);

    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [room, setRoom] = useState('1');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState('');

    const confirmClose = () => setConfirm(false);
    const confirmShow = () => setConfirm(true);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const handleClose2 = () => {
        setStartDate('');
        setEndDate('');
        setRoom('');
        setDescription('');
        setTargetId('');
        setShow2(false)
    };

    const handleShow2 = (id, start, end, room, desc, status) => {
        setStartDate(start);
        setEndDate(end);
        setRoom(room);
        setDescription(desc);
        setStatus(status);
        setTargetId(id);

        console.log(id);

        setShow2(true);
    }

    const handleVisible = () => {
        setVisibleMessage(true)
        setTimeout(() => {
            setVisibleMessage(false)
        }, 5000);
    }

    const updateBookings = async () => {
        setLoading(true)

        let bookings = await invoke("get_all_bookings", {});

        setBookings(bookings);
        setLoading(false);
    }

    useEffect(() => {
        updateBookings()
    }, [sort])

    useEffect(() => {
        var d1 = new Date(startDate);
        var d2 = new Date(endDate);

        if (d1.getTime() < d2.getTime()) {
            setValidDate(false)
        }
        else if (d1.getTime() === d2.getTime()) {
            setValidDate(false)
        }
        else {
            setValidDate(true)
        }
    }, [startDate, endDate])

    function toyyyymmdd(date) {
        var d = new Date(date),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();

        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;

        return [year, month, day].join('-');
    }

    const clearModal = () => {
        setStartDate('');
        setEndDate('');
        setRoom('');
        setDescription('');
    }

    const handleCreate = async (e) => {
        e.preventDefault();

        var parse1 = startDate.substring(startDate.lastIndexOf("-") + 1);
        var parse2 = endDate.substring(endDate.lastIndexOf("-") + 1);
        var parse3 = startDate.substring(startDate.indexOf("-") + 1, startDate.lastIndexOf("-"));
        var parse4 = endDate.substring(endDate.indexOf("-") + 1, endDate.lastIndexOf("-"));

        const title_formatted = `Reservation ${parse1}/${parse3} - ${parse2}/${parse4}`;

        const booking = await invoke("add_booking", { booking: { title: title_formatted, description, resource_id: room, start: startDate, end: endDate, status: "Reserved" } });

        setMessageType('success');
        setMessage("Reservation created with success!");
        handleVisible();

        updateBookings()

        clearModal();
        handleClose();
    }

    const handleUpdate = async (e) => {
        e.preventDefault();

        var parse1 = startDate.substring(startDate.lastIndexOf("-") + 1);
        var parse2 = endDate.substring(endDate.lastIndexOf("-") + 1);
        var parse3 = startDate.substring(startDate.indexOf("-") + 1, startDate.lastIndexOf("-"));
        var parse4 = endDate.substring(endDate.indexOf("-") + 1, endDate.lastIndexOf("-"));

        const title_formatted = `Reservation ${parse1}/${parse3} - ${parse2}/${parse4}`;

        console.log(targetId)
        console.log(title_formatted)
        console.log(description)
        console.log(room)
        console.log(startDate)
        console.log(endDate)



        const booking = await invoke("update_booking", { id: targetId, title: title_formatted, description, resourceId: room, start: startDate, end: endDate, status });

        if (booking) {
            setMessageType('success');
            setMessage("Reservation updated with success!");
            handleVisible();

            updateBookings()

            clearModal();
            handleClose2();
        }
        else {
            setMessageType('danger');
            setMessage("There was an error!");
            handleVisible();

            clearModal();
            handleClose2();
        }

    }

    const handleDelete = async (e) => {
        e.preventDefault();

        const booking = await invoke("delete_booking", { id: targetId });

        if (booking) {
            console.log('ok');
            setMessageType('success');
            setMessage("Reservation deleted succesfully!");
            handleVisible();
            updateBookings()

            clearModal();
            confirmClose();
            handleClose2();
        }
        else {
            setMessageType('danger');
            setMessage("There was an error!");
            handleVisible();

            confirmClose();
            handleClose2();
        }
    }

    return !loading ? (

        <>
            <Modal
                show={confirm}
                onHide={confirmClose}
                backdrop="static"
                keyboard={false}
            >
                <Modal.Header closeButton>
                    <Modal.Title>Confirm deletion</Modal.Title >
                </Modal.Header >
                <Modal.Body>
                    Cofirm deletetion of reservation?
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={handleDelete} variant="danger">Confirm</Button>
                </Modal.Footer>
            </Modal >



            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Create a reservation</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3" controlId="duedate">
                            <Form.Label>Arrival Date</Form.Label>
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
                                onChange={(e) =>
                                    setEndDate(toyyyymmdd(e.target.value))
                                }
                            />
                        </Form.Group>


                        <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                            <Form.Label>Room</Form.Label>
                            <Form.Control
                                as="select"
                                value={room}
                                onChange={(e) => setRoom(e.target.value)}
                            >
                                <option value="1">Apartment 1</option>
                                <option value="2">Apartment 2</option>
                                <option value="101">Room 101</option>
                                <option value="102">Room 102</option>
                                <option value="103">Room 103</option>
                                <option value="104">Room 104</option>
                                <option value="105">Room 105</option>
                                <option value="106">Room 106</option>
                                <option value="107">Room 107</option>
                                <option value="108">Room 108</option>
                                <option value="109">Room 109</option>
                                <option value="110">Room 110</option>
                            </Form.Control>
                        </Form.Group>


                        <Form.Group
                            className="mb-3"
                            controlId="exampleForm.ControlTextarea1"
                        >
                            <Form.Label>Details</Form.Label>
                            <Form.Control
                                as="textarea"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3} />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={clearModal}>
                        Clear
                    </Button>
                    <Button disabled={(!startDate || !endDate || !room || !description || validDate)} variant="primary" onClick={handleCreate}>
                        Create
                    </Button>
                </Modal.Footer>
            </Modal>


            <Modal show={show2} onHide={handleClose2}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit a reservation</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3" controlId="duedate">
                            <Form.Label>Arrival Date</Form.Label>
                            <Form.Control
                                type="date"
                                name="duedate"
                                placeholder="Due date"
                                value={startDate}
                                onChange={(e) => setStartDate(toyyyymmdd(e.target.value))}
                            />
                        </Form.Group>


                        <Form.Group className="mb-3" controlId="duedate">
                            <Form.Label>Leaving Date</Form.Label>
                            <Form.Control
                                type="date"
                                name="duedate"
                                placeholder="Due date"
                                value={endDate}
                                onChange={(e) =>
                                    setEndDate(toyyyymmdd(e.target.value))
                                }
                            />
                        </Form.Group>


                        <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                            <Form.Label>Room</Form.Label>
                            <Form.Control
                                as="select"
                                value={room}
                                onChange={(e) => setRoom(e.target.value)}
                            >
                                <option value="1">Apartment 1</option>
                                <option value="2">Apartment 2</option>
                                <option value="101">Room 101</option>
                                <option value="102">Room 102</option>
                                <option value="103">Room 103</option>
                                <option value="104">Room 104</option>
                                <option value="105">Room 105</option>
                                <option value="106">Room 106</option>
                                <option value="107">Room 107</option>
                                <option value="108">Room 108</option>
                                <option value="109">Room 109</option>
                                <option value="110">Room 110</option>
                            </Form.Control>
                        </Form.Group>


                        <Form.Group
                            className="mb-3"
                            controlId="exampleForm.ControlTextarea1"
                        >
                            <Form.Label>Details</Form.Label>
                            <Form.Control
                                as="textarea"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3} />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                            <Form.Label>Status</Form.Label>
                            <Form.Control
                                as="select"
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                            >
                                <option value="Reserved">Reserved</option>
                                <option value="Arrived">Arrived</option>
                                <option value="Left">Left</option>
                                <option value="Cancelled">Cancelled</option>

                            </Form.Control>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="danger" onClick={confirmShow}>
                        Delete
                    </Button>
                    <Button disabled={(!startDate || !endDate || !room || !description || validDate)} variant="primary" onClick={handleUpdate}>
                        Edit
                    </Button>
                </Modal.Footer>
            </Modal>


            <div id="table">

                <div className="row" id="table-header">
                    <Alert show={visibleMessage} id="alert" key={messageType} variant={messageType}>
                        {message}
                    </Alert>

                    <div className="col-md-2">
                        <h1>Reservations</h1>
                    </div>

                    <div className="col-md-2 mmm">
                        <Form.Select
                            onChange={(e) => setSort(e.target.value)}
                            value={sort}
                            aria-label="Default select example">
                            <option value="creationDate">Sort by creation date</option>
                            {/* <option value="startDate">Sortează după dată sosire</option> */}
                        </Form.Select>
                    </div>

                    <div className="col-md-2 mmm2">
                        <Button variant="primary" onClick={handleShow}>Create a reservation</Button>
                    </div>
                </div>
                <Table striped bordered hover responsive>
                    <thead>
                        <tr>
                            <th>Reservation</th>
                            <th>Room</th>
                            <th>Arrival date</th>
                            <th>Leaving date</th>
                            <th>Description</th>
                            <th>Options</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bookings.map((booking, index) => (
                            <tr key={index}>
                                <td>{booking.title} <Badge className="ml-5" bg={STATUS_DICTIONARY[booking.status]}>{booking.status}</Badge></td>
                                <td>{ROOM_DICTIONARY[booking.resource_id]}</td>
                                <td>{booking.start}</td>
                                <td>{booking.end}</td>
                                <td>{booking.description}</td>
                                <td>
                                    <Button className="spacing" variant="danger" onClick={() => handleShow2(booking.id, booking.start, booking.end, booking.resource_id, booking.description, booking.status)}>Edit</Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>
        </>
    ) :
        (
            <>
                <div id="table">
                    <Alert show={visibleMessage} id="alert" key={messageType} variant={messageType}>
                        {message}
                    </Alert>
                </div>

                <Loading />
            </>
        )
}