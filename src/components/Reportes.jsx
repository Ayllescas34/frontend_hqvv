import React, { useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Bar, Pie, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

// Utilidad para obtener el rango de fechas de una semana ISO
function getWeekRange(year, week) {
  // ISO week: Monday is first day
  const simple = new Date(year, 0, 1 + (week - 1) * 7);
  const dow = simple.getDay();
  let monday = new Date(simple);
  if (dow <= 4) {
    monday.setDate(simple.getDate() - simple.getDay() + 1);
  } else {
    monday.setDate(simple.getDate() + 8 - simple.getDay());
  }
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  // Formato: LUN DD - DOM DD
  const format = d => `${d.getDate().toString().padStart(2, '0')}`;
  return `LUN ${format(monday)} - DOM ${format(sunday)}`;
}

const reportesList = [
  {
    key: 'huespedes-entre-fechas',
    label: 'Cantidad de huéspedes entre fechas',
    params: ['startDate', 'endDate'],
    columns: ['total_huespedes']
  },
  {
    key: 'lista-huespedes-entre-fechas',
    label: 'Lista de huéspedes entre fechas',
    params: ['startDate', 'endDate'],
    columns: ['dni', 'primer_nombre', 'primer_apellido', 'fecha_nacimiento', 'ciudad', 'pais']
  },
  {
    key: 'cumpleanios-mes',
    label: 'Huéspedes que cumplen años en un mes',
    params: ['mes'],
    columns: ['dni', 'primer_nombre', 'primer_apellido', 'fecha_nacimiento']
  },
  {
    key: 'veces-que-vino',
    label: 'Veces que vino cada huésped (todos los tiempos)',
    params: [],
    columns: ['dni', 'nombre', 'veces_que_vino']
  },
  {
    key: 'veces-que-vino-entre-fechas',
    label: 'Veces que vino cada huésped en rango de fechas',
    params: ['startDate', 'endDate'],
    columns: ['dni', 'nombre', 'veces_que_vino']
  },
  {
    key: 'cantidad-por-contacto',
    label: 'Cantidad por tipo de contacto',
    params: [],
    columns: ['tipo_contacto', 'cantidad']
  },
  {
    key: 'cantidad-por-pago',
    label: 'Cantidad por tipo de pago',
    params: [],
    columns: ['tipo_pago', 'cantidad']
  },
  {
    key: 'promedio-noches-por-huesped',
    label: 'Promedio de noches por huésped',
    params: [],
    columns: ['dni', 'nombre', 'promedio_noches']
  },
  {
    key: 'total-noches-entre-fechas',
    label: 'Total de noches ocupadas en un rango de fechas',
    params: ['startDate', 'endDate'],
    columns: ['noches_ocupadas']
  },
  {
    key: 'huespedes-por-mes',
    label: 'Cantidad de huéspedes por mes',
    params: [],
    columns: ['anio', 'mes', 'cantidad']
  },
  {
    key: 'estancias-largas',
    label: 'Huéspedes con estancias largas (>5 noches)',
    params: [],
    columns: ['dni', 'nombre', 'total_noches']
  },
  {
    key: 'pago-por-mes',
    label: 'Distribución de tipos de pago por mes',
    params: [],
    columns: ['anio', 'mes', 'tipo_pago', 'cantidad']
  },
  {
    key: 'habitacion-uso',
    label: 'Cantidad de veces que se usó cada habitación',
    params: [],
    columns: ['habitacion', 'veces_usada']
  },
  {
    key: 'habitacion-uso-entre-fechas',
    label: 'Cantidad de veces que se usó cada habitación (rango de fechas)',
    params: ['startDate', 'endDate'],
    columns: ['habitacion', 'veces_usada']
  },
  {
    key: 'habitacion-noches',
    label: 'Total de noches por habitación',
    params: [],
    columns: ['habitacion', 'noches_ocupadas']
  },
  {
    key: 'habitacion-noches-entre-fechas',
    label: 'Total de noches por habitación (rango de fechas)',
    params: ['startDate', 'endDate'],
    columns: ['habitacion', 'noches_ocupadas']
  },
  {
    key: 'ingresos-dia',
    label: 'Ingresos totales por día',
    params: [],
    columns: ['fecha', 'ingresos_diarios']
  },
  {
    key: 'ingresos-semana',
    label: 'Ingresos totales por semana ISO',
    params: [],
    columns: ['anio', 'semana_iso', 'ingresos_semanales']
  },
  {
    key: 'ingresos-mes',
    label: 'Ingresos totales por mes',
    params: [],
    columns: ['anio', 'mes', 'ingresos_mensuales']
  },
  {
    key: 'ingresos-mes-entre-fechas',
    label: 'Ingresos totales por mes (rango de fechas)',
    params: ['startDate', 'endDate'],
    columns: ['anio', 'mes', 'ingresos_mensuales']
  },
  {
    key: 'perfil-huesped',
    label: 'Perfil de huésped con histórico de visitas',
    params: [],
    columns: ['dni', 'nombre', 'visitas', 'total_noches', 'total_gastado']
  },
  {
    key: 'ocupacion-habitacion-mes',
    label: 'Ocupación promedio de habitaciones por mes',
    params: [],
    columns: ['habitacion', 'anio', 'mes', 'veces_utilizada', 'porcentaje_ocupacion_aprox']
  },
  {
    key: 'temporada',
    label: 'Temporada Alta y Baja',
    params: [],
    columns: ['anio', 'mes', 'total_reservas', 'ingresos_totales']
  },
  {
    key: 'pago-preferido-periodo',
    label: 'Tipos de pago preferidos por periodo',
    params: [],
    columns: ['anio', 'mes', 'tipo_pago', 'total_veces', 'total_ingresos']
  },
  {
    key: 'huespedes-frecuentes',
    label: 'Análisis de huéspedes frecuentes (3 o más visitas)',
    params: [],
    columns: ['dni', 'nombre', 'visitas']
  },
  {
    key: 'promedio-noches-habitacion',
    label: 'Duración promedio de estadía por habitación',
    params: [],
    columns: ['habitacion', 'promedio_noches']
  },
  {
    key: 'huespedes-por-pais',
    label: 'Huéspedes por país',
    params: [],
    columns: ['pais', 'cantidad']
  },
  {
    key: 'ingresos-por-dia-semana',
    label: 'Días de la semana con más ingresos',
    params: [],
    columns: ['dia_semana', 'ingresos']
  },
];

const chartConfigs = {
  'ingresos-mes': {
    type: 'bar',
    label: 'Ingresos por mes',
    getLabels: data => data.map(d => `${d.anio}-${String(d.mes).padStart(2, '0')}`),
    getData: data => data.map(d => d.ingresos_mensuales),
    dataLabel: 'Ingresos',
  },
  'huespedes-por-mes': {
    type: 'bar',
    label: 'Huéspedes por mes',
    getLabels: data => data.map(d => `${d.anio}-${String(d.mes).padStart(2, '0')}`),
    getData: data => data.map(d => d.cantidad),
    dataLabel: 'Cantidad',
  },
  'cantidad-por-pago': {
    type: 'pie',
    label: 'Distribución de tipos de pago',
    getLabels: data => data.map(d => d.tipo_pago),
    getData: data => data.map(d => d.cantidad),
    dataLabel: 'Cantidad',
  },
  'cantidad-por-contacto': {
    type: 'pie',
    label: 'Distribución de tipos de contacto',
    getLabels: data => data.map(d => d.tipo_contacto),
    getData: data => data.map(d => d.cantidad),
    dataLabel: 'Cantidad',
  },
  'habitacion-noches': {
    type: 'bar',
    label: 'Noches por habitación',
    getLabels: data => data.map(d => d.habitacion),
    getData: data => data.map(d => d.noches_ocupadas),
    dataLabel: 'Noches',
  },
  'habitacion-uso': {
    type: 'bar',
    label: 'Veces usada cada habitación',
    getLabels: data => data.map(d => d.habitacion),
    getData: data => data.map(d => d.veces_usada),
    dataLabel: 'Veces usada',
  },
  'ingresos-dia': {
    type: 'line',
    label: 'Ingresos por día',
    getLabels: data => data.map(d => formatDate(d.fecha)),
    getData: data => data.map(d => d.ingresos_diarios),
    dataLabel: 'Ingresos',
  },
  'ingresos-semana': {
    type: 'bar',
    label: 'Ingresos por semana',
    getLabels: data => data.map(d => getWeekRange(d.anio, d.semana_iso)),
    getData: data => data.map(d => d.ingresos_semanales),
    dataLabel: 'Ingresos',
  },
  'huespedes-por-pais': {
    type: 'bar',
    label: 'Huéspedes por país',
    getLabels: data => data.map(d => d.pais),
    getData: data => data.map(d => d.cantidad),
    dataLabel: 'Cantidad',
  },
};

const Reportes = () => {

  const [selected, setSelected] = useState(reportesList[0].key);
  const [params, setParams] = useState({});
  const [data, setData] = useState([]);
  const [error, setError] = useState('');
  const reporte = reportesList.find(r => r.key === selected);
  const [chartRef, setChartRef] = useState(null);

  const handleChange = (e) => {
    setSelected(e.target.value);
    setParams({});
    setData([]);
    setError('');
  };

  const handleParam = (e) => {
    setParams({ ...params, [e.target.name]: e.target.value });
  };

  const consultar = async () => {
    setError('');
    setData([]);
    let url = `http://localhost:3002/api/reportes/${selected}`;
    let query = [];
    reporte.params.forEach(p => {
      if (params[p]) query.push(`${p}=${params[p]}`);
    });
    if (query.length) url += '?' + query.join('&');
    try {
      const res = await axios.get(url);
      setData(Array.isArray(res.data) ? res.data : [res.data]);
    } catch (err) {
      setError('Error al consultar el reporte.');
    }
  };

  // Exportar a Excel
  const exportToExcel = () => {
    if (!data || data.length === 0) return;
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Reporte');
    XLSX.writeFile(wb, `reporte-${selected}.xlsx`);
  };

  // Exportar a PDF
  const exportToPDF = () => {
    if (!data || data.length === 0) return;
    const doc = new jsPDF();
    let y = 10;
    // Si hay gráfica, la agregamos
    if (chartRef && chartRef.toBase64Image) {
      const imgData = chartRef.toBase64Image();
      doc.addImage(imgData, 'PNG', 10, y, 180, 70);
      y += 75;
    }
    const columns = reporte.columns.map(col => col.replace(/_/g, ' ').toUpperCase());
    const rows = data.map(row => reporte.columns.map(col => row[col]));
    autoTable(doc, {
      head: [columns],
      body: rows,
      styles: { fontSize: 8 },
      margin: { top: y }
    });
    doc.save(`reporte-${selected}.pdf`);
  };

  return (
    <div className="max-w-5xl mx-auto mt-8 p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Reportes y Estadísticas</h2>
      <div className="mb-4">
        <label className="font-semibold mr-2">Reporte:</label>
        <select value={selected} onChange={handleChange} className="border rounded px-2 py-1">
          {reportesList.map(r => (
            <option key={r.key} value={r.key}>{r.label}</option>
          ))}
        </select>
      </div>
      <div className="flex gap-4 mb-4 flex-wrap">
        {reporte.params.includes('startDate') && (
          <input type="date" name="startDate" value={params.startDate || ''} onChange={handleParam} className="border rounded px-2 py-1" />
        )}
        {reporte.params.includes('endDate') && (
          <input type="date" name="endDate" value={params.endDate || ''} onChange={handleParam} className="border rounded px-2 py-1" />
        )}
        {reporte.params.includes('mes') && (
          <input type="number" min="1" max="12" name="mes" value={params.mes || ''} onChange={handleParam} className="border rounded px-2 py-1" placeholder="Mes (1-12)" />
        )}
        <button onClick={consultar} className="bg-green-700 text-white px-4 py-1 rounded">Consultar</button>
        <button onClick={exportToExcel} className="bg-blue-600 text-white px-3 py-1 rounded">Exportar Excel</button>
        <button onClick={exportToPDF} className="bg-red-600 text-white px-3 py-1 rounded">Exportar PDF</button>
      </div>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      <div className="overflow-x-auto">
        {/* Gráfica si aplica */}
        {chartConfigs[selected] && data.length > 0 && (
          <div className="mb-8 flex justify-center">
            <div style={{ width: 400, height: 250 }}>
              {chartConfigs[selected].type === 'bar' && (
                <Bar
                  data={{
                    labels: chartConfigs[selected].getLabels(data),
                    datasets: [{
                      label: chartConfigs[selected].dataLabel,
                      data: chartConfigs[selected].getData(data),
                      backgroundColor: '#71a78c',
                    }],
                  }}
                  options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }}
                  ref={ref => setChartRef(ref && ref.chartInstance ? ref.chartInstance : ref)}
                />
              )}
              {chartConfigs[selected].type === 'pie' && (
                <Pie
                  data={{
                    labels: chartConfigs[selected].getLabels(data),
                    datasets: [{
                      label: chartConfigs[selected].dataLabel,
                      data: chartConfigs[selected].getData(data),
                      backgroundColor: [
                        '#71a78c', '#fbbf24', '#f87171', '#60a5fa', '#a78bfa', '#34d399', '#f472b6', '#facc15', '#818cf8', '#f87171'
                      ],
                    }],
                  }}
                  options={{ responsive: true, maintainAspectRatio: false }}
                  ref={ref => setChartRef(ref && ref.chartInstance ? ref.chartInstance : ref)}
                />
              )}
              {chartConfigs[selected].type === 'line' && (
                <Line
                  data={{
                    labels: chartConfigs[selected].getLabels(data),
                    datasets: [{
                      label: chartConfigs[selected].dataLabel,
                      data: chartConfigs[selected].getData(data),
                      borderColor: '#71a78c',
                      backgroundColor: '#71a78c33',
                    }],
                  }}
                  options={{ responsive: true, maintainAspectRatio: false }}
                  ref={ref => setChartRef(ref && ref.chartInstance ? ref.chartInstance : ref)}
                />
              )}
            </div>
            <div className="text-center text-sm text-gray-500 mt-2">{chartConfigs[selected].label}</div>
          </div>
        )}
        <table className="min-w-full divide-y divide-gray-300 mt-4">
          <thead>
            <tr>
              {reporte.columns.map(col => (
                <th key={col} className="px-4 py-2">{col.replace(/_/g, ' ').toUpperCase()}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i}>
                {reporte.columns.map(col => (
                  <td key={col} className="px-4 py-2">{
                    selected === 'ingresos-semana' && (col === 'semana_iso' || col === 'anio')
                      ? (col === 'semana_iso' ? getWeekRange(row.anio, row.semana_iso) : null)
                      : (col.includes('fecha') || col.includes('nacimiento')
                        ? formatDate(row[col])
                        : row[col])
                  }</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Reportes;
