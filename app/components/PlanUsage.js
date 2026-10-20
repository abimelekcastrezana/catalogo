import { Badge } from '@/app/components/ui/badge';
import { isAtLimit } from '@/app/lib/plans';

// Pastilla del plan + uso (ej. "Plan Free · 3 de 10 productos").
export default function PlanUsage({ plan, count, limit, noun }) {
  const atLimit = limit !== 0 && isAtLimit(limit, count);
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Badge variant="outline">Plan {plan.label}</Badge>
      <span className={`text-sm font-bold tabular-nums ${atLimit ? 'text-[var(--danger)]' : 'text-[var(--muted)]'}`}>
        {limit === null
          ? `${count} ${noun} · sin límite`
          : limit === 0 ? `No incluye ${noun}` : `${count} de ${limit} ${noun}`}
        {atLimit && ' · llegaste al límite'}
      </span>
      {limit !== null && count > limit && (
        <p className="w-full m-0 text-sm text-[var(--muted)]">
          {limit === 0
            ? `Tus ${noun} se conservan, pero tu plan no las muestra en la tienda.`
            : `Tu tienda solo muestra los primeros ${limit} ${noun} según su orden; el resto se conserva oculto.`}
        </p>
      )}
    </div>
  );
}
