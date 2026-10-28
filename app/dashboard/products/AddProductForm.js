"use client";

import { useState } from "react";
import { ChevronDown, X } from 'lucide-react';
import DescriptionField from './DescriptionField';
import CardValuesEditor from './CardValuesEditor';
import { KIND_CARD, WHOLESALE_UNIT_MAX_LENGTH, WHOLESALE_UNIT_SUGGESTIONS } from '@/app/lib/products';

export default function AddProductForm({ vendorId, categories, apiBase = '/api/vendors', plan, kind = 'product', onSuccess }) {
  const full = plan.fullProductFeatures;
  const isCard = kind === KIND_CARD;
  const [cardValues, setCardValues] = useState([{ tempId: 1, name: '', price: '' }]);
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [price, setPrice] = useState("");
  const [badge, setBadge] = useState("");
  const [imageFiles, setImageFiles] = useState([null, null]);

  const [variants, setVariants] = useState([]);
  const [wholesaleOpen, setWholesaleOpen] = useState(false);
  const [wholesalePrice, setWholesalePrice] = useState("");
  const [wholesaleMinQty, setWholesaleMinQty] = useState("");
  const [wholesaleUnit, setWholesaleUnit] = useState("");
  const [discountPercent, setDiscountPercent] = useState("");
  const [discountOnWholesale, setDiscountOnWholesale] = useState(false);
  const [wholesaleDescription, setWholesaleDescription] = useState("");

  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addVariantRow = () =>
    setVariants((prev) => [...prev, { tempId: Date.now(), name: "", price: "", imageFile: null }]);

  const removeVariant = (i) =>
    setVariants((prev) => prev.filter((_, idx) => idx !== i));

  const updateVariant = (i, field, value) =>
    setVariants((prev) => prev.map((v, idx) => (idx === i ? { ...v, [field]: value } : v)));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setMessage(isCard ? 'Creando suscripción...' : 'Creando producto...');

    try {
      const res = await fetch(`${apiBase}/${vendorId}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isCard ? {
          kind, name, description, categoryId: categoryId || null, badge: badge || null,
          variants: cardValues.map((v) => ({ name: v.name, price: v.price })),
        } : {
          name, sku, description, categoryId: categoryId || null, price,
          badge: badge || null,
          wholesalePrice: wholesalePrice || null,
          wholesaleMinQty: wholesaleMinQty || null,
          wholesaleUnit: wholesaleUnit || null,
          discountPercent: discountPercent || null,
          discountOnWholesale: Boolean(discountPercent && wholesalePrice && discountOnWholesale),
          wholesaleDescription: wholesaleDescription || null,
          variants: variants.map((v, i) => ({ name: v.name, price: v.price || null, position: i })),
        }),
      });

      let data;
      try {
        data = await res.json();
      } catch (err) {
        const text = await res.text();
        setMessage(`Error del servidor: ${text || err.message}`);
        setIsSubmitting(false);
        return;
      }

      if (!res.ok) {
        setMessage(data.error || "Error creando producto");
        setIsSubmitting(false);
        return;
      }

      const product = data.product;
      if (!product || !product.id) {
        setMessage("Producto creado, pero no se retornó id");
        setIsSubmitting(false);
        return;
      }

      // Upload product images
      const uploadPromises = imageFiles
        .filter((f) => f)
        .slice(0, 2)
        .map(async (file) => {
          const formData = new FormData();
          formData.append('image', file);
          const uploadRes = await fetch(`/api/products/${product.id}/images`, {
            method: 'POST',
            body: formData,
          });
          return uploadRes.json();
        });

      await Promise.all(uploadPromises);

      // Upload variant images
      const createdVariants = data.variants || [];
      await Promise.all(
        variants.map(async (v, i) => {
          if (!v.imageFile) return;
          const savedVariant = createdVariants[i];
          if (!savedVariant?.id) return;
          const fd = new FormData();
          fd.append('image', v.imageFile);
          await fetch(`/api/products/${product.id}/variants/${savedVariant.id}/image`, {
            method: 'POST',
            body: fd,
          });
        })
      );

      setName('');
      setSku('');
      setPrice('');
      setDescription('');
      setCategoryId('');
      setBadge('');
      setImageFiles([null, null]);
      setCardValues([{ tempId: Date.now(), name: '', price: '' }]);
      setVariants([]);
      setWholesaleOpen(false);
      setWholesalePrice('');
      setWholesaleMinQty('');
      setWholesaleUnit('');
      setDiscountPercent('');
      setDiscountOnWholesale(false);
      setWholesaleDescription('');
      setIsSubmitting(false);
      if (onSuccess) { onSuccess(); } else { setMessage('Producto creado.'); }
    } catch (err) {
      setMessage(err.message || 'Error creando producto');
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 max-w-lg">
      <div className="grid gap-1.5">
        <label className="text-sm font-medium text-[var(--text)]">Nombre</label>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder={isCard ? 'Nombre de la suscripción' : 'Nombre del producto'} required />
      </div>
      {!isCard && (
      <div className="grid gap-1.5">
        <label className="text-sm font-medium text-[var(--text)]">Precio</label>
        <input className="input" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" type="number" step="0.01" min="0" required />
      </div>
      )}
      <DescriptionField plan={plan} value={description} onChange={setDescription} placeholder="Descripción del producto…" />
      {full && (<>
      <div className="grid gap-1.5">
        <label className="text-sm font-medium text-[var(--text)]">Categoría</label>
        <select className="select" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">Sin categoría</option>
          {categories?.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>
      <div className="grid gap-1.5">
        <label className="text-sm font-medium text-[var(--text)]">Etiqueta <span className="text-[var(--muted)] font-normal text-xs">(opcional)</span></label>
        <select className="select" value={badge} onChange={(e) => setBadge(e.target.value)}>
          <option value="">Ninguna</option>
          <option value="nuevo">Nuevo</option>
          <option value="oferta">Oferta</option>
          <option value="premium">Premium</option>
          <option value="mas_vendido">Más vendido</option>
        </select>
      </div>
      </>)}
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-1.5">
          <label className="text-sm font-medium text-[var(--text)]">Imagen 1</label>
          <input className="input" type="file" accept="image/*" onChange={(e) => setImageFiles([e.target.files[0], imageFiles[1]])} />
        </div>
        <div className="grid gap-1.5">
          <label className="text-sm font-medium text-[var(--text)]">Imagen 2</label>
          <input className="input" type="file" accept="image/*" onChange={(e) => setImageFiles([imageFiles[0], e.target.files[0]])} />
        </div>
      </div>

      {isCard && <CardValuesEditor values={cardValues} onChange={setCardValues} />}

      {full && !isCard && (<>
      <div className="grid gap-3 border-t border-[var(--border)] pt-3">
        <div className="grid gap-1.5">
          <label className="text-sm font-medium text-[var(--text)]">Descuento % <span className="text-[var(--muted)] font-normal text-xs">(opcional)</span></label>
          <input className="input" type="number" min="1" max="99" step="1" value={discountPercent}
            onChange={(e) => setDiscountPercent(e.target.value)} placeholder="ej. 20" />
        </div>
        {discountPercent && wholesalePrice && (
          <label className="flex items-center gap-2 text-sm font-medium text-[var(--text)]">
            <input type="checkbox" className="h-4 w-4 accent-[var(--accent)]" checked={discountOnWholesale}
              onChange={(e) => setDiscountOnWholesale(e.target.checked)} />
            Aplicar también al precio de mayoreo
          </label>
        )}
      </div>

      {/* Variantes */}
      <div className="grid gap-2 border-t border-[var(--border)] pt-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-[var(--text)]">Variantes <span className="text-[var(--muted)] font-normal text-xs">(opcional)</span></span>
          <button type="button" onClick={addVariantRow} className="text-xs text-[var(--accent-text)] hover:underline font-medium">
            + Agregar variante
          </button>
        </div>
        {variants.length > 0 && (
          <div className="grid gap-2">
            {variants.map((v, i) => (
              <div key={v.tempId} className="grid gap-2 p-3 rounded-xl bg-[var(--surface-strong)] border border-[var(--border)]">
                <div className="flex items-center gap-2">
                  <input
                    className="input flex-1 text-sm"
                    placeholder="Nombre (ej. Azul, Grande...)"
                    value={v.name}
                    onChange={(e) => updateVariant(i, 'name', e.target.value)}
                    required
                  />
                  <button type="button" onClick={() => removeVariant(i)} aria-label="Quitar variante" className="hit text-[var(--muted)] hover:text-[var(--danger)] transition-colors flex-shrink-0"><X className="h-5 w-5" strokeWidth={2} aria-hidden="true" /></button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="grid gap-1">
                    <label className="text-xs text-[var(--muted)]">Precio (opcional)</label>
                    <input
                      className="input text-sm"
                      type="number" step="0.01" min="0"
                      placeholder="0.00"
                      value={v.price}
                      onChange={(e) => updateVariant(i, 'price', e.target.value)}
                    />
                  </div>
                  <div className="grid gap-1">
                    <label className="text-xs text-[var(--muted)]">Foto (opcional)</label>
                    <input
                      className="input text-xs"
                      type="file" accept="image/*"
                      onChange={(e) => updateVariant(i, 'imageFile', e.target.files[0])}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Precio mayoreo */}
      <div className="border-t border-[var(--border)] pt-3">
        <button
          type="button"
          onClick={() => setWholesaleOpen((v) => !v)}
          aria-expanded={wholesaleOpen}
          className="hit text-sm font-bold text-[var(--accent-text)] hover:underline flex items-center gap-1"
        >
          <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${wholesaleOpen ? '' : '-rotate-90'}`} strokeWidth={2.5} aria-hidden="true" /> Precio mayoreo <span className="text-[var(--muted)] font-normal text-xs">(opcional)</span>
        </button>
        {wholesaleOpen && (
          <div className="grid gap-3 mt-3">
            <div className="grid gap-1.5">
              <label className="text-sm font-medium text-[var(--text)]">Precio mayoreo</label>
              <input className="input" type="number" step="0.01" min="0" value={wholesalePrice}
                onChange={(e) => setWholesalePrice(e.target.value)} placeholder="0.00" />
            </div>
            <div className="grid gap-1.5">
              <label className="text-sm font-medium text-[var(--text)]">Cantidad mínima</label>
              <input className="input" type="number" min="1" step="1" value={wholesaleMinQty}
                onChange={(e) => setWholesaleMinQty(e.target.value)} placeholder="ej. 10" />
            </div>
            <div className="grid gap-1.5">
              <label className="text-sm font-medium text-[var(--text)]">Unidad mayorista <span className="text-[var(--muted)] font-normal text-xs">(opcional)</span></label>
              <input className="input" list="wholesale-units" maxLength={WHOLESALE_UNIT_MAX_LENGTH} value={wholesaleUnit}
                onChange={(e) => setWholesaleUnit(e.target.value)} placeholder="Caja" />
              <datalist id="wholesale-units">
                {WHOLESALE_UNIT_SUGGESTIONS.map((u) => <option key={u} value={u} />)}
              </datalist>
            </div>
            <div className="grid gap-1.5">
              <label className="text-sm font-medium text-[var(--text)]">Descripción del trato</label>
              <input className="input" value={wholesaleDescription}
                onChange={(e) => setWholesaleDescription(e.target.value)}
                placeholder="ej. Precio especial por docena" />
            </div>
          </div>
        )}
      </div>
      </>)}

      <button type="submit" className="primary-button" disabled={isSubmitting}>
        {isSubmitting ? 'Creando...' : isCard ? 'Crear suscripción' : 'Crear producto'}
      </button>
      {message && (
        <p className={`text-sm ${message.includes('Error') ? 'text-[var(--danger)]' : 'text-[var(--muted)]'}`}>{message}</p>
      )}
    </form>
  );
}
