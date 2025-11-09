import React, { useEffect, useState } from 'react';
import axios from 'axios';

const HuespedTable = () => {
  const [huespedes, setHuespedes] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:3002/api/huespedes').then(res => setHuespedes(res.data));
  }, []);

  return (
    <div className="overflow-x-auto max-w-[98vw] mx-auto rounded-lg border border-gray-300 shadow-lg">
      <table className="min-w-full divide-y divide-gray-300">
        <thead style={{ backgroundColor: '#71a78c' }} className="text-white select-none">
          <tr>
            <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wide">Nombre Completo</th>
            <th className="px-4 py-4 text-left text-sm font-semibold uppercase tracking-wide">DNI</th>
            <th className="px-4 py-4 text-left text-sm font-semibold uppercase tracking-wide">NIT</th>
            <th className="px-5 py-4 text-left text-sm font-semibold uppercase tracking-wide">Nacimiento</th>
            <th className="px-5 py-4 text-left text-sm font-semibold uppercase tracking-wide">Teléfono</th>
            <th className="px-5 py-4 text-left text-sm font-semibold uppercase tracking-wide">Email</th>
            <th className="px-5 py-4 text-left text-sm font-semibold uppercase tracking-wide">Ciudad</th>
            <th className="px-5 py-4 text-left text-sm font-semibold uppercase tracking-wide">País</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {huespedes.map((h) => (
            <tr
              key={h.dni}
              className={`transition-colors duration-200 ${
                huespedes.indexOf(h) % 2 === 0 ? "bg-gray-50 hover:bg-blue-100" : "bg-white hover:bg-blue-100"
              }`}
            >
              <td className="px-6 py-3 whitespace-nowrap font-medium text-gray-900">
                {h.primer_nombre} {h.segundo_nombre} {h.primer_apellido} {h.segundo_apellido}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-gray-700">{h.dni}</td>
              <td className="px-4 py-3 whitespace-nowrap text-gray-700">{h.nit}</td>
              <td className="px-5 py-3 whitespace-nowrap text-gray-700">{h.fecha_nacimiento}</td>
              <td className="px-5 py-3 whitespace-nowrap text-gray-700">{h.telefono}</td>
              <td className="px-5 py-3 whitespace-nowrap text-gray-700">{h.email}</td>
              <td className="px-5 py-3 whitespace-nowrap text-gray-700">{h.ciudad}</td>
              <td className="px-5 py-3 whitespace-nowrap text-gray-700">{h.pais}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default HuespedTable;
