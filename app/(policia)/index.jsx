import { useFocusEffect, useRouter, useLocalSearchParams } from 'expo-router';
import { useCallback, useState, useEffect } from 'react';
import { FlatList, Text, View } from 'react-native';
import BuscadorInput from '../../src/components/BuscadorInput';
import FiltroChips from '../../src/components/FiltroChips';
import HeaderPolicia from '../../src/components/HeaderPolicia';
import LoadingSpinner from '../../src/components/LoadingSpinner';
import ReporteCard from '../../src/components/ReporteCard';
import { useReportes } from '../../src/hooks/useReportes';
import { obtenerUrlPublica } from '../../src/services/evidencias';

const FILTROS_BASE = [
  { label: 'Reciente', valor: '', icono: 'time-outline' },
  { label: 'Robos', valor: 'Robo', icono: 'warning-outline' },
  { label: 'Accidentes', valor: 'Accidente', icono: 'car-outline' },
  { label: 'Homicidio', valor: 'Asesinato', icono: 'alert-circle-outline' },
  { label: 'Otros', valor: 'OTROS', icono: 'options-outline' },
];

export default function InicioPolicia() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [busqueda, setBusqueda] = useState('');
  const [filtro, setFiltro] = useState('');
  const [incidentesSeleccionados, setIncidentesSeleccionados] = useState([]);

  // Recibir incidentes seleccionados desde filtro-incidentes.jsx
  useEffect(() => {
    if (params.incidentesFiltro) {
      try {
        const parsed = JSON.parse(params.incidentesFiltro);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setIncidentesSeleccionados(parsed);
          setFiltro('OTROS');
          setBusqueda('');
        } else {
          setIncidentesSeleccionados([]);
          setFiltro('');
        }
      } catch (e) {
        // Ignorar error de parseo
      }
    }
  }, [params.incidentesFiltro]);

  // Determinar los tipos a filtrar
  const tiposAFiltrar = filtro === 'OTROS' ? incidentesSeleccionados : (filtro ? [filtro] : []);

  const { reportes, cargando, cargandoInicial, error, cargarMas, refrescar } = useReportes({
    busqueda,
    tiposIncidentes: tiposAFiltrar,
  });

  // Refrescar al volver a la pantalla si no estamos recibiendo un filtro nuevo por params
  useFocusEffect(
    useCallback(() => {
      if (!params.incidentesFiltro) {
        refrescar();
      }
    }, [params.incidentesFiltro, refrescar])
  );

  function handleFiltro(valor) {
    if (valor === 'OTROS') {
      // Limpiar filtros anteriores para que al entrar de nuevo esté vacía la selección
      setIncidentesSeleccionados([]);
      setFiltro('');
      router.push({
        pathname: '/(policia-stack)/filtro-incidentes',
        params: { seleccionados: JSON.stringify([]) },
      });
      return;
    }

    setFiltro(valor);
    setIncidentesSeleccionados([]);
    if (valor) setBusqueda('');
  }

  const filtrosDinamicos = FILTROS_BASE.map((f) => {
    if (f.valor === 'OTROS') {
      return {
        ...f,
        label: incidentesSeleccionados.length > 0
          ? `Otros (${incidentesSeleccionados.length})`
          : 'Otros',
      };
    }
    return f;
  });

  function obtenerMiniatura(reporte) {
    if (!reporte.evidencias || reporte.evidencias.length === 0) return null;
    const evidencia1 = reporte.evidencias.find((e) => e.orden === 1) || reporte.evidencias[0];
    return obtenerUrlPublica(evidencia1.ruta_archivo);
  }

  return (
    <View className="flex-1 bg-fondo">
      <View style={{ flexShrink: 0 }}>
        <HeaderPolicia />
      </View>

      <View style={{ flexShrink: 0 }}>
        <FiltroChips
          filtros={filtrosDinamicos}
          seleccionado={filtro}
          onSeleccionar={handleFiltro}
          cargando={cargandoInicial}
        />
      </View>

      <View style={{ flexShrink: 0 }}>
        <BuscadorInput
          valor={busqueda}
          onCambiar={(text) => {
            setBusqueda(text);
            if (text) {
              setFiltro('');
              setIncidentesSeleccionados([]);
            }
          }}
          placeholder="Buscar por nombre ..."
        />
      </View>

      {error && (
        <View className="mx-4 mb-3 bg-red-100 rounded-xl px-4 py-3">
          <Text className="text-red-600 text-sm">{error}</Text>
        </View>
      )}

      {cargandoInicial ? (
        <View className="flex-1 justify-center items-center py-12">
          <LoadingSpinner mensaje="Cargando reportes..." />
        </View>
      ) : (
        <FlatList
          data={reportes}
          keyExtractor={(item) => item.id_reporte}
          contentContainerStyle={{ paddingBottom: 80 }}
          renderItem={({ item }) => (
            <ReporteCard
              reporte={item}
              urlMiniatura={obtenerMiniatura(item)}
              onVerDetalles={() =>
                router.push(`/(policia-stack)/detalle-reporte/${item.id_reporte}`)
              }
            />
          )}
          ListEmptyComponent={
            <View className="items-center py-12">
              <Text className="text-gris text-sm">No se encontraron reportes</Text>
            </View>
          }
          ListFooterComponent={cargando ? <LoadingSpinner /> : null}
          onEndReached={cargarMas}
          onEndReachedThreshold={0.5}
          onRefresh={refrescar}
          refreshing={false}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
