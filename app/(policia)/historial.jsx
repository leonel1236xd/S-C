import React, { useState, useCallback } from 'react';
import { View, FlatList, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import HeaderPolicia from '../../src/components/HeaderPolicia';
import BuscadorInput from '../../src/components/BuscadorInput';
import ReporteCardHistorial from '../../src/components/ReporteCardHistorial';
import LoadingSpinner from '../../src/components/LoadingSpinner';
import { useAuth } from '../../src/context/AuthContext';
import { useReportes } from '../../src/hooks/useReportes';
import { obtenerEstadisticasPropias } from '../../src/services/reportes';
import { obtenerUrlPublica } from '../../src/services/evidencias';

export default function HistorialPolicia() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { usuario } = useAuth();
  const [busqueda, setBusqueda] = useState('');
  const [stats, setStats] = useState({ total: 0, esteMes: 0, modificadas: 0 });

  const { reportes, cargando, cargandoInicial, error, cargarMas, refrescar } = useReportes({
    busqueda,
    idUsuario: usuario?.id_usuario,
  });

  useFocusEffect(
    useCallback(() => {
      refrescar();
      cargarEstadisticas();
    }, [])
  );

  async function cargarEstadisticas() {
    if (!usuario) return;
    try {
      const data = await obtenerEstadisticasPropias(usuario.id_usuario);
      setStats(data);
    } catch (err) {
      // Silently fail for stats
    }
  }

  const obtenerMiniatura = useCallback((reporte) => {
    if (!reporte.evidencias || reporte.evidencias.length === 0) return null;
    const evidencia1 = reporte.evidencias.find((e) => e.orden === 1) || reporte.evidencias[0];
    return obtenerUrlPublica(evidencia1.ruta_archivo);
  }, []);

  const esModificado = useCallback((reporte) => {
    return new Date(reporte.updated_at).getTime() > new Date(reporte.created_at).getTime() + 1000;
  }, []);

  return (
    <View className="flex-1 bg-fondo">
      <HeaderPolicia />

      {/* Estadísticas */}
      <View className="flex-row mx-4 mb-3 bg-white rounded-xl border border-verde-institucional/20 overflow-hidden mt-3">
        <View className="flex-1 items-center py-3 border-r border-gray-200">
          <Text className="text-xs text-gris font-medium">Total</Text>
          <Text className="text-2xl font-bold text-negro">{stats.total}</Text>
        </View>
        <View className="flex-1 items-center py-3 border-r border-gray-200">
          <Text className="text-xs text-blue-600 font-medium">Este Mes</Text>
          <Text className="text-2xl font-bold text-blue-600">{stats.esteMes}</Text>
        </View>
        <View className="flex-1 items-center py-3 bg-verde-claro">
          <Text className="text-xs text-verde-institucional font-medium">Modificadas</Text>
          <Text className="text-2xl font-bold text-verde-institucional">{stats.modificadas}</Text>
        </View>
      </View>

      <BuscadorInput
        valor={busqueda}
        onCambiar={setBusqueda}
        placeholder="Buscar por tipo de delito ..."
      />

      {error && (
        <View className="mx-4 mb-3 bg-red-100 rounded-xl px-4 py-3">
          <Text className="text-red-600 text-sm">{error}</Text>
        </View>
      )}

      {cargandoInicial ? (
        <View className="flex-1 justify-center items-center py-12">
          <LoadingSpinner mensaje="Cargando historial..." />
        </View>
      ) : (
        <FlatList
          data={reportes}
          keyExtractor={(item) => item.id_reporte}
          contentContainerStyle={{ paddingBottom: 80 }}
          renderItem={({ item }) => (
            <ReporteCardHistorial
              reporte={item}
              urlMiniatura={obtenerMiniatura(item)}
              modificado={esModificado(item)}
              onModificar={() =>
                router.push({
                  pathname: '/(policia-stack)/nuevo-reporte',
                  params: { idReporte: item.id_reporte, modoEdicion: 'true' },
                })
              }
              onVerDetalles={() =>
                router.push(`/(policia-stack)/detalle-reporte/${item.id_reporte}`)
              }
            />
          )}
          ListEmptyComponent={
            <View className="items-center py-12">
              <Text className="text-gris text-sm">No tienes reportes registrados</Text>
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
