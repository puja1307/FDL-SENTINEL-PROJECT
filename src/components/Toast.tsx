import { useApp } from '@/store/AppContext';
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react';

export function ToastViewport() {
  const { toasts, dismissToast } = useApp();
  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
    error: <XCircle className="w-5 h-5 text-red-600" />,
    info: <Info className="w-5 h-5 text-blue-600" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-600" />,
  };
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-80 max-w-[calc(100vw-2rem)]">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="card card-pad py-3 px-4 flex items-start gap-3 animate-slidein shadow-pop"
          role="alert"
        >
          {icons[t.variant]}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800">{t.title}</p>
            {t.description && <p className="text-xs text-slate-500 mt-0.5">{t.description}</p>}
          </div>
          <button onClick={() => dismissToast(t.id)} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
