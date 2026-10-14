import React from 'react';
import { X, Share, PlusSquare, Smartphone, CheckCircle, WifiOff, Shield } from 'lucide-react';

interface PWAInstallGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallGuideModal: React.FC<PWAInstallGuideModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-teal-700 text-white">
          <div className="flex items-center space-x-2">
            <Smartphone className="w-5 h-5 text-teal-200" />
            <h2 className="text-base font-bold">Instalar en tu iPhone</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-teal-200 hover:text-white hover:bg-teal-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs flex-1">
          {/* Key Advantages */}
          <div className="grid grid-cols-2 gap-2 text-slate-700">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center space-x-2">
              <WifiOff className="w-4 h-4 text-teal-600 shrink-0" />
              <span>Funciona 100% sin internet</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center space-x-2">
              <Shield className="w-4 h-4 text-teal-600 shrink-0" />
              <span>Datos 100% privados y locales</span>
            </div>
          </div>

          <p className="text-slate-600 text-sm font-medium">
            Sigue estos 3 simples pasos desde el navegador <strong>Safari</strong> de tu iPhone:
          </p>

          {/* Steps */}
          <div className="space-y-3">
            {/* Step 1 */}
            <div className="flex items-start space-x-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="w-6 h-6 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                1
              </div>
              <div>
                <p className="font-bold text-slate-800 text-xs">Abre la app en Safari</p>
                <p className="text-slate-500 mt-0.5">
                  Ingresa a la dirección web de la app desde el navegador Safari de tu iPhone.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start space-x-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="w-6 h-6 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                2
              </div>
              <div>
                <p className="font-bold text-slate-800 text-xs flex items-center space-x-1">
                  <span>Toca el botón "Compartir"</span>
                  <Share className="w-3.5 h-3.5 text-blue-600 inline ml-1" />
                </p>
                <p className="text-slate-500 mt-0.5">
                  Es el ícono del recuadro con una flecha hacia arriba, ubicado en la barra inferior de Safari.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start space-x-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="w-6 h-6 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                3
              </div>
              <div>
                <p className="font-bold text-slate-800 text-xs flex items-center space-x-1">
                  <span>Selecciona "Agregar a inicio"</span>
                  <PlusSquare className="w-3.5 h-3.5 text-slate-700 inline ml-1" />
                </p>
                <p className="text-slate-500 mt-0.5">
                  Desliza hacia abajo en las opciones y presiona <strong>"Agregar al inicio"</strong>. Luego pulsa <strong>"Agregar"</strong> en la esquina superior derecha.
                </p>
              </div>
            </div>
          </div>

          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center space-x-2 text-emerald-800">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>
              ¡Listo! Ahora verás el ícono de <strong>PsicoAgenda</strong> en la pantalla principal de tu teléfono como cualquier aplicación nativa, a pantalla completa y sin barras de navegador.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 flex justify-end bg-slate-50">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
