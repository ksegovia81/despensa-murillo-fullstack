import React from 'react';

const TailwindTest = () => {
  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      zIndex: 9999
    }}>
      <div className="p-3 bg-green-500 text-white rounded shadow-lg">
        ✅ Tailwind Working
      </div>
      <div className="p-3 bg-blue-500 text-white rounded shadow-lg mt-2">
        🔵 Blue Test
      </div>
      <div className="p-3 bg-red-500 text-white rounded shadow-lg mt-2">
        🔴 Red Test
      </div>
    </div>
  );
};

export default TailwindTest;