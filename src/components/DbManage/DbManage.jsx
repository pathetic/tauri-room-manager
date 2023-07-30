import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { useNavigate } from "react-router-dom"

import { Spinner } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

export const DbManage = () => {
    const [loading, setLoading] = useState(true);
    const [dbExists, setDbExists] = useState(false);
    const [password, setPassword] = useState('');

    const navigate = useNavigate();

    const spinnerStyle = { width: "3rem", height: "3rem" };

    useEffect(() => {
        const checkDb = async () => {
            let does_db_exist = await invoke("does_db_exist");
            setDbExists(does_db_exist);
        }

        checkDb()
        setLoading(false)
    }, [])

    const createDb = async () => {
        if (password.length === 0) {
            return;
        }

        let resp = await invoke("create_state", { password });

        navigate("/home");
    }

    const openDb = async () => {
        if (password.length === 0) {
            return;
        }

        let resp = await invoke("read_save", { password });
        console.log(1);

        navigate("/home");
    }

    return (
        loading ?
            <>
                <div className="spinner-center">
                    <Spinner className="center" style={spinnerStyle} animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                </div>
                <h3 className="h3ul">Loading...</h3>
            </> :
            !dbExists ?
                <>
                    <Form className="db-manage">
                        <Form.Group className="mb-3" controlId="formBasicPassword">
                            <Form.Label>Password</Form.Label>
                            <Form.Control value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Password" />
                        </Form.Group>
                        <Button variant="primary" onClick={createDb}>
                            Create database
                        </Button>
                    </Form>
                </> :
                <>
                    <Form className="db-manage">
                        <Form.Group className="mb-3" controlId="formBasicPassword">
                            <Form.Label>Password</Form.Label>
                            <Form.Control value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Password" />
                        </Form.Group>
                        <Button variant="primary" onClick={openDb}>
                            Open database
                        </Button>
                    </Form>
                </>

    )
}