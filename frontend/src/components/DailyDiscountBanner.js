import React from 'react';
import { Percent } from 'lucide-react';

const DailyDiscountBanner = ({ discount }) => {
  if (!discount) return null;

  return (
    <div className="bg-gradient-to-r from-blue-400 to-green-500 text-white p-6 m-4 rounded-2xl shadow-lg animate-pulse border-2 border-white/30">
      <div className="flex items-center justify-center space-x-3">
        <Percent className="h-10 w-10" />
        <span className="font-bold text-2xl">¡OFERTA DEL DÍA!</span>
      </div>
      <p className="text-center mt-4 text-xl font-semibold">{discount.text}</p>
      <p className="text-center text-base mt-3 opacity-90">📍 Válido solo por hoy</p>
    </div>
  );
};

export default DailyDiscountBanner;
