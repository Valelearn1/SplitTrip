/** Continenti della variante B (Europa e Africa) nel viewBox 24×24; li ridisegna anche l'immagine per le storie. */
export const GLOBE_LAND = [
  'M8.6 7.2 Q8.2 5.6 9.6 4.8 Q10.8 3.6 12.8 3.4 Q14.6 2.8 16.4 3.6 Q17.6 4.6 16.6 5.6 Q15.2 6 14.2 6.8 Q12.8 7.2 11.4 6.8 Q10.2 7.6 8.6 7.2Z',
  'M7.2 8.6 Q10 7.6 12.6 8.2 Q14.4 8.4 15.2 9.6 L16.4 11.6 Q17.8 12.2 17.6 13 Q16.4 14.2 15.8 15.8 Q15 18.4 13.6 20.4 Q12.6 20.8 12.2 19.6 Q11.6 17.2 11.4 15.4 Q10.8 14.2 9.2 13.8 Q6.8 13.4 6 12 Q5.4 10.6 7.2 8.6Z',
  'M16.2 8.6 Q18 8.4 19.6 9.6 Q19.4 11 18 11.6 Q17 10.4 16.2 8.6Z',
  'M17.3 15.5 Q18 15.9 17.9 16.9 Q17.7 18 17.2 18.1 Q16.8 17 17.3 15.5Z',
  'M0.6 14 Q2.6 13.4 3.4 15.2 Q3 17.6 2 19.4 L0.6 19.4Z',
] as const
/** Colori fissi: un mappamondo è blu e verde in entrambi i temi. */
export const GLOBE_COLORS = { oceanLight: '#4f8cf7', oceanDeep: '#1f4fbf', land: '#2fbf71' } as const
