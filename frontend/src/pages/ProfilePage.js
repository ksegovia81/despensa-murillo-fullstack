import React from 'react';
import { useAuth } from '../context/AuthContext';

const ProfilePage = ({ setCurrentView }) => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    setCurrentView('home');
  };

  if (!user) return null;

  return (
    <div className="p-6 text-center max-w-sm mx-auto">
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-8 border-2 border-blue-100">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-5">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <h2 className="text-2xl font-bold mb-2 text-gray-800">{user.name}</h2>
        <p className="text-gray-500 text-base mb-4">{user.email}</p>
        {user.isAdmin && (
          <span className="inline-block bg-purple-100 text-purple-800 px-4 py-1 rounded-full text-sm font-medium mb-6">
            👑 Administrador
          </span>
        )}
        <button
          onClick={handleLogout}
          className="w-full bg-red-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-red-700 transition-colors mt-4"
        >
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
