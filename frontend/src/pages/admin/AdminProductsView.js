import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, Package } from 'lucide-react';
import { apiRequest } from '../../services/api';
import { useToast } from '../../context/ToastContext';

const EMPTY_PRODUCT = { name: '', category: 'almacen', price: '', description: '', image: '', stock: '' };
const INPUT_CLASS = "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg";

const ProductForm = ({ data, onChange, onSubmit, onCancel, submitLabel }) => (
  <div className="space-y-5">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
        <input type="text" placeholder="Ej: Arroz" value={data.name} onChange={(e) => onChange({ ...data, name: e.target.value })} className={INPUT_CLASS} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
        <select value={data.category} onChange={(e) => onChange({ ...data, category: e.target.value })} className={INPUT_CLASS}>
          <option value="almacen">Almacén</option>
          <option value="comida">Comida</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Precio (₲)</label>
        <input type="number" placeholder="Ej: 10000" value={data.price} onChange={(e) => onChange({ ...data, price: e.target.value })} className={INPUT_CLASS} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
        <input type="number" placeholder="Ej: 50" value={data.stock} onChange={(e) => onChange({ ...data, stock: e.target.value })} className={INPUT_CLASS} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Emoji</label>
        <input type="text" placeholder="Ej: 🍗" value={data.image} onChange={(e) => onChange({ ...data, image: e.target.value })} className={INPUT_CLASS} />
      </div>
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
        <textarea placeholder="Describe el producto..." value={data.description} onChange={(e) => onChange({ ...data, description: e.target.value })} className={INPUT_CLASS} rows="3" />
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

const AdminProductsView = ({ setAdminView, products, loadAdminProducts }) => {
  const [newProduct, setNewProduct] = useState(EMPTY_PRODUCT);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const load = async () => { setLoading(true); await loadAdminProducts(); setLoading(false); };
    load();
  }, [loadAdminProducts]);

  const handleAdd = async () => {
    if (!newProduct.name || !newProduct.price || !newProduct.description || !newProduct.stock) {
      toast.error('Completa: nombre, precio, descripción y stock');
      return;
    }
    try {
      await apiRequest('/admin/products', {
        method: 'POST',
        body: { ...newProduct, price: parseInt(newProduct.price), stock: parseInt(newProduct.stock) || 0, image: newProduct.image || '📦' }
      });
      setNewProduct(EMPTY_PRODUCT);
      toast.success('Producto agregado');
      loadAdminProducts();
    } catch (error) {
      toast.error('Error: ' + error.message);
    }
  };

  const handleUpdate = async (id) => {
    if (!editingProduct.name || !editingProduct.price) { toast.error('Completa nombre y precio'); return; }
    try {
      await apiRequest(`/admin/products/${id}`, {
        method: 'PUT',
        body: { ...editingProduct, price: parseInt(editingProduct.price), stock: parseInt(editingProduct.stock) || 0 }
      });
      setEditingProduct(null);
      toast.success('Producto actualizado');
      loadAdminProducts();
    } catch (error) {
      toast.error('Error: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este producto?')) return;
    try {
      await apiRequest(`/admin/products/${id}`, { method: 'DELETE' });
      toast.success('Producto eliminado');
      loadAdminProducts();
    } catch (error) {
      toast.error('Error: ' + error.message);
    }
  };

  const handleToggle = async (product) => {
    try {
      await apiRequest(`/admin/products/${product._id}`, { method: 'PUT', body: { ...product, isActive: !product.isActive } });
      loadAdminProducts();
    } catch (error) {
      toast.error('Error: ' + error.message);
    }
  };

  if (loading) return (
    <div className="p-4 pb-20 flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  );

  return (
    <div className="p-4 pb-20">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Gestionar Productos</h2>
        <button onClick={() => setAdminView('overview')} className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200">← Volver</button>
      </div>

      {/* Add product form */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100">
        <h3 className="font-bold text-lg mb-4 flex items-center text-gray-800">
          <Plus className="h-5 w-5 mr-2 text-blue-500" /> Agregar Nuevo Producto
        </h3>
        <ProductForm
          data={newProduct}
          onChange={setNewProduct}
          onSubmit={handleAdd}
          onCancel={() => setNewProduct(EMPTY_PRODUCT)}
          submitLabel="Agregar Producto"
        />
      </div>

      {/* Existing products */}
      <div className="space-y-5">
        <h3 className="font-bold text-xl text-gray-800">Productos Existentes ({products.length})</h3>
        {products.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm p-6">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-xl text-gray-600">No hay productos aún</p>
          </div>
        ) : (
          products.map(product => (
            <div key={product._id} className={`bg-white rounded-xl shadow-sm p-5 border border-gray-100 ${!product.isActive ? 'opacity-60' : ''}`}>
              {editingProduct?._id === product._id ? (
                <ProductForm
                  data={editingProduct}
                  onChange={setEditingProduct}
                  onSubmit={() => handleUpdate(product._id)}
                  onCancel={() => setEditingProduct(null)}
                  submitLabel="Guardar"
                />
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-5">
                    <span className="text-5xl">{product.image}</span>
                    <div>
                      <h4 className="font-bold text-lg text-gray-800">{product.name}</h4>
                      <p className="text-gray-600 text-base mt-1">{product.description}</p>
                      <p className="text-base mt-2">
                        <span className="font-semibold text-green-600">₲{product.price.toLocaleString()}</span>
                        <span className="mx-2 text-gray-400">|</span>
                        <span className={product.stock <= 5 ? 'text-orange-500 font-medium' : 'text-green-500'}>
                          Stock: {product.stock}
                        </span>
                        <span className="mx-2 text-gray-400">|</span>
                        <span className="capitalize bg-gray-100 px-2 py-1 rounded text-sm">{product.category}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <button onClick={() => handleToggle(product)} className={`p-3 rounded-lg ${product.isActive ? 'bg-gray-100 hover:bg-gray-200' : 'bg-green-100 hover:bg-green-200'}`} title={product.isActive ? 'Desactivar' : 'Activar'}>
                      <Eye className="h-5 w-5" />
                    </button>
                    <button onClick={() => setEditingProduct({ ...product, price: String(product.price), stock: String(product.stock) })} className="p-3 bg-blue-100 rounded-lg hover:bg-blue-200" title="Editar">
                      <Edit className="h-5 w-5" />
                    </button>
                    <button onClick={() => handleDelete(product._id)} className="p-3 bg-red-100 rounded-lg hover:bg-red-200" title="Eliminar">
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

export default AdminProductsView;
