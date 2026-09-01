import React, { useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';

export const PDFUpload: React.FC = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', e.target.files[0]);

    try {
      const response = await fetch('/api/parse-pdf', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      setResult(data);

      if (data.sargentReaction) {
        // This would typically trigger a global state update for the SargentHeader
        alert(`SARGENTO DICE: ${data.sargentReaction}`);
      }
    } catch (error) {
      console.error('Error uploading PDF:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <GlassCard className="border-dashed border-2 border-apple-secondary/30 flex flex-col items-center justify-center py-12 text-center">
      <div className="p-4 bg-apple-bg rounded-full mb-4 shadow-inner">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-apple-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v8" />
        </svg>
      </div>
      <h3 className="text-lg font-bold text-apple-text mb-2">Subir Reporte Xiaomi S400</h3>
      <p className="text-apple-secondary text-sm mb-6 px-8">
        Sube el PDF de tu balanza para que el Sargento analice tu estado actual.
      </p>
      <label className="cursor-pointer bg-apple-text text-white px-6 py-3 rounded-full font-bold hover:bg-gray-800 transition-all active:scale-95">
        {isUploading ? 'Analizando...' : 'SELECCIONAR PDF'}
        <input type="file" className="hidden" accept=".pdf" onChange={handleUpload} />
      </label>

      {result && (
        <div className="mt-6 p-4 bg-apple-bg rounded-apple text-left w-full max-w-xs border border-apple-secondary/20">
          <p className="text-xs font-bold text-apple-secondary uppercase mb-2">Datos Extraídos</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <span className="text-apple-secondary">Peso:</span> <span className="font-bold">{result.data.weight}kg</span>
            <span className="text-apple-secondary">Grasa Visceral:</span> <span className="font-bold text-apple-danger">{result.data.visceralFatRating}</span>
            <span className="text-apple-secondary">Masa Muscular:</span> <span className="font-bold">{result.data.muscleMass}kg</span>
          </div>
        </div>
      )}
    </GlassCard>
  );
};
