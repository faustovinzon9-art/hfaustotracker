import React from 'react';

export const SargentHeader: React.FC = () => {
  return (
    <header className="px-6 pt-12 pb-6">
      <div className="flex justify-between items-end mb-2">
        <div>
          <p className="text-apple-secondary text-sm font-medium uppercase tracking-wider">Command Center</p>
          <h1 className="text-4xl font-bold text-apple-text tracking-tight">HEALTH</h1>
        </div>
        <div className="text-right">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-apple-sargent text-white animate-pulse">
            SARGENT MODE ACTIVE
          </span>
        </div>
      </div>
      <div className="mt-4 p-4 rounded-apple bg-apple-sargent/10 border-l-4 border-apple-sargent">
        <p className="text-apple-sargent font-bold italic">
          "¡LEVÁNTATE Y MUÉVETE! El camino a la gloria no se construye con excusas, se construye con sudor. ¡NO TE ATREVAS A FALLAR HOY!"
        </p>
      </div>
    </header>
  );
};
