import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Percent } from 'lucide-react';
import { apiRequest } from '../../services/api';
import { useToast } from '../../context/ToastContext';

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const EMPTY_DISCOUNT = { day: 'Lunes', discount: 10, category: 'almacen', text: '' };
const INPUT_CLASS = "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg";

const CATEGORY_LABELS = {
  almacen:  'Almacén',
  comida:   'Comida',
  all:      'Todos los productos',
  delivery: 'Delivery',
};

const DaySelect = ({ value, onChange }) => (
  <select value={value} onChange={onChange} className={INPUT_CLASS}>
    {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
  </select>
);

const CategorySelect = ({ value, onChange }) => (
  <select value={value} onChange={onChange} className={INPUT_CLASS}>
    {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
  </select>
);

const DiscountForm = ({ data, onChange, onSubmit, onCancel, submitLabel }) => (
  <div className="space-y-5">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Día</label>
        <DaySelect value={data.day} onChange={(e) => onChange({ ...data, day: e.target.value })} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Porcentaje (%)</label>
        <input type="number" min="1" max="100" value={data.discount} onChange={(e) => onChange({ ...data, discount: parseInt(e.target.value) })} className={INPUT_CLASS} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
        <CategorySelect value={data.category} onChange={(e) => onChange({ ...data, category: e.target.value })} />
      </div>
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">Texto descriptivo</label>
        <input type="text" placeholder="Ej: 10% OFF en productos de almacén" value={data.text} onChange={(e) => onChange({ ...data, text: e.target.value })} className={INPUT_CLASS} />
      </div>
    </div>
    <div className="flex justify-end space-x-3">
      {onCancel && (
        <button onClick={onCancel} className="px-5 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-lg">Cancelar</button>
      )}
      <button onClick={onSubmit} className="px-5 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 text-lg font-medium">{submitLabel}</button>
    </div>
  </div>
);

const AdminDiscountsView = ({ setAdminView, discounts, loadDiscounts }) => {
  const [newDiscount, setNewDiscount] = useState(EMPTY_DISCOUNT);
  const [editingDiscount, setEditingDiscount] = useState(null);
  const toast = useToast();

  useEffect(() => { loadDiscounts(); }, [loadDiscounts]);

  const handleAdd = async () => {
    if (!newDiscount.text) { toast.error('Ingresa el texto del descuento'); return; }
    try {
      await apiRequest('/admin/discounts', { method: 'POST', body: newDiscount });
      setNewDiscount(EMPTY_DISCOUNT);
      toast.success('Descuento agregado');
      loadDiscounts();
    } catch (error) {
      toast.error('Error: ' + error.message);
    }
  };

  const handleUpdate = async (id) => {
    try {
      await apiRequest(`/admin/discounts/${id}`, { method: 'PUT', body: editingDiscount });
      setEditingDiscount(null);
      toast.success('Descuento actualizado');
      loadDiscounts();
    } catch (error) {
      toast.error('Error: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este descuento?')) return;
    try {
      await apiRequest(`/admin/discounts/${id}`, { method: 'DELETE' });
      toast.success('Descuento eliminado');
      loadDiscounts();
    } catch (error) {
      toast.error('Error: ' + error.message);
    }
  };

  return (
    <div className="p-4 pb-20">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Gestionar Descuentos Diarios</h2>
        <button onClick={() => setAdminView('overview')} className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200">← Volver</button>
      </div>

      {/* Add discount form */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100">
        <h3 className="font-bold text-lg mb-4 flex items-center text-gray-800">
          <Plus className="h-5 w-5 mr-2 text-blue-500" /> Agregar Nuevo Descuento
        </h3>
        <DiscountForm
          data={newDiscount}
          onChange={setNewDiscount}
          onSubmit={handleAdd}
          onCancel={() => setNewDiscount(EMPTY_DISCOUNT)}
          submitLabel="Agregar Descuento"
        />
      </div>

      {/* Existing discounts */}
      <div className="space-y-5">
        <h3 className="font-bold text-xl text-gray-800">Descuentos Existentes ({discounts.length})</h3>
        {discounts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm p-6">
            <Percent className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-xl text-gray-600">No hay descuentos configurados</p>
          </div>
        ) : (
          discounts.map(discount => (
            <div key={discount._id} className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
              {editingDiscount?._id === discount._id ? (
                <DiscountForm
                  data={editingDiscount}
                  onChange={setEditingDiscount}
                  onSubmit={() => handleUpdate(discount._id)}
                  onCancel={() => setEditingDiscount(null)}
                  submitLabel="Guardar"
                />
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-lg text-gray-800">{discount.day}</h4>
                    <p className="text-gray-600 text-base mt-1">{discount.text}</p>
                    <p className="text-base mt-2">
                      <span className="font-semibold text-green-600">{discount.discount}% OFF</span>
                      <span className="mx-2 text-gray-400">|</span>
                      <span className="capitalize bg-gray-100 px-2 py-1 rounded text-sm">
                        {CATEGORY_LABELS[discount.category] || discount.category}
                      </span>
                    </p>
                  </div>
                  <div className="flex space-x-3">
                    <button onClick={() => setEditingDiscount({ ...discount })} className="p-3 bg-blue-100 rounded-lg hover:bg-blue-200" title="Editar">
                      <Edit className="h-5 w-5" />
                    </button>
                    <button onClick={() => handleDelete(discount._id)} className="p-3 bg-red-100 rounded-lg hover:bg-red-200" title="Eliminar">
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminDiscountsView;
