import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';

const initialForm = {
  id_huesped: '',
  fechaReservacion: '',
  fechaAnticipo: '',
  valorAnticipo: '',
  fecha_ingreso: '',
  fecha_salida: '',
  //fecha_factura: '',
  //numero_factura: '',
  totalPagado: '', // Cambiar a totalPagado para coincidir con backend
  tipo_contacto: 'booking',
  tipo_pago: 'efectivo',
  habitaciones: [],
};

const ReservaForm = ({ onRegistro }) => {
  const [formData, setFormData] = useState(initialForm);
  const [huespedes, setHuespedes] = useState([]);
  const [habitaciones, setHabitaciones] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [saldoPendiente, setSaldoPendiente] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:3002/api/huespedes').then(res => setHuespedes(res.data));
    axios.get('http://localhost:3002/api/habitaciones').then(res => setHabitaciones(res.data));
  }, []);

  useEffect(() => {
    if (location.state?.idHuesped) {
      setFormData(prev => ({ ...prev, id_huesped: location.state.idHuesped }));
    }
  }, [location.state]);

  useEffect(() => {
    // Calcular saldo pendiente en tiempo real
    const totalPagado = Number(formData.totalPagado);
    const valorAnticipo = Number(formData.valorAnticipo);
    if (!isNaN(totalPagado) && !isNaN(valorAnticipo)) {
      setSaldoPendiente(totalPagado - valorAnticipo);
    } else {
      setSaldoPendiente(0);
    }
  }, [formData.totalPagado, formData.valorAnticipo]);

  const isValid = () => {
    return (
      formData.id_huesped &&
      formData.fechaReservacion &&
      formData.fechaAnticipo &&
      formData.valorAnticipo &&
      formData.fecha_ingreso &&
      formData.fecha_salida &&
      formData.totalPagado &&
      formData.tipo_contacto &&
      formData.tipo_pago &&
      formData.habitaciones.length > 0
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validar que totalPagado y valorAnticipo sean números válidos
    const totalPagado = Number(formData.totalPagado);
    const valorAnticipo = Number(formData.valorAnticipo);
    if (isNaN(totalPagado) || isNaN(valorAnticipo) || totalPagado < 0 || valorAnticipo < 0) {
      alert('Por favor ingresa montos válidos para Total a Pagar y Valor Anticipo');
      return;
    }
    if (!isValid()) {
      alert('Completa todos los campos obligatorios y selecciona al menos una habitación.');
      return;
    }
    // Enviar datos al backend
    try {
      const { habitaciones, ...reservaData } = formData;
      await axios.post('http://localhost:3002/api/reservas', {
        ...reservaData,
        totalPagado,
        valorAnticipo,
        habitaciones,
        fecha_factura: reservaData.fecha_factura ? reservaData.fecha_factura : null,
        numero_factura: reservaData.numero_factura ? reservaData.numero_factura : null
      });
      setFormData(initialForm);
      if (onRegistro) onRegistro();
      setShowModal(false);
      navigate('/reservas'); // Redirige a la lista de reservas
    } catch (error) {
      console.error('Error al registrar reserva:', error);
      alert('Error al registrar reserva, intenta de nuevo.');
    }
  };

  const inputStyle = "border border-gray-300 rounded px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <>
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-8 space-y-6">
        <h2 className="text-2xl font-bold text-green-700 mb-4">Registrar Reserva</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block font-semibold mb-1">Huésped *</label>
              <select className={inputStyle} value={formData.id_huesped} onChange={e => setFormData({ ...formData, id_huesped: e.target.value })}>
                <option value="">Selecciona un huésped</option>
                {huespedes.map(h => (
                  <option key={h.id_huesped} value={h.id_huesped}>
                    {h.primer_nombre} {h.primer_apellido} ({h.dni})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-1">Fecha de Reservación *</label>
              <input type="date" className={inputStyle} value={formData.fechaReservacion} onChange={e => setFormData({ ...formData, fechaReservacion: e.target.value })} />
            </div>
            <div>
              <label className="block font-semibold mb-1">Fecha de Ingreso *</label>
              <input
                type="date"
                className={inputStyle}
                value={formData.fecha_ingreso}
                onChange={e =>
                  setFormData({ ...formData, fecha_ingreso: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Fecha de Salida *</label>
              <input
                type="date"
                className={inputStyle}
                value={formData.fecha_salida}
                onChange={e =>
                  setFormData({ ...formData, fecha_salida: e.target.value })
                }
              />
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block font-semibold mb-1">Fecha de Anticipo *</label>
              <input type="date" className={inputStyle} value={formData.fechaAnticipo} onChange={e => setFormData({ ...formData, fechaAnticipo: e.target.value })} />
            </div>
            <div>
              <label className="block font-semibold mb-1">Total a Pagar *</label>
              <input type="number" required min="0" value={formData.totalPagado} onChange={e => setFormData({ ...formData, totalPagado: e.target.value })} className="border rounded px-3 py-2 w-full" />
            </div>
            <div>
              <label className="block font-semibold mb-1">Valor Anticipo *</label>
              <input type="number" required min="0" value={formData.valorAnticipo} onChange={e => setFormData({ ...formData, valorAnticipo: e.target.value })} className="border rounded px-3 py-2 w-full" />
            </div>
            <div>
              <label className="block font-semibold mb-1">Fecha de Factura</label>
              <input type="date" className={inputStyle} value={formData.fecha_factura} onChange={e => setFormData({ ...formData, fecha_factura: e.target.value })} />
            </div>
            <div>
              <label className="block font-semibold mb-1">Número de Factura</label>
              <input className={inputStyle} value={formData.numero_factura} onChange={e => setFormData({ ...formData, numero_factura: e.target.value })} />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block font-semibold mb-1">Tipo de Contacto *</label>
            <select className={inputStyle} value={formData.tipo_contacto} onChange={e => setFormData({ ...formData, tipo_contacto: e.target.value })}>
              <option value="booking">Booking</option>
              <option value="airbnb">Airbnb</option>
              <option value="telefono">Teléfono</option>
              <option value="facebook">Facebook</option>
              <option value="instagram">Instagram</option>
              <option value="whatsapp">Whatsapp</option>
            </select>
          </div>
          <div>
            <label className="block font-semibold mb-1">Tipo de Pago *</label>
            <select className={inputStyle} value={formData.tipo_pago} onChange={e => setFormData({ ...formData, tipo_pago: e.target.value })}>
              <option value="efectivo">Efectivo</option>
              <option value="transferencia">Transferencia</option>
              <option value="visalink">VisaLink</option>
              <option value="pos">POS</option>
            </select>
          </div>
        </div>
        <div className="mt-6">
          <label className="block font-semibold mb-1">Habitaciones *</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {habitaciones.map(hab => (
              <label key={hab.id_habitacion} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.habitaciones.includes(hab.id_habitacion)}
                  onChange={() => {
                    setFormData(prev => ({
                      ...prev,
                      habitaciones: prev.habitaciones.includes(hab.id_habitacion)
                        ? prev.habitaciones.filter(id => id !== hab.id_habitacion)
                        : [...prev.habitaciones, hab.id_habitacion]
                    }));
                  }}
                  className="form-checkbox h-5 w-5 text-green-600"
                />
                <span>{hab.nombre}</span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className="block font-semibold mb-1 text-green-700">Saldo pendiente</label>
          <div className="font-bold text-red-700 text-lg">{saldoPendiente.toFixed(2)}</div>
        </div>
        <button type="submit" className="bg-green-700 text-white px-6 py-3 rounded font-semibold mt-8 w-full">Registrar Reserva</button>
      </form>
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-xl w-full space-y-4">
            <h2 className="text-lg font-bold text-center">Confirmar Reserva</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-700">
              <p><strong>Huésped:</strong> {huespedes.find(h => h.id_huesped === parseInt(formData.id_huesped))?.primer_nombre} {huespedes.find(h => h.id_huesped === parseInt(formData.id_huesped))?.primer_apellido}</p>
              <p><strong>Ingreso:</strong> {formData.fecha_ingreso}</p>
              <p><strong>Salida:</strong> {formData.fecha_salida}</p>
              <p><strong>Noches:</strong> {formData.fecha_ingreso && formData.fecha_salida ? (new Date(formData.fecha_salida) - new Date(formData.fecha_ingreso)) / (1000*60*60*24) : ''}</p>
              <p><strong>Habitaciones:</strong> {formData.habitaciones.map(id => habitaciones.find(h => h.id_habitacion === id)?.nombre).join(', ')}</p>
              <p><strong>Total a Pagar:</strong> {formData.totalPagado}</p>
              <p><strong>Tipo Contacto:</strong> {formData.tipo_contacto}</p>
              <p><strong>Tipo Pago:</strong> {formData.tipo_pago}</p>
            </div>
            <div className="flex justify-center gap-4 pt-4">
              <button onClick={handleConfirm} style={{ backgroundColor: '#71a78c' }} className="text-white px-4 py-2 rounded hover:opacity-90 transition">Confirmar</button>
              <button onClick={() => setShowModal(false)} className="px-4 py-2 border rounded hover:bg-gray-100">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ReservaForm;
