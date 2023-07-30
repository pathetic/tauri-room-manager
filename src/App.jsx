import { Routes, Route } from 'react-router-dom';
import { DbSetup } from './pages/DbSetup/DbSetup'
import { Home } from './pages/Home/Home';
import { Reservations } from './pages/Reservations/Reservations';
import { Verify } from './pages/Verify/Verify';

import "./App.css";

import 'bootstrap/dist/css/bootstrap.min.css';

function App() {

  return (
    <>
      <Routes>
        <Route path="/" element={<DbSetup />} />

        <Route path="/home" element={<Home />} />
        <Route path="/reservations" element={<Reservations />} />
        <Route path="/verify" element={<Verify />} />

        <Route path="*" element={<Home />} />
      </Routes>
    </>
  );
}

export default App;
