/** Un quadrato 1×1 per ogni modulo scuro: un solo <path>, niente migliaia di <rect>. */
export const qrPath = (data: boolean[][]) =>
  data.flatMap((row, y) => row.map((on, x) => (on ? `M${x} ${y}h1v1h-1z` : ''))).join('')
