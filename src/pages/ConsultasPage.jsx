import { useState } from 'react';
import axios from 'axios';
import { BarChartSimple, PieChartSimple } from '../components/Charts';

const consultas = [
  { id: 'count-between-dates', descripcion: 'Cantidad de huéspedes entre fechas', requiereFechas: true },
  { id: 'list-between-dates', descripcion: 'Lista de huéspedes entre fechas', requiereFechas: true },
  { id: 'birthday-month', descripcion: 'Huéspedes que cumplen años en un mes', requiereMes: true },
  { id: 'visits-count', descripcion: 'Veces que vino cada huésped (todos los tiempos)' },
  { id: 'visits-count-between-dates', descripcion: 'Veces que vino cada huésped en un rango de fechas', requiereFechas: true },
  { id: 'count-by-contact-type', descripcion: 'Cantidad por tipo de contacto' },
  { id: 'count-by-payment-type', descripcion: 'Cantidad por tipo de pago' },
  { id: 'avg-nights-per-guest', descripcion: 'Promedio de noches por huésped' },
  { id: 'total-nights-between-dates', descripcion: 'Total de noches ocupadas en un rango', requiereFechas: true },
  { id: 'count-by-month', descripcion: 'Cantidad de huéspedes por mes' },
  { id: 'long-stays', descripcion: 'Estancias largas (>5 noches)' },
  { id: 'payment-type-by-month', descripcion: 'Distribución de tipo de pago por mes' },

  // Nuevas consultas de habitaciones y ingresos:
  { id: 'room-usage-count', descripcion: 'Cantidad veces que se usó cada habitación' },
  { id: 'room-total-nights', descripcion: 'Total noches por habitación' },
  { id: 'room-total-income', descripcion: 'Total ingresos por habitación' },
  { id: 'income-by-day', descripcion: 'Ingresos totales por día' },
  { id: 'income-by-week', descripcion: 'Ingresos totales por semana ISO' },
  { id: 'income-by-month', descripcion: 'Ingresos totales por mes' },
];

const ConsultasPage = () => {
  const [consultaSeleccionada, setConsultaSeleccionada] = useState('');
  const [resultado, setResultado] = useState(null);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [mes, setMes] = useState('6'); // Default a junio

  const consultaObj = consultas.find(c => c.id === consultaSeleccionada);

  const ejecutarConsulta = async () => {
    if (!consultaSeleccionada) {
      alert('Selecciona una consulta');
      return;
    }

    // Validaciones según tipo de parámetro
    if (consultaObj?.requiereFechas) {
      if (!fechaInicio || !fechaFin) {
        alert('Debes seleccionar fecha inicio y fin');
        return;
      }
      if (new Date(fechaInicio) > new Date(fechaFin)) {
        alert('La fecha inicio no puede ser mayor a la fecha fin');
        return;
      }
    }

    if (consultaObj?.requiereMes) {
      const mesNum = Number(mes);
      if (!mes || mesNum < 1 || mesNum > 12) {
        alert('Debes seleccionar un mes válido');
        return;
      }
    }

    try {
      let url = `http://localhost:3002/api/huespedes/${consultaSeleccionada}`;
      let params = {};

      if (consultaObj?.requiereFechas) {
        params = { startDate: fechaInicio, endDate: fechaFin };
      }

      if (consultaObj?.requiereMes) {
        // Mes va como parámetro en la URL
        url += `/${mes}`;
      }

      const res = await axios.get(url, { params });
      setResultado(res.data);
    } catch (error) {
      console.error('Error al ejecutar consulta:', error);
      alert('Error al ejecutar la consulta. Revisa la consola para más detalles.');
      setResultado(null);
    }
  };

  // Renderiza el resultado dependiendo del tipo de dato recibido
  const renderResultado = () => {
    if (!resultado) {
      return <p>No hay resultados para mostrar.</p>;
    }

    // Si resultado es objeto simple (ej. sumas)
    if (!Array.isArray(resultado) && typeof resultado === 'object') {
      return (
        <pre className="bg-gray-100 p-4 rounded max-h-96 overflow-auto text-sm whitespace-pre-wrap">
          {JSON.stringify(resultado, null, 2)}
        </pre>
      );
    }

    // Si resultado es array vacío
    if (Array.isArray(resultado) && resultado.length === 0) {
      return <p>No hay resultados para mostrar.</p>;
    }

    // Si resultado es array de objetos, se muestra tabla
    if (Array.isArray(resultado)) {
      const keys = Object.keys(resultado[0]);

      return (
        <div className="overflow-auto max-h-[400px] border rounded">
          <table className="min-w-full table-auto border-collapse">
            <thead className="bg-gray-200 sticky top-0">
              <tr>
                {keys.map(key => (
                  <th
                    key={key}
                    className="border px-3 py-1 text-left text-sm font-medium"
                  >
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {resultado.map((item, idx) => (
                <tr
                  key={idx}
                  className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                >
                  {keys.map(key => (
                    <td key={key} className="border px-3 py-1 text-sm">
                      {item[key] != null ? item[key].toString() : ''}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    return <p>Formato de resultado no soportado.</p>;
  };

  // Función para graficar cualquier array de objetos
  const renderChart = () => {
    if (!resultado || !Array.isArray(resultado) || resultado.length === 0) return null;
    const keys = Object.keys(resultado[0]);
    if (keys.length < 2) return null;

    // Detectar campos categóricos y numéricos
    let stringKey = null;
    let numericKeys = [];
    for (const key of keys) {
      if (typeof resultado[0][key] === 'string' && !stringKey) stringKey = key;
      if (typeof resultado[0][key] === 'number') numericKeys.push(key);
    }
    if (!stringKey || numericKeys.length === 0) return null;

    // Si solo hay un campo numérico y pocos valores únicos, usar pastel
    if (numericKeys.length === 1 && resultado.length <= 8) {
      return (
        <div className="my-8">
          <h3 className="text-lg font-semibold mb-2">Gráfica</h3>
          <PieChartSimple data={resultado} dataKey={numericKeys[0]} nameKey={stringKey} />
        </div>
      );
    }
    // Si hay varios campos numéricos, mostrar varias series de barras
    if (numericKeys.length > 1) {
      return (
        <div className="my-8">
          <h3 className="text-lg font-semibold mb-2">Gráfica</h3>
          <BarChartSimple data={resultado} xKey={stringKey} barKey={numericKeys[0]} label={numericKeys[0]} />
        </div>
      );
    }
    // Si solo hay un campo numérico y muchos valores, usar barras
    return (
      <div className="my-8">
        <h3 className="text-lg font-semibold mb-2">Gráfica</h3>
        <BarChartSimple data={resultado} xKey={stringKey} barKey={numericKeys[0]} label={numericKeys[0]} />
      </div>
    );
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6 text-center">Consultas útiles</h2>

      <div className="flex flex-col items-center justify-center mb-6 space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
        <select
          value={consultaSeleccionada}
          onChange={e => setConsultaSeleccionada(e.target.value)}
          className="border p-2 rounded w-80"
        >
          <option value="">Selecciona una consulta</option>
          {consultas.map(q => (
            <option key={q.id} value={q.id}>
              {q.descripcion}
            </option>
          ))}
        </select>

        {consultaObj?.requiereFechas && (
          <div className="flex space-x-2">
            <input
              type="date"
              value={fechaInicio}
              onChange={e => setFechaInicio(e.target.value)}
              className="border p-2 rounded"
              placeholder="Fecha inicio"
            />
            <input
              type="date"
              value={fechaFin}
              onChange={e => setFechaFin(e.target.value)}
              className="border p-2 rounded"
              placeholder="Fecha fin"
            />
          </div>
        )}

        {consultaObj?.requiereMes && (
          <select
            value={mes}
            onChange={e => setMes(e.target.value)}
            className="border p-2 rounded"
          >
            {[...Array(12)].map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(0, i).toLocaleString('es-ES', { month: 'long' })}
              </option>
            ))}
          </select>
        )}

        <button
          onClick={ejecutarConsulta}
          style={{ backgroundColor: '#71a78c' }}
          className="text-white px-4 py-2 rounded hover:opacity-90 transition"
        >
          Ejecutar
        </button>
      </div>

      <div>{renderChart()}{renderResultado()}</div>
    </div>
  );
};

export default ConsultasPage;
