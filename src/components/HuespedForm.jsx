import React, { useState, useEffect } from 'react';
import axios from 'axios';

const initialForm = {
  dni: '',
  nit: '',
  primer_nombre: '',
  segundo_nombre: '',
  primer_apellido: '',
  segundo_apellido: '',
  apellido_casada: '',
  fecha_nacimiento: '',
  telefono: '',
  email: '',
  ciudad: '',
  pais: '',
};

const HuespedForm = ({ onRegistro, initialDni }) => {
  const [formData, setFormData] = useState({ ...initialForm, dni: initialDni || '' });
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (initialDni) {
      setFormData(f => ({ ...f, dni: initialDni }));
    }
  }, [initialDni]);

  const isValid = () => {
    return (
      formData.dni.trim() !== '' &&
      formData.primer_nombre.trim() !== '' &&
      formData.primer_apellido.trim() !== '' &&
      formData.telefono.trim() !== '' &&
      formData.email.trim() !== '' &&
      formData.ciudad.trim() !== '' &&
      formData.pais.trim() !== ''
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isValid()) {
      alert('Completa todos los campos obligatorios.');
      return;
    }
    setShowModal(true);
  };

  const handleConfirm = async () => {
    try {
      await axios.post('http://localhost:3002/api/huespedes', formData);
      setFormData(initialForm);
      if (onRegistro) onRegistro();
      setShowModal(false);
    } catch (error) {
      console.error('Error al registrar huésped:', error);
      alert('Error al registrar huésped, intenta de nuevo.');
    }
  };

  const inputStyle = "border border-gray-300 rounded px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <>
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-8 bg-white shadow-xl rounded-lg space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">DNI *</label>
            <input className={inputStyle} value={formData.dni} onChange={e => setFormData({ ...formData, dni: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">NIT</label>
            <input className={inputStyle} value={formData.nit} onChange={e => setFormData({ ...formData, nit: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Primer Nombre *</label>
            <input className={inputStyle} value={formData.primer_nombre} onChange={e => setFormData({ ...formData, primer_nombre: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Segundo Nombre</label>
            <input className={inputStyle} value={formData.segundo_nombre} onChange={e => setFormData({ ...formData, segundo_nombre: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Primer Apellido *</label>
            <input className={inputStyle} value={formData.primer_apellido} onChange={e => setFormData({ ...formData, primer_apellido: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Segundo Apellido</label>
            <input className={inputStyle} value={formData.segundo_apellido} onChange={e => setFormData({ ...formData, segundo_apellido: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Apellido de Casada</label>
            <input className={inputStyle} value={formData.apellido_casada} onChange={e => setFormData({ ...formData, apellido_casada: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Fecha de Nacimiento</label>
            <input type="date" className={inputStyle} value={formData.fecha_nacimiento} onChange={e => setFormData({ ...formData, fecha_nacimiento: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Teléfono *</label>
            <input className={inputStyle} value={formData.telefono} onChange={e => setFormData({ ...formData, telefono: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Email *</label>
            <input className={inputStyle} value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Ciudad *</label>
            <input className={inputStyle} value={formData.ciudad} onChange={e => setFormData({ ...formData, ciudad: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">País *</label>
            <input className={inputStyle} value={formData.pais} onChange={e => setFormData({ ...formData, pais: e.target.value })} />
          </div>
        </div>
        <div className="text-center">
          <button type="submit" style={{ backgroundColor: '#71a78c' }} className="text-white px-4 py-2 rounded hover:opacity-90 transition">
            Registrar Huésped
          </button>
        </div>
      </form>
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-xl w-full space-y-4">
            <h2 className="text-lg font-bold text-center">Confirmar Registro</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-700">
              <p><strong>DNI:</strong> {formData.dni}</p>
              <p><strong>NIT:</strong> {formData.nit}</p>
              <p><strong>Primer Nombre:</strong> {formData.primer_nombre}</p>
              <p><strong>Segundo Nombre:</strong> {formData.segundo_nombre}</p>
              <p><strong>Primer Apellido:</strong> {formData.primer_apellido}</p>
              <p><strong>Segundo Apellido:</strong> {formData.segundo_apellido}</p>
              {formData.apellido_casada && <p><strong>Apellido Casada:</strong> {formData.apellido_casada}</p>}
              <p><strong>Fecha Nacimiento:</strong> {formData.fecha_nacimiento}</p>
              <p><strong>Teléfono:</strong> {formData.telefono}</p>
              <p><strong>Email:</strong> {formData.email}</p>
              <p><strong>Ciudad:</strong> {formData.ciudad}</p>
              <p><strong>País:</strong> {formData.pais}</p>
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
};

export default HuespedForm;
