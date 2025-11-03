import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HuespedForm from './components/HuespedForm';
import HuespedTable from './components/HuespedTable';
import ReservaForm from './components/ReservaForm';
import ReservaTable from './components/ReservaTable';
import HabitacionTable from './components/HabitacionTable';
import Reportes from './components/Reportes';
import logo from './img/logo_hotel.jpg';
import RegistroHuesped from './pages/RegistroHuesped';

const Home = () => (
  <div className="max-w-3xl mx-auto mt-10 text-center">
    <h1 className="text-3xl font-bold mb-4">
      Bienvenido al Hotel Quinta Vista Verde
    </h1>
    <p className="text-lg">
      Sistema de gestión de huéspedes, reservas y habitaciones.
    </p>
    <img
      src={logo}
      alt="Logo Hotel"
      className="h-40 w-auto rounded shadow-lg border border-gray-300"
    />
  </div>
);

const App = () => {
  return (
    <Router>
      <Navbar />
      <div className="mt-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/lista-huespedes" element={<HuespedTable />} />
          <Route path="/registro-huesped" element={<RegistroHuesped />} />
          <Route path="/reservas" element={<ReservaTable />} />
          <Route path="/registro-reserva" element={<ReservaForm />} />
          <Route path="/habitaciones" element={<HabitacionTable />} />
          <Route path="/reportes" element={<Reportes />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
