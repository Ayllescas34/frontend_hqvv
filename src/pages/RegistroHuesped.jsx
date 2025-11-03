import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import HuespedForm from '../components/HuespedForm';

const RegistroHuesped = () => {
  const [dpi, setDpi] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [initialDni, setInitialDni] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const navigate = useNavigate();

  const handleBuscar = async () => {
    setError('');
    setInfo('');
    if (!dpi.trim()) {
      setError('Por favor ingresa un DPI válido.');
      return;
    }
    try {
      const res = await axios.get(`http://localhost:3002/api/huespedes/buscar/${dpi}`);
      let huesped = null;
      if (Array.isArray(res.data) && res.data.length > 0) {
        huesped = res.data[0];
      } else if (res.data && res.data.dni) {
        huesped = res.data;
      }
      if (huesped && huesped.dni) {
        setInfo('¡El huésped ya existe! Serás redirigido para registrar una reserva.');
        setTimeout(() => {
          navigate('/registro-reserva', { state: { huesped } });
        }, 1500);
      } else {
        setShowForm(true);
        setInitialDni(dpi);
        setInfo('No se encontró el huésped. Por favor completa el registro.');
      }
    } catch (err) {
      setShowForm(true);
      setInitialDni(dpi);
      setInfo('No se encontró el huésped. Por favor completa el registro.');
    }
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6 text-center">Registrar Huésped</h2>
      <div className="flex flex-col md:flex-row items-center gap-4 mb-6 justify-center">
        <input
          type="text"
          placeholder="Ingrese DPI"
          className="border rounded px-3 py-2"
          value={dpi}
          onChange={e => setDpi(e.target.value)}
        />
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          onClick={handleBuscar}
        >
          Buscar
        </button>
      </div>
      {error && <div className="text-red-600 mb-2 text-center">{error}</div>}
      {info && <div className="text-green-700 mb-4 text-center font-semibold">{info}</div>}
      {showForm && <HuespedForm initialDni={initialDni} />}
    </div>
  );
};

export default RegistroHuesped;
