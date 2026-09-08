import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Text, TouchableOpacity, View } from 'react-native';

/**
 * Tarjeta de reporte para el historial propio.
 * Muestra nombre del delincuente, tipo, domicilio, fecha, y botón Modificar.
 *
 * @param {Object} props
 * @param {Object} props.reporte - Datos del reporte
 * @param {string} props.urlMiniatura - URL pública de la evidencia con orden=1
 * @param {boolean} props.modificado - Si el reporte fue editado alguna vez
 * @param {Function} props.onModificar - Callback al presionar "Modificar"
 * @param {Function} props.onVerDetalles - Callback al presionar la tarjeta
 */
export default function ReporteCardHistorial({ reporte, urlMiniatura, modificado, onModificar, onVerDetalles }) {
  const [errorImagen, setErrorImagen] = useState(false);

  const icono = obtenerIcono(reporte.tipo_incidente);
  const mostrarImagen = urlMiniatura && !errorImagen;

  return (
    <TouchableOpacity
      onPress={onVerDetalles}
      className="bg-white rounded-xl border border-verde-institucional/20 mx-4 mb-3 p-3 flex-row items-center"
      activeOpacity={0.7}
    >
      {/* Miniatura */}
      <View
        className="w-16 h-16 rounded-xl bg-verde-claro items-center justify-center overflow-hidden mr-3"
        style={{ borderWidth: 1, borderColor: 'rgba(23,74,26,0.15)' }}
      >
        {mostrarImagen ? (
          <Image
            source={{ uri: urlMiniatura }}
            style={{ width: 64, height: 64 }}
            contentFit="cover"
            onError={() => setErrorImagen(true)}
          />
        ) : (
          <Ionicons name={icono} size={28} color="#174A1A" />
        )}
      </View>

      {/* Info */}
      <View className="flex-1">
        <Text className="text-sm font-bold text-negro mb-1" numberOfLines={1}>
          {reporte.nombres} {reporte.apellidos}
        </Text>

        <View className="bg-verde-claro rounded-full px-3 py-1 self-start mb-1">
          <Text className="text-xs font-semibold text-verde-institucional">
            {reporte.tipo_incidente}
          </Text>
        </View>

        {reporte.domicilio && (
          <View className="flex-row items-start">
            <Ionicons name="location-outline" size={14} color="#6B7280" />
            <Text className="text-xs text-gris ml-1 flex-1" numberOfLines={1}>
              {reporte.domicilio}
            </Text>
          </View>
        )}
      </View>

      {/* Fecha y acción */}
      <View className="items-end ml-2">
        <View className="flex-row items-center mb-2">
          <Ionicons name="calendar-outline" size={14} color="#6B7280" />
          <Text className="text-xs text-gris ml-1">
            {formatearFechaCorta(reporte.fecha_incidente)}
          </Text>
        </View>

        {modificado ? (
          <View className="flex-row items-center bg-verde-claro rounded-lg px-3 py-2">
            <Ionicons name="checkmark" size={14} color="#174A1A" />
            <Text className="text-xs text-verde-institucional ml-1 font-medium">Modificado</Text>
          </View>
        ) : (
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation?.();
              onModificar?.();
            }}
            className="border border-verde-institucional rounded-lg px-3 py-2 flex-row items-center"
          >
            <Ionicons name="create-outline" size={14} color="#174A1A" />
            <Text className="text-xs text-verde-institucional ml-1 font-medium">Modificar</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

function formatearFechaCorta(fecha) {
  if (!fecha) return '';
  let dia, mesIndex, anio;
  if (typeof fecha === 'string') {
    const partes = fecha.split('T')[0].split('-');
    if (partes.length === 3) {
      anio = parseInt(partes[0], 10);
      mesIndex = parseInt(partes[1], 10) - 1;
      dia = parseInt(partes[2], 10);
    }
  }
  if (!dia) {
    const d = new Date(fecha);
    dia = d.getDate();
    mesIndex = d.getMonth();
    anio = d.getFullYear();
  }
  const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  return `${dia} ${meses[mesIndex]} ${anio}`;
}

function obtenerIcono(tipo) {
  const tipoLower = (tipo || '').toLowerCase();
  if (tipoLower.includes('robo') || tipoLower.includes('hurto') || tipoLower.includes('asalto')) return 'warning-outline';
  if (tipoLower.includes('accidente')) return 'car-outline';
  if (tipoLower.includes('asesinato') || tipoLower.includes('homicidio')) return 'alert-circle-outline';
  if (tipoLower.includes('violencia')) return 'hand-left-outline';
  return 'document-text-outline';
}

