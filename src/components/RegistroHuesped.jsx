import React from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const RegistroHuesped = () => {
  const navigate = useNavigate();

  const handleRegistro = async () => {
    try {
      // Supón que el backend devuelve el nuevo huésped con su id
      const response = await axios.post('...');
      const nuevoId = response.data.id_huesped;
      navigate('/registro-reserva', { state: { idHuesped: nuevoId } });
    } catch (error) {
      console.error('Error al registrar el huésped:', error);
    }
  };

  return (
    <div>
      <h1>Registro de Huésped</h1>
      {/* ...formulario de registro... */}
      <button onClick={handleRegistro}>Registrar</button>
    </div>
  );
};

export default RegistroHuesped;