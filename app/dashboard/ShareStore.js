"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Button } from "@/app/components/ui/button";
import { Copy, Check, Download, MessageCircle } from "lucide-react";

export default function ShareStore({ url, storeName }) {
  const [qr, setQr] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  // Genera el QR (una imagen PNG en base64) cada vez que cambia la URL
  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(url, { width: 512, margin: 2 })
      .then((dataUrl) => !cancelled && setQr(dataUrl))
      .catch(() => !cancelled && setError("No se pudo generar el código QR."));
    return () => {
      cancelled = true;
    };
  }, [url]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("No se pudo copiar. Selecciona el enlace y cópialo manualmente.");
    }
  };

  const shareText = `Mira el catálogo de ${storeName}: ${url}`;
  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(shareText)}`;

  return (
    <div className="rounded-xl border-2 border-[var(--border)] p-4 space-y-3">
      <h2 className="m-0 text-base font-extrabold text-[var(--text)]">Comparte tu tienda</h2>

      <div className="flex flex-wrap items-center gap-2">
        <input readOnly value={url} aria-label="Enlace de tu tienda" className="input flex-1 min-w-0" onFocus={(e) => e.target.select()} />
        <Button type="button" variant="outline" onClick={copy}>
          {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
          {copied ? "¡Copiado!" : "Copiar enlace"}
        </Button>
      </div>

      {qr ? (
        <div className="flex flex-wrap items-center gap-4">
          <img src={qr} alt={`Código QR de ${storeName}`} width={160} height={160} className="rounded-lg border-2 border-[var(--border)] bg-white" />
          <div className="flex flex-col gap-2">
            <a href={qr} download={`qr-${storeName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.png`}>
              <Button type="button" variant="outline"><Download aria-hidden="true" /> Descargar QR</Button>
            </a>
            <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
              <Button type="button" variant="whatsapp"><MessageCircle aria-hidden="true" /> Compartir por WhatsApp</Button>
            </a>
          </div>
        </div>
      ) : (
        !error && <p className="text-sm text-[var(--muted)]">Generando código QR…</p>
      )}

      {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
    </div>
  );
}