import { type ReactNode } from 'react';
import { X } from 'lucide-react';

export function Drawer({
  open,
  onClose,
  title,
  description,
  children,
  width = 'max-w-2xl',
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  width?: string;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80]">
      <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-[2px] animate-fadein" onClick={onClose} />
      <div className={`absolute right-0 top-0 bottom-0 w-full ${width} bg-white shadow-pop flex flex-col animate-slidein`}>
        <div className="px-6 py-4 border-b border-slate-200 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-slate-900 truncate">{title}</h2>
            {description && <p className="text-sm text-slate-500 mt-0.5">{description}</p>}
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 -mr-1">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin">{children}</div>
      </div>
    </div>
  );
}
