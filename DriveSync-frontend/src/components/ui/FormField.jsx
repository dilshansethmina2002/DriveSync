// =============================================================
//  Form inputs with label, hint and validation error
//  <Input label="Amount" name="amount" value={..} onChange={..} error={errors.amount} />
// =============================================================
const base =
  'w-full rounded-xl border bg-ds-surface px-3.5 text-sm text-ds-ink outline-none transition placeholder:text-ds-muted focus:bg-white focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60';
const ok = 'border-slate-200 focus:border-ds-royal focus:ring-ds-royal/10';
const bad = 'border-rose-300 bg-rose-50/40 focus:border-rose-500 focus:ring-rose-500/10';

function Field({ label, htmlFor, required, hint, error, children, className = '' }) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-ds-ink">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="mt-1.5 text-xs font-medium text-rose-600" role="alert">
          {error}
        </p>
      ) : (
        hint && <p className="mt-1.5 text-xs text-ds-muted">{hint}</p>
      )}
    </div>
  );
}

export function Input({ label, name, error, hint, required, className, prefix, ...props }) {
  return (
    <Field label={label} htmlFor={name} required={required} hint={hint} error={error} className={className}>
      <div className="relative">
        {prefix && <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-medium text-ds-muted">{prefix}</span>}
        <input id={name} name={name} aria-invalid={!!error} className={`${base} h-11 ${error ? bad : ok} ${prefix ? 'pl-12' : ''}`} {...props} />
      </div>
    </Field>
  );
}

export function Select({ label, name, error, hint, required, options = [], placeholder, className, ...props }) {
  return (
    <Field label={label} htmlFor={name} required={required} hint={hint} error={error} className={className}>
      <select id={name} name={name} aria-invalid={!!error} className={`${base} h-11 ${error ? bad : ok}`} {...props}>
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((opt) => {
          const { value, label: text, disabled } = typeof opt === 'string' ? { value: opt, label: opt } : opt;
          return (
            <option key={value} value={value} disabled={disabled}>
              {text}
            </option>
          );
        })}
      </select>
    </Field>
  );
}

export function Textarea({ label, name, error, hint, required, className, rows = 3, ...props }) {
  return (
    <Field label={label} htmlFor={name} required={required} hint={hint} error={error} className={className}>
      <textarea id={name} name={name} rows={rows} aria-invalid={!!error} className={`${base} py-2.5 ${error ? bad : ok}`} {...props} />
    </Field>
  );
}

export function Checkbox({ label, description, checked, onChange, disabled, name }) {
  return (
    <label className={`flex items-start gap-3 rounded-xl border border-slate-200 p-3.5 transition ${disabled ? 'opacity-60' : 'cursor-pointer hover:border-ds-royal/40'}`}>
      <input
        type="checkbox"
        name={name}
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-ds-royal"
      />
      <span>
        <span className="block text-sm font-medium text-ds-ink">{label}</span>
        {description && <span className="mt-0.5 block text-xs text-ds-muted">{description}</span>}
      </span>
    </label>
  );
}
