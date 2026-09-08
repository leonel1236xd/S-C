import { useState, useEffect, useCallback } from 'react';
import { obtenerReportes, obtenerReportesPropios } from '../services/reportes';
import { useDebounce } from './useDebounce';

/**
 * Hook que encapsula la lógica de fetch de reportes con búsqueda debounced y paginación.
 *
 * @param {Object} opciones
 * @param {string} opciones.busqueda - Texto de búsqueda
 * @param {string} opciones.idUsuario - Si se pasa, filtra solo los reportes de ese usuario
 * @param {number} opciones.limite - Reportes por página (default 10)
 */
export function useReportes({ busqueda = '', tiposIncidentes = [], idUsuario = null, limite = 10 } = {}) {
  const [reportes, setReportes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [cargandoInicial, setCargandoInicial] = useState(true);
  const [error, setError] = useState(null);
  const [hayMas, setHayMas] = useState(true);

  const busquedaDebounced = useDebounce(busqueda);
  const tiposKey = JSON.stringify(tiposIncidentes);

  const cargar = useCallback(async (desde = 0, acumular = false) => {
    try {
      setCargando(true);
      if (!acumular) {
        setCargandoInicial(true);
      }
      setError(null);

      let parsedTipos = [];
      try {
        parsedTipos = JSON.parse(tiposKey);
      } catch (e) {
        parsedTipos = [];
      }

      let data;
      if (idUsuario) {
        data = await obtenerReportesPropios({
          idUsuario,
          busqueda: busquedaDebounced,
          tiposIncidentes: parsedTipos,
          limite,
          desde,
        });
      } else {
        data = await obtenerReportes({
          busqueda: busquedaDebounced,
          tiposIncidentes: parsedTipos,
          limite,
          desde,
        });
      }

      setHayMas(data.length === limite);

      if (acumular) {
        setReportes((prev) => [...prev, ...data]);
      } else {
        setReportes(data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
      setCargandoInicial(false);
    }
  }, [busquedaDebounced, tiposKey, idUsuario, limite]);

  // Recargar cuando cambia la búsqueda debounced
  useEffect(() => {
    cargar(0, false);
  }, [cargar]);

  const cargarMas = useCallback(() => {
    if (!cargando && hayMas) {
      cargar(reportes.length, true);
    }
  }, [cargando, hayMas, reportes.length, cargar]);

  const refrescar = useCallback(() => {
    cargar(0, false);
  }, [cargar]);

  return {
    reportes,
    cargando,
    cargandoInicial,
    error,
    hayMas,
    cargarMas,
    refrescar,
  };
}
