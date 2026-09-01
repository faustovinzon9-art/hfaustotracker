'use client';

import React, { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';

export const SettingsModal = ({
  open,
  onClose,
  sargentLevel,
  onSargentLevel,
}: {
  open: boolean;
  onClose: () => void;
  sargentLevel: number;
  onSargentLevel: (n: number) => void;
}) => {
  const [reminders, setReminders] = useState(false);
  const [notif, setNotif] = useState('');

  useEffect(() => {
    setReminders(localStorage.getItem('hf_reminders') === '1');
  }, [open]);

  const toggleReminders = async () => {
    if (!('Notification' in window)) {
      setNotif('Tu navegador no soporta notificaciones.');
      return;
    }
    if (reminders) {
      localStorage.setItem('hf_reminders', '0');
      setReminders(false);
      setNotif('Recordatorios apagados.');
      return;
    }
    const perm = await Notification.requestPermission();
    if (perm === 'granted') {
      localStorage.setItem('hf_reminders', '1');
      setReminders(true);
      setNotif(
        '✅ Recordatorios activados. Te avisamos cuando la app está abierta o instalada (los avisos de fondo 100% requieren la app instalada).'
      );
    } else {
      setNotif('Permiso denegado. Activá las notificaciones en Ajustes del navegador.');
    }
  };

  const levels = [
    { n: 1, label: 'Amable', desc: 'Motiva sin insultos' },
    { n: 2, label: 'Normal', desc: 'El Sargento clásico' },
    { n: 3, label: 'Fuerte', desc: 'Muy directo' },
    { n: 4, label: 'Bestia', desc: 'A lo grande 💀' },
  ];

  return (
    <Modal open={open} onClose={onClose} title="⚙️ Ajustes">
      <div className="space-y-5">
        <div>
          <h3 className="text-sm font-bold text-apple-text mb-2">Nivel del Sargento</h3>
          <div className="grid grid-cols-2 gap-2">
            {levels.map((l) => (
              <button
                key={l.n}
                onClick={() => onSargentLevel(l.n)}
                className={`rounded-xl border px-3 py-2 text-left text-sm font-semibold ${
                  sargentLevel === l.n
                    ? 'border-apple-accent bg-apple-accent/10 text-apple-accent'
                    : 'border-apple-secondary/20 text-apple-secondary'
                }`}
              >
                <div>{l.label}</div>
                <div className="text-[10px] font-normal opacity-70">{l.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between rounded-apple p-3" style={{ background: 'var(--hf-input)' }}>
          <div>
            <div className="text-sm font-bold text-apple-text">🔔 Recordatorios</div>
            <div className="text-[11px] text-apple-secondary">Para pesarte y tus hábitos</div>
          </div>
          <button
            onClick={toggleReminders}
            className={`relative h-7 w-12 rounded-full transition ${reminders ? 'bg-apple-success' : 'bg-apple-secondary/40'}`}
          >
            <span
              className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all ${
                reminders ? 'left-[22px]' : 'left-0.5'
              }`}
            />
          </button>
        </div>

        {notif && <p className="text-xs text-apple-secondary">{notif}</p>}
        <p className="text-[11px] text-apple-secondary">
          💡 Elegí el nivel del Sargento y quedará guardado en este dispositivo.
        </p>
      </div>
    </Modal>
  );
};
