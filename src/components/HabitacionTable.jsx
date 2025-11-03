import React, { useEffect, useState } from 'react';
import axios from 'axios';

const HabitacionTable = () => {
  const [habitaciones, setHabitaciones] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:3002/api/habitaciones').then(res => setHabitaciones(res.data));
  }, []);

  return (
    <div className="overflow-x-auto max-w-[98vw] mx-auto rounded-lg border border-gray-300 shadow-lg mt-8">
      <table className="min-w-full divide-y divide-gray-300">
        <thead style={{ backgroundColor: '#71a78c' }} className="text-white select-none">
          <tr>
            <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wide">ID</th>
            <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wide">Nombre</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {habitaciones.map((h) => (
            <tr key={h.id_habitacion} className="hover:bg-blue-100">
              <td className="px-6 py-3 whitespace-nowrap text-gray-900">{h.id_habitacion}</td>
              <td className="px-6 py-3 whitespace-nowrap text-gray-700">{h.nombre}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default HabitacionTable;
