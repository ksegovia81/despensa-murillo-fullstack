import React from 'react';
import { Home, Package, Utensils, Clock, User, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navigation = ({ currentView, setCurrentView }) => {
  const { user } = useAuth();

  const navItems = [
    { key: 'home',     icon: Home,     label: 'Inicio'    },
    { key: 'products', icon: Package,  label: 'Productos' },
    { key: 'food',     icon: Utensils, label: 'Comidas'   },
    { key: 'orders',   icon: Clock,    label: 'Pedidos'   },
    { key: 'profile',  icon: User,     label: 'Perfil'    },
  ];

  if (user?.isAdmin) {
    navItems.splice(4, 0, { key: 'admin', icon: Settings, label: 'Admin' });
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm border-t-2 border-blue-100 shadow-xl fixed bottom-0 left-0 right-0 z-50">
      <div className="flex justify-around py-4">
        {navItems.map(({ key, icon: Icon, label }) => (
          <button
            key={key}
            onClick={() => setCurrentView(key)}
            className={`flex flex-col items-center p-3 rounded-xl transition-all duration-200 ${
              currentView === key
                ? 'text-blue-600 bg-blue-50/80 -translate-y-2 shadow-md'
                : 'text-gray-600 hover:text-blue-500'
            }`}
          >
            <Icon className="h-7 w-7" />
            <span className="text-xs mt-1 font-medium">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Navigation;
