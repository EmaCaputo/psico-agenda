import React, { useState } from 'react';
import { Lock, Delete } from 'lucide-react';

interface PinLockScreenProps {
  correctPin: string;
  onUnlocked: () => void;
  therapistName?: string;
}

export const PinLockScreen: React.FC<PinLockScreenProps> = ({
  correctPin,
  onUnlocked,
  therapistName
}) => {
  const [pin, setPin] = useState('');
  const [errorAnimation, setErrorAnimation] = useState(false);

  const handleDigit = (digit: string) => {
    if (pin.length < 4) {
      const newPin = pin + digit;
      setPin(newPin);

      if (newPin.length === 4) {
        if (newPin === correctPin) {
          setTimeout(() => {
            onUnlocked();
          }, 150);
        } else {
          setErrorAnimation(true);
          setTimeout(() => {
            setPin('');
            setErrorAnimation(false);
          }, 600);
        }
      }
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900 flex flex-col items-center justify-between py-12 px-6 select-none safe-top safe-bottom text-white">
      {/* Top info */}
      <div className="flex flex-col items-center space-y-3 mt-8">
        <div className="w-14 h-14 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
          <Lock className="w-7 h-7" />
        </div>
        <div className="text-center">
          <h1 className="text-xl font-bold tracking-tight">PsicoAgenda</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {therapistName || 'Ingresa tu código PIN para acceder'}
          </p>
        </div>

        {/* PIN Dots */}
        <div className={`flex items-center space-x-4 pt-6 ${errorAnimation ? 'animate-bounce text-rose-500' : ''}`}>
          {[0, 1, 2, 3].map((index) => {
            const isFilled = pin.length > index;
            return (
              <div
                key={index}
                className={`w-3.5 h-3.5 rounded-full border-2 transition-all duration-150 ${
                  isFilled
                    ? errorAnimation
                      ? 'bg-rose-500 border-rose-500'
                      : 'bg-teal-400 border-teal-400 scale-110'
                    : 'border-slate-600 bg-transparent'
                }`}
              />
            );
          })}
        </div>

        {errorAnimation && (
          <p className="text-xs text-rose-400 font-semibold mt-2 animate-fade-in">
            PIN incorrecto, intenta de nuevo
          </p>
        )}
      </div>

      {/* Numeric Keypad */}
      <div className="w-full max-w-xs grid grid-cols-3 gap-4 mb-4">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
          <button
            key={digit}
            onClick={() => handleDigit(digit)}
            className="w-16 h-16 sm:w-18 sm:h-18 mx-auto rounded-full bg-slate-800/80 hover:bg-slate-700/80 active:bg-teal-600 text-2xl font-semibold flex items-center justify-center border border-slate-700/60 transition-all active:scale-95 shadow-sm"
          >
            {digit}
          </button>
        ))}

        <div />

        <button
          onClick={() => handleDigit('0')}
          className="w-16 h-16 sm:w-18 sm:h-18 mx-auto rounded-full bg-slate-800/80 hover:bg-slate-700/80 active:bg-teal-600 text-2xl font-semibold flex items-center justify-center border border-slate-700/60 transition-all active:scale-95 shadow-sm"
        >
          0
        </button>

        <button
          onClick={handleDelete}
          className="w-16 h-16 sm:w-18 sm:h-18 mx-auto rounded-full hover:bg-slate-800/60 text-slate-400 hover:text-white flex items-center justify-center transition-all active:scale-95"
          title="Borrar"
        >
          <Delete className="w-6 h-6" />
        </button>
      </div>

      <div className="text-[11px] text-slate-500">
        Secreto Profesional y Privacidad Médica
      </div>
    </div>
  );
};
