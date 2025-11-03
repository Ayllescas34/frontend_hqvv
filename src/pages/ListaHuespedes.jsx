import React, { useEffect, useState } from 'react';
import axios from 'axios';
import HuespedTable from '../components/HuespedTable';

const ListaHuespedes = () => {
  const [huespedes, setHuespedes] = useState([]);

  const fetchHuespedes = async () => {
    try {
      const res = await axios.get('http://localhost:3002/api/huespedes');
      setHuespedes(res.data);
    } catch (error) {
      console.error('Error al cargar huéspedes:', error);
    }
  };

  useEffect(() => {
    fetchHuespedes();
  }, []);

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6 text-center">Lista de Huéspedes</h2>
      <HuespedTable huespedes={huespedes} />
    </div>
  );
};

export default ListaHuespedes;
