import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ email: '', password: '', name: '' });
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password || (!isLogin && !formData.name)) {
      toast.error('Por favor completa todos los campos');
      return;
    }
    setLoading(true);
    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await register(formData.email, formData.password, formData.name);
      }
    } catch (error) {
      toast.error(error.message || 'Error de autenticación');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg";

  return (
    <div className="max-w-md mx-auto mt-8 p-8 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border-2 border-blue-100">
      <h2 className="text-3xl font-bold text-center mb-8 text-blue-800">
        {isLogin ? 'Iniciar Sesión' : 'Registrarse'}
      </h2>

      <form onSubmit={handleSubmit}>
        {!isLogin && (
          <div className="mb-5">
            <label className="block text-gray-700 text-base font-medium mb-2">Nombre</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={inputClass}
              placeholder="Tu nombre"
            />
          </div>
        )}

        <div className="mb-5">
          <label className="block text-gray-700 text-base font-medium mb-2">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className={inputClass}
            placeholder="tu@email.com"
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 text-base font-medium mb-2">Contraseña</label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className={inputClass}
            placeholder="••••••••"
          />
          {!isLogin && (
            <p className="text-xs text-gray-500 mt-1">Mínimo 6 caracteres</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 rounded-lg text-lg font-bold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md disabled:opacity-50"
        >
          {loading ? 'Cargando...' : isLogin ? 'Iniciar Sesión' : 'Registrarse'}
        </button>

        <p className="text-center mt-5 text-base text-gray-600">
          {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-green-600 hover:underline ml-2 font-medium"
          >
            {isLogin ? 'Regístrate' : 'Inicia sesión'}
          </button>
        </p>
      </form>
    </div>
  );
};

export default AuthPage;
