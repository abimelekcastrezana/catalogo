"use client";

import * as F from '@/app/lib/form-styles';
import { PLANS, planExpires, defaultPlanExpiry } from '@/app/lib/plans';

export default function PlanSelect({ plan, expiresAt, onChange }) {
  const handlePlanChange = (nextPlan) => {
    // Al pasar a un plan de pago sin fecha, se propone hoy + 1 año; Free no vence.
    const nextExpiry = planExpires(nextPlan) ? (expiresAt || defaultPlanExpiry()) : '';
    onChange({ plan: nextPlan, expiresAt: nextExpiry });
  };

  return (
    <div className="grid gap-3">
      <div className={F.field}>
        <label htmlFor="vendor-plan" className={F.label}>Plan</label>
        <select id="vendor-plan" name="plan" className={F.select} value={plan} onChange={(e) => handlePlanChange(e.target.value)}>
          {Object.values(PLANS).map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
        </select>
        <p className={F.hint}>
          Free: 10 productos, sin categorías, solo fotos, nombre, descripción corta y precio.
          Plus: 40 productos y 5 categorías. Max: sin límites.
        </p>
      </div>
      {planExpires(plan) && (
        <div className={F.field}>
          <label htmlFor="vendor-plan-expires" className={F.label}>Vence el</label>
          <input
            id="vendor-plan-expires"
            name="planExpiresAt"
            type="date"
            className={F.input}
            value={expiresAt}
            onChange={(e) => onChange({ plan, expiresAt: e.target.value })}
            required
          />
          <p className={F.hint}>Suscripción anual. Por defecto, un año a partir de hoy.</p>
        </div>
      )}
    </div>
  );
}
