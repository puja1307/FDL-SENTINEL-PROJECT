import { type ReactNode } from 'react';

export function SectionCard({
  title,
  description,
  action,
  children,
  className = '',
  bodyClassName = 'p-5',
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <div className={`card ${className}`}>
      {(title || action) && (
        <div className="px-5 py-4 border-b border-slate-100 flex items-start justify-between gap-4">
          <div className="min-w-0">
            {title && <h3 className="text-sm font-semibold text-slate-900">{title}</h3>}
            {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className={bodyClassName}>{children}</div>
    </div>
  );
}
