import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';

import { invoke } from "@tauri-apps/api/tauri";

import './Navbar.css';

export const NavbarComp = () => {
    const location = useLocation();

    const [url, setUrl] = useState(null);
    useEffect(() => {
        setUrl(location.pathname);
    }, [location]);

    const handleSave = async () => {
        await invoke("save_state", {});
    }

    return (
        <Navbar expand="lg" bg="dark" variant="dark" className="sticky-top">
            <Container>
                <Navbar.Brand>Room Manager</Navbar.Brand>
                <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                <Navbar.Collapse id="responsive-navbar-nav">
                    <Nav className="me-auto">
                        <Nav.Link as={Link} to="/home" className={url === "/home" ? " active" : "inactive"}> Calendar</Nav.Link>
                        <Nav.Link as={Link} to="/reservations" className={url === "/reservations" ? " active" : "inactive"}>Reservations</Nav.Link>
                        <Nav.Link as={Link} to="/verify" className={url === "/verify" ? " active" : "inactive"}>Verify availability</Nav.Link>
                    </Nav>
                    <Nav>
                        <Nav.Link className={"signout highlight"} onClick={handleSave}>SAVE DB</Nav.Link>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar >
    )
}