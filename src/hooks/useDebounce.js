import { useState, useEffect } from 'react';

/**
 * Hook que retorna un valor debounced.
 * Útil para evitar disparar queries en cada tecla del buscador.
 *
 * @param {any} valor - Valor a debounce
 * @param {number} delay - Milisegundos de espera (default 350ms)
 * @returns {any} Valor debounced
 */
export function useDebounce(valor, delay = 350) {
  const [valorDebounced, setValorDebounced] = useState(valor);

  useEffect(() => {
    const handler = setTimeout(() => {
      setValorDebounced(valor);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [valor, delay]);

  return valorDebounced;
}
