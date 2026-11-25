// White rounded card with an optional header (title, subtitle, actions)
export default function Card({ title, subtitle, actions, children, className = '', bodyClassName = 'p-5', icon: Icon }) {
  return (
    <section className={`bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(20,38,84,0.06)] ${className}`}>
      {(title || actions) && (
        <header className="flex flex-wrap items-center justify-between gap-3 px-5 pt-5">
          <div className="flex items-center gap-3 min-w-0">
            {Icon && (
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-ds-royal/10 text-ds-royal">
                <Icon className="h-4.5 w-4.5" />
              </span>
            )}
            <div className="min-w-0">
              {title && <h3 className="font-semibold text-ds-ink truncate">{title}</h3>}
              {subtitle && <p className="text-xs text-ds-muted mt-0.5">{subtitle}</p>}
            </div>
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}
