'use client';

import { useState } from 'react';
import { MX_STATES, MX_MUNICIPALITIES } from '@/app/lib/mx-regions';
import * as F from '@/app/lib/form-styles';

export default function RegionSelect({ state: initialState = '', city: initialCity = '', onStateChange, onCityChange }) {
  const [state, setState] = useState(initialState);
  const [city, setCity] = useState(initialCity);

  const municipalities = state ? (MX_MUNICIPALITIES[state] || []) : [];

  const handleStateChange = (e) => {
    const val = e.target.value;
    setState(val);
    setCity('');
    onStateChange?.(val);
    onCityChange?.('');
  };

  const handleCityChange = (e) => {
    const val = e.target.value;
    setCity(val);
    onCityChange?.(val);
  };

  return (
    <div className="grid sm:grid-cols-2 gap-3">
      <div className={F.field}>
        <label className={F.label}>Estado</label>
        <select
          name="state"
          className={F.select}
          value={state}
          onChange={handleStateChange}
        >
          <option value="">Sin especificar</option>
          {MX_STATES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
      <div className={F.field}>
        <label className={F.label}>Municipio <span className={F.hint}>(opcional)</span></label>
        <select
          name="city"
          className={F.select}
          value={city}
          onChange={handleCityChange}
          disabled={!state}
        >
          <option value="">
            {state ? 'Selecciona municipio' : 'Primero elige estado'}
          </option>
          {municipalities.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
