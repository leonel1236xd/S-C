import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, BackHandler } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import LoadingSpinner from '../../../src/components/LoadingSpinner';
import AvatarUsuario from '../../../src/components/AvatarUsuario';
import ZoomableImageModal from '../../../src/components/ZoomableImageModal';
import { obtenerReportePorId } from '../../../src/services/reportes';
import { obtenerUrlPublica } from '../../../src/services/evidencias';

export default function DetalleReporte() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [reporte, setReporte] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [imagenModalUrl, setImagenModalUrl] = useState(null);

  // Manejar botón físico de atrás (Android)
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace('/(policia)');
        }
        return true;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [router])
  );

  useEffect(() => {
    cargar();
  }, [id]);

  async function cargar() {
    try {
      setCargando(true);
      const data = await obtenerReportePorId(id);
      setReporte(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  function formatearFecha(fecha) {
    if (!fecha) return '-';
    if (typeof fecha === 'string') {
      const partes = fecha.split('T')[0].split('-');
      if (partes.length === 3) {
        const [anio, mes, dia] = partes;
        return `${dia.padStart(2, '0')}/${mes.padStart(2, '0')}/${anio}`;
      }
    }
    const d = new Date(fecha);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  }

  function formatearHora(hora) {
    if (!hora) return '-';
    const partes = hora.split(':');
    return `${partes[0]}:${partes[1]}`;
  }

  if (cargando) return <LoadingSpinner mensaje="Cargando reporte..." />;
  if (error) {
    return (
      <View className="flex-1 items-center justify-center px-8">
        <Text className="text-red-500 text-center">{error}</Text>
      </View>
    );
  }
  if (!reporte) return null;

  const evidencias = (reporte.evidencias || []).sort((a, b) => a.orden - b.orden);
  const policia = reporte.usuarios;

  return (
    <View className="flex-1 bg-fondo">
      {/* Número de caso header */}
      <View style={{ backgroundColor: '#162A0F' }} className="px-4 py-3">
        <Text className="text-white text-xs font-bold">Número de caso</Text>
        <Text className="text-amarillo text-xl font-bold">#{reporte.numero_caso}</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Información del incidente */}
        <View className="bg-white rounded-xl p-4 mb-4 border border-verde-institucional/10">
          <View className="flex-row items-center mb-3">
            <Ionicons name="document-text" size={20} color="#174A1A" />
            <Text className="text-verde-institucional text-base font-bold ml-2">
              Información del incidente
            </Text>
          </View>

          <View className="flex-row mb-2">
            <View className="flex-1">
              <Text className="text-xs text-gris">Tipo de incidente</Text>
              <Text className="text-sm font-bold text-negro">{reporte.tipo_incidente}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-xs text-gris">Fecha</Text>
              <Text className="text-sm font-bold text-negro">{formatearFecha(reporte.fecha_incidente)}</Text>
            </View>
          </View>

          <View className="flex-row">
            <View className="flex-1">
              <Text className="text-xs text-gris">Lugar</Text>
              <Text className="text-sm font-bold text-negro">{reporte.domicilio || '-'}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-xs text-gris">Hora</Text>
              <Text className="text-sm font-bold text-negro">{formatearHora(reporte.hora_incidente)}</Text>
            </View>
          </View>

          {reporte.descripcion_incidente && (
            <View className="mt-2">
              <Text className="text-xs text-gris">Descripción</Text>
              <Text className="text-sm text-negro">{reporte.descripcion_incidente}</Text>
            </View>
          )}
        </View>

        {/* Información del delincuente */}
        <View className="bg-white rounded-xl p-4 mb-4 border border-verde-institucional/10">
          <View className="flex-row items-center mb-3">
            <Ionicons name="person" size={20} color="#174A1A" />
            <Text className="text-verde-institucional text-base font-bold ml-2">
              Información del incidente
            </Text>
          </View>

          <View className="border border-gray-200 rounded-lg overflow-hidden">
            <FilaDetalle label="Apellidos" valor={reporte.apellidos} />
            <FilaDetalle label="Nombres" valor={reporte.nombres} alterno />
            <FilaDetalle label="Fecha de nacimiento" valor={formatearFecha(reporte.fecha_nacimiento)} />
            <FilaDetalle label="Edad" valor={reporte.edad ? `${reporte.edad} años` : '-'} alterno />
            <FilaDetalle label="C.I. / NIT" valor={reporte.ci || '-'} />
            <FilaDetalle label="Nacionalidad" valor={reporte.nacionalidad || '-'} alterno />
            <FilaDetalle label="Alias" valor={reporte.alias || '-'} />
            <FilaDetalle label="Tipo de incidente" valor={reporte.tipo_incidente} alterno />
            <FilaDetalle label="Especialidad" valor={reporte.especialidad || '-'} />
            <FilaDetalle label="Domicilio" valor={reporte.domicilio || '-'} alterno ultimo />
          </View>
        </View>

        {/* Evidencia visual */}
        {evidencias.length > 0 && (
          <View className="bg-white rounded-xl p-4 mb-4 border border-verde-institucional/10">
            <View className="flex-row items-center mb-3">
              <Ionicons name="images" size={20} color="#174A1A" />
              <Text className="text-verde-institucional text-base font-bold ml-2">
                Evidencia visual
              </Text>
            </View>

            <View className="flex-row gap-3">
              {evidencias.map((ev) => {
                const url = obtenerUrlPublica(ev.ruta_archivo);
                return (
                  <TouchableOpacity
                    key={ev.id_evidencia}
                    onPress={() => setImagenModalUrl(url)}
                    activeOpacity={0.85}
                    style={{ flex: 1, height: 100, borderRadius: 12, overflow: 'hidden' }}
                  >
                    <Image
                      source={{ uri: url }}
                      style={{ width: '100%', height: '100%' }}
                      contentFit="cover"
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Policía que registró */}
        {policia && (
          <View className="bg-white rounded-xl p-4 mb-4 border border-verde-institucional/10 flex-row items-center">
            <AvatarUsuario tamaño={48} />
            <View className="ml-3">
              <Text className="text-xs text-gris">{policia.tipo_policia || 'Policía'}</Text>
              <Text className="text-sm font-bold text-negro">
                {policia.nombres} {policia.apellidos}
              </Text>
            </View>
          </View>
        )}

        {/* Botón volver */}
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-amarillo rounded-xl py-4 flex-row items-center justify-center mt-2"
        >
          <Ionicons name="arrow-back" size={20} color="#162A0F" />
          <Text className="text-verde-fuerte text-base font-bold ml-2">Volver</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal de Imagen Ampliada con Zoom y Gestos (Pinch-to-Zoom) */}
      <ZoomableImageModal
        visible={!!imagenModalUrl}
        url={imagenModalUrl}
        onClose={() => setImagenModalUrl(null)}
      />
    </View>
  );
}

function FilaDetalle({ label, valor, alterno = false, ultimo = false }) {
  return (
    <View className={`flex-row ${alterno ? 'bg-verde-claro/50' : 'bg-white'} ${!ultimo ? 'border-b border-gray-200' : ''}`}>
      <View className="flex-1 px-3 py-2 border-r border-gray-200">
        <Text className="text-xs text-gris">{label}</Text>
      </View>
      <View className="flex-1 px-3 py-2">
        <Text className="text-sm font-semibold text-negro">{valor || '-'}</Text>
      </View>
    </View>
  );
}
