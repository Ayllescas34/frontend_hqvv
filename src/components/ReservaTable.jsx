import React, { useEffect, useState } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logoHotel from '../img/logo_hotel.jpg';
import volcanesFondo from '../img/volcanes.jpg';

const ReservaTable = () => {
  const [reservas, setReservas] = useState([]);
  const [huespedes, setHuespedes] = useState([]);
  const [habitaciones, setHabitaciones] = useState([]);
  const [reservaHabitaciones, setReservaHabitaciones] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:3002/api/reservas').then(res => setReservas(res.data));
    axios.get('http://localhost:3002/api/huespedes').then(res => setHuespedes(res.data));
    axios.get('http://localhost:3002/api/habitaciones').then(res => setHabitaciones(res.data));
    axios.get('http://localhost:3002/api/reservas-habitaciones').then(res => setReservaHabitaciones(res.data));
  }, []);

  const getHuespedNombre = (id) => {
    const h = huespedes.find(h => h.id_huesped === id);
    return h ? `${h.primer_nombre} ${h.primer_apellido}` : '';
  };

  const getHabitacionesReserva = (id_reserva) => {
    // Asegura que id_reserva y id_habitacion sean numéricos para comparación
    const rels = reservaHabitaciones.filter(rh => Number(rh.id_reserva) === Number(id_reserva));
    const nombres = rels.map(rh => {
      const hab = habitaciones.find(h => Number(h.id_habitacion) === Number(rh.id_habitacion));
      return hab ? hab.nombre : '';
    }).filter(Boolean);
    return nombres.length ? nombres.join(', ') : 'Sin habitaciones asignadas';
  };

  // Modal de previsualización PDF
  const [showModal, setShowModal] = useState(false);
  const [pdfPreview, setPdfPreview] = useState(null);
  const [pdfReserva, setPdfReserva] = useState(null);

  // Modal para pago complemento
  const [showPagoModal, setShowPagoModal] = useState(false);
  const [pagoComplemento, setPagoComplemento] = useState('');
  const [fechaPagoComplemento, setFechaPagoComplemento] = useState('');
  const [reservaSeleccionada, setReservaSeleccionada] = useState(null);

  // Utilidad para formatear fecha/hora
  function formatDateTime(str) {
  if (!str) return '';
  const d = new Date(str);
  if (isNaN(d)) return str;
  const pad = n => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()}`;
  }

  // Función para generar PDF y mostrar previsualización
  const previewReservaPDF = async (reserva) => {
    const doc = new jsPDF();
    let y = 20;
    // Fondo color #fbf4e3
    doc.setFillColor(251, 244, 227);
    doc.rect(0, 0, 210, 297, 'F');
    // Fondo volcanes colonial/antigua, más visible
    let volcanesImg;
    try {
      volcanesImg = await toBase64(volcanesFondo);
      doc.addImage(volcanesImg, 'JPEG', 0, 30, 210, 180, undefined, 'NONE', 0.002);
    } catch {}
    // Logo y barra superior profesional
    let img;
    try {
      img = await toBase64(logoHotel);
      doc.setFillColor(113, 167, 140); // color navbar
      doc.rect(10, 10, 190, 25, 'F');
      doc.addImage(img, 'JPEG', 15, 13, 20, 20);
      doc.setTextColor(57,107,87); // #396b57
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.text('QUINTA VISTA VERDE - RESERVA', 40, 28);
      doc.setTextColor(57,107,87); // #396b57
      doc.setFont('times', 'normal');
      y = 45;
    } catch {
      doc.setFontSize(22);
      doc.setTextColor(57,107,87); // #396b57
      doc.setFont('helvetica', 'bold');
      doc.text('HOTEL ANTIGUA - COMPROBANTE DE RESERVA'.toUpperCase(), 10, y);
      doc.setFont('times', 'normal');
      y += 12;
    }
    // Márgenes elegantes
    doc.setDrawColor(113, 167, 140);
    doc.setLineWidth(1.2);
    doc.rect(10, 10, 190, 265, 'S');
    // Fecha de generación
    doc.setFontSize(12);
    doc.text(('GENERADO: ' + formatDateTime(new Date())).toUpperCase(), 15, y);
    y += 14;
    // Datos distribuidos profesionalmente
    const huesped = huespedes.find(h => Number(h.id_huesped) === Number(reserva.id_huesped));
    const habitacionesTxt = getHabitacionesReserva(reserva.id_reserva);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(57,107,87); // #396b57
    doc.text('DATOS DEL HUÉSPED', 15, y);
    doc.setFont('times', 'normal');
    doc.setTextColor(57,107,87); // #396b57
    y += 10;
    doc.setFontSize(14);
    doc.text(`NOMBRE: ${huesped ? `${huesped.primer_nombre} ${huesped.primer_apellido}` : ''}`.toUpperCase(), 15, y); y += 8;
    doc.text(`DNI: ${huesped ? huesped.dni || '' : ''}`.toUpperCase(), 15, y); y += 8;
    doc.text(`FECHA NACIMIENTO: ${huesped ? formatDateTime(huesped.fecha_nacimiento) : ''}`.toUpperCase(), 15, y); y += 8;
    doc.text(`CIUDAD: ${huesped ? huesped.ciudad || '' : ''}`.toUpperCase(), 15, y); y += 8;
    doc.text(`PAÍS: ${huesped ? huesped.pais || '' : ''}`.toUpperCase(), 15, y); y += 12;
    doc.setDrawColor(180,180,180); doc.line(15, y, 195, y); y += 8;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(57,107,87); // #396b57
    doc.text('DATOS DE LA RESERVA', 15, y);
    doc.setFont('times', 'normal');
    doc.setTextColor(57,107,87); // #396b57
    y += 10;
    doc.setFontSize(14);
    doc.text(`INGRESO: ${formatDateTime(reserva.fecha_ingreso)}`.toUpperCase(), 15, y); y += 8;
    doc.text(`SALIDA: ${formatDateTime(reserva.fecha_salida)}`.toUpperCase(), 15, y); y += 8;
    doc.text(`NOCHES: ${reserva.total_noches}`.toUpperCase(), 15, y); y += 8;
    doc.text(`TOTAL PAGADO: ${reserva.totalPagado}`.toUpperCase(), 15, y); y += 8;
    doc.text(`TIPO CONTACTO: ${reserva.tipo_contacto}`.toUpperCase(), 15, y); y += 8;
    doc.text(`TIPO PAGO: ${reserva.tipo_pago}`.toUpperCase(), 15, y); y += 8;
    doc.text(`FACTURA: ${reserva.fecha_factura ? formatDateTime(reserva.fecha_factura) : ''}`.toUpperCase(), 15, y); y += 8;
    doc.text(`N° FACTURA: ${reserva.numero_factura || ''}`.toUpperCase(), 15, y); y += 8;
    doc.text(`HABITACIONES: ${habitacionesTxt}`.toUpperCase(), 15, y); y += 12;
    doc.setDrawColor(180,180,180); doc.line(15, y, 195, y); y += 15;
    // Apartado para firma
    doc.setFontSize(15);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(57,107,87); // #396b57
    doc.text('FIRMA DEL HUÉSPED:'.toUpperCase(), 25, y);
    doc.line(65, y + 1, 170, y + 1);
    // Previsualización como imagen
    const pdfImg = doc.output('dataurlstring');
    setPdfPreview(pdfImg);
    setPdfReserva(doc);
    setShowModal(true);
  };

  // Utilidad para convertir imagen a base64
  function toBase64(url) {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.crossOrigin = 'Anonymous';
      img.onload = function () {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/jpeg'));
      };
      img.onerror = reject;
      img.src = url;
    });
  }

  // Descargar PDF desde modal
  const downloadPDF = () => {
    if (pdfReserva) pdfReserva.save('reserva.pdf');
    setShowModal(false);
  };

  // Lógica de estado y funciones para el modal
  function openPagoModal(reserva) {
    setReservaSeleccionada(reserva);
    setPagoComplemento('');
    setFechaPagoComplemento('');
    setShowPagoModal(true);
  }

  async function handleGuardarPagoComplemento() {
    if (!pagoComplemento || !fechaPagoComplemento) return;
    const montoPago = Number(pagoComplemento);
    const saldoPendiente = Number(reservaSeleccionada?.saldo_pendiente);
    if (montoPago > saldoPendiente) {
      alert('El monto del pago complemento no puede ser mayor al saldo pendiente.');
      return;
    }
    try {
      // Solo enviar pago_complemento y fecha_pago_complemento, backend calcula y retorna saldo_pendiente
      const response = await axios.put(`http://localhost:3002/api/reservas/${reservaSeleccionada.id_reserva}/pago-complemento`, {
        pago_complemento: pagoComplemento,
        fecha_pago_complemento: fechaPagoComplemento
      });
      // Actualizar la reserva en la UI con saldo_pendiente del backend
      const nuevoSaldoPendiente = response.data.saldo_pendiente;
      setReservas(reservas => reservas.map(r => r.id_reserva === reservaSeleccionada.id_reserva
        ? { ...r, pago_complemento: pagoComplemento, fecha_pago_complemento: fechaPagoComplemento, saldo_pendiente: nuevoSaldoPendiente }
        : r));
      setShowPagoModal(false);
    } catch (err) {
      alert('Error al guardar el pago complemento');
    }
  }

  return (
    <div className="overflow-x-auto max-w-[98vw] mx-auto rounded-lg border border-gray-300 shadow-lg mt-8">
      <table className="min-w-full divide-y divide-gray-300">
        <thead style={{ backgroundColor: '#71a78c' }} className="text-white select-none">
          <tr>
            <th className="px-5 py-4 text-left text-sm font-semibold uppercase tracking-wide">ID Reserva</th>
            <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wide">Huésped</th>
            <th className="px-5 py-4 text-left text-sm font-semibold uppercase tracking-wide">Ingreso</th>
            <th className="px-5 py-4 text-left text-sm font-semibold uppercase tracking-wide">Salida</th>
            <th className="px-4 py-4 text-center text-sm font-semibold uppercase tracking-wide">Noches</th>
            <th className="px-5 py-4 text-left text-sm font-semibold uppercase tracking-wide">Total a Pagar</th>
            <th className="px-5 py-4 text-left text-sm font-semibold uppercase tracking-wide">Saldo Pendiente</th>
            <th className="px-5 py-4 text-left text-sm font-semibold uppercase tracking-wide">Tipo Contacto</th>
            <th className="px-5 py-4 text-left text-sm font-semibold uppercase tracking-wide">Tipo Pago</th>
            <th className="px-5 py-4 text-left text-sm font-semibold uppercase tracking-wide">Feche de Factura</th>
            <th className="px-5 py-4 text-left text-sm font-semibold uppercase tracking-wide">N° Factura</th>
            <th className="px-5 py-4 text-left text-sm font-semibold uppercase tracking-wide">PDF</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {reservas.map((r) => (
            <tr key={r.id_reserva} className="hover:bg-blue-100">
              <td className="px-5 py-3 whitespace-nowrap font-bold text-green-700">{`HQV-${r.id_reserva}-${new Date(r.fechaReservacion || r.fecha_ingreso || Date.now()).getFullYear()}`}</td>
              <td className="px-6 py-3 whitespace-nowrap font-medium text-gray-900">{getHuespedNombre(r.id_huesped)}</td>
              <td className="px-5 py-3 whitespace-nowrap text-gray-700">{formatDateTime(r.fecha_ingreso)}</td>
              <td className="px-5 py-3 whitespace-nowrap text-gray-700">{formatDateTime(r.fecha_salida)}</td>
              <td className="px-4 py-3 whitespace-nowrap text-center font-semibold text-indigo-700">{r.total_noches}</td>
              <td className="px-5 py-3 whitespace-nowrap text-gray-700">{r.totalPagado}</td>
              <td className="px-5 py-3 whitespace-nowrap text-red-700 font-bold">{Number(r.saldo_pendiente).toFixed(2)}</td>
              <td className="px-5 py-3 whitespace-nowrap text-gray-700">{r.tipo_contacto}</td>
              <td className="px-5 py-3 whitespace-nowrap text-gray-700">{r.tipo_pago}</td>
              <td className="px-5 py-3 whitespace-nowrap text-gray-700">{formatDateTime(r.fecha_factura)}</td>
              <td className="px-5 py-3 whitespace-nowrap text-gray-700">{r.numero_factura}</td>
              <td className="px-5 py-3 whitespace-nowrap text-gray-700">
                <button onClick={() => previewReservaPDF(r)} className="bg-red-600 text-white px-2 py-1 rounded text-xs">PDF</button>
                {Number(r.saldo_pendiente) > 0 && (
                  <button onClick={() => openPagoModal(r)} className="ml-2 bg-green-700 text-white px-2 py-1 rounded text-xs">Agregar pago complemento</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {reservas.length === 0 && (
        <div className="text-center text-gray-500 py-8">No hay reservas registradas o el endpoint no devuelve datos.</div>
      )}
      {/* Modal de previsualización PDF */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full relative">
            <h3 className="text-lg font-bold mb-2 text-green-700">Previsualización Comprobante Reserva</h3>
            {pdfPreview && (
              <iframe src={pdfPreview} title="PDF Preview" className="w-full h-96 border mb-4" />
            )}
            <div className="flex justify-end gap-2">
              <button onClick={downloadPDF} className="bg-green-700 text-white px-4 py-2 rounded">Descargar PDF</button>
              <button onClick={() => setShowModal(false)} className="bg-gray-400 text-white px-4 py-2 rounded">Cerrar</button>
            </div>
          </div>
        </div>
      )}
      {/* Modal para pago complemento */}
      {showPagoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full relative">
            <h3 className="text-lg font-bold mb-2 text-green-700">Registrar Pago Complemento</h3>
            <div className="mb-4">
              <label className="block text-gray-700 mb-1">Saldo pendiente actual</label>
              <div className="font-bold text-red-700 mb-2 text-lg">{reservaSeleccionada ? Number(reservaSeleccionada.saldo_pendiente).toFixed(2) : '--'}</div>
              <label className="block text-gray-700 mb-1">Monto del pago</label>
              <input type="number" min="0" value={pagoComplemento} onChange={e => setPagoComplemento(e.target.value)} className="border border-gray-300 rounded px-3 py-2 w-full" />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-1">Fecha del pago</label>
              <input type="date" value={fechaPagoComplemento} onChange={e => setFechaPagoComplemento(e.target.value)} className="border border-gray-300 rounded px-3 py-2 w-full" />
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={handleGuardarPagoComplemento} className="bg-green-700 text-white px-4 py-2 rounded">Guardar</button>
              <button onClick={() => setShowPagoModal(false)} className="bg-gray-400 text-white px-4 py-2 rounded">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservaTable;
