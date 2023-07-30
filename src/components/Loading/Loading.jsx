import Spinner from 'react-bootstrap/Spinner'

import './Loading.css'

export const Loading = () => {
    const style = { position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
    const spinnerStyle = { width: "3rem", height: "3rem" };

    return (
        <div style={style}>
            <Spinner style={spinnerStyle} animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
            </Spinner>
        </div>
    )
}