# Sistema de diseño de TiendaTap

Referencia para cualquier página o componente nuevo. Estilo: marca terracota con una sensación
tipo Duolingo en formas y movimiento (botones con volumen, bordes de 2px, esquinas redondeadas,
tipografía redondeada). Sin mascotas ni ilustraciones: solo UI.

Colores de marca en `specs/color-marca.md`. Los tokens viven en `app/globals.css`; no usar colores
sueltos (`text-white`, `bg-red-500`, `#25D366`…) salvo texto/íconos sobre fotos.

## Tokens (app/globals.css, modo claro y oscuro)

| Token | Uso |
|---|---|
| `--bg` `--surface` `--surface-strong` `--card` | Superficies (crema `#FFF8F3` en claro, carbón cálido en oscuro) |
| `--text` `--muted` | Texto (Tinta `#2B2B2B`) |
| `--border` `--border-strong` | Bordes de 2px: `--border` en tarjetas, `--border-strong` en controles |
| `--accent` / `--accent-fg` | **Relleno** de botones (`#C24E18`, blanco encima = 4.78:1) |
| `--accent-text` | **Texto/enlaces** de acento (claro `#B5460F`, oscuro durazno). Nunca `--accent` como texto |
| `--accent-soft` | Fondo de estado seleccionado / hover |
| `--accent-edge` `--whatsapp-edge` `--danger-edge` | "Canto" inferior de los botones con volumen |
| `--brand` `--brand-soft` | Terracota/durazno puros: fondos grandes y detalles, no texto |
| `--whatsapp` / `--whatsapp-fill` | Verde Pedido: icono/indicador / relleno con texto blanco |
| `--info` `--info-fill` `--highlight` `--danger` `--danger-fill` `--success` | Estados. `*-fill` = relleno con texto blanco; los demás = texto |
| `--success-soft` `--highlight-soft` `--danger-soft` `--info-soft` | Fondos suaves de estado |

Contraste mínimo AA: 4.5:1 texto normal, 3:1 grande/iconos. Medir antes de añadir un color.

## Componentes base (`app/components/ui/`)

- **`Button`**: variantes `default` (terracota), `whatsapp`, `destructive`, `dangerOutline`
  (Eliminar discreto), `outline`, `secondary`, `ghost`, `link`. Tamaños `default` (44px), `sm`
  (36px + área táctil de 44px), `lg`, `icon`. Los rellenos tienen canto inferior y se hunden al
  presionar. ghost/link usan `scale(0.96)`.
- **`Input`/`Select`/`Card`/`Badge`/`Sheet`**: mismo lenguaje (borde 2px, radio 16/24px).
- **`IconSwap`**: cruza dos iconos (opacity + scale + blur) para estados (más→palomita, luna↔sol).
- Clases CSS en `globals.css` para vistas sin `Button`: `.primary-button`, `.secondary-button`,
  `.input`, `.select` (con chevron), `.icon-btn` (cuadrado de icono en listas), `.card`, `.page-card`.

## Reglas

- **Iconos**: `lucide-react`, trazo 2 junto a texto en negrita y 1.5 junto a texto normal,
  `aria-hidden` en decorativos y `aria-label` en botones de solo icono. Cero emojis como iconos.
- **Radios concéntricos**: radio exterior = interior + padding (tarjeta 24px → botón interior 12px).
- **Movimiento**: sin `transition-all` (listar propiedades). Entradas ~200–280ms `ease-out`, salidas
  más cortas y suaves. Clases en globals.css: `.anim-overlay`, `.sheet-bottom`, `.sheet-right`,
  `.sheet-modal-md`, `.anim-pop-in`, `.anim-bump`. Todo respeta `prefers-reduced-motion`.
  Sin animaciones personalizadas en interacciones muy frecuentes.
- **Táctil**: objetivos de 44px. Para controles visualmente pequeños usar la clase `.hit`
  (amplía el área sin cambiar el tamaño). `.hit` usa `:where()`; no volver a ponerle
  especificidad o rompe `absolute`/`fixed` de Tailwind (ya pasó).
- **Hover** solo en dispositivos con hover (`future.hoverOnlyWhenSupported` en Tailwind).
- **Formularios**: `<label htmlFor>`, `name`, `autoComplete`, `type` correcto, texto de 16px en
  inputs (evita zoom de iOS), placeholders terminan en `…`. Errores con `role="alert"`.
- **Estados**: nunca solo color (pastilla con texto "En línea", `aria-pressed`, `aria-expanded`).
- **Imágenes**: `width`/`height`, `loading="lazy"` (salvo la principal), clase `.img-outline`.
- **Tipografía**: Nunito (`next/font`, variable `--font-nunito`), `tabular-nums` en precios,
  `text-wrap: balance` ya aplicado a h1–h4.
- **Destructivo**: acciones que borran piden confirmación y usan `dangerOutline`.
- **z-index**: botón del carrito `z-40` (debajo de hojas/modales `z-50`).

## Patrones de página

- **Home (`/`)**: encabezado + buscador, chips (estado + 10 etiquetas más usadas), cuadrícula de
  tarjetas, "Cargar más" (`?page=`, 12 por página, en línea primero), franja para vendedores.
- **Tienda (`/[slug]`)**: cabecera tipo perfil, tabs, buscador con autocompletado, chips de
  categoría, cuadrícula de productos, detalle en hoja/modal, carrito en hoja lateral.
- **Dashboard/Admin**: `Card` + `Button`, listas con `.icon-btn`, formularios en `Sheet`.

## Cómo verificar cambios de UI

- Servidor: `npm run dev`. Base de datos: `docker start catalogo_devcontainer-db-1` (Postgres 5432;
  Docker Desktop debe estar abierto). El `docker-compose.yml` de la raíz es de producción, no usarlo local.
- Probar siempre claro y oscuro, móvil (390px) y escritorio.
- Hay skills en `.claude/skills/` (`better-ui`, `web-design-guidelines`); `.claude/` está en
  `.gitignore`, no viajan con el repo.
- Si necesitas datos de prueba, bórralos al terminar.
