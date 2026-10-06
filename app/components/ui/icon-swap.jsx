import * as React from "react"

// Cruza dos iconos (opacity + scale + blur); ambos permanecen en el DOM.
// Los estilos viven en globals.css (.icon-swap).
export function IconSwap({ active, from: From, to: To, className }) {
  return (
    <span className={`icon-swap ${className || ""}`} aria-hidden="true">
      <From data-hidden={active} />
      <To data-hidden={!active} />
    </span>
  )
}
