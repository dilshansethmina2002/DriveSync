// Coloured pill for any status (payment, vehicle, maintenance, condition)
import { STATUS_STYLES, DOT_STYLES } from '../../utils/statusStyles';

export default function StatusBadge({ status, className = '' }) {
  const style = STATUS_STYLES[status] || 'bg-slate-100 text-slate-600 ring-slate-500/20';
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset whitespace-nowrap ${style} ${className}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${DOT_STYLES[style] || 'bg-slate-400'}`} />
      {status || 'Unknown'}
    </span>
  );
}
