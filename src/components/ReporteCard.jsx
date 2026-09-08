import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

/**
 * Tarjeta de reporte para el feed de inicio.
 * Muestra miniatura (evidencia orden=1), fecha, tipo_incidente, domicilio, tiempo relativo.
 *
 * @param {Object} props
 * @param {Object} props.reporte - Datos del reporte
 * @param {string} props.urlMiniatura - URL pública de la evidencia con orden=1
 * @param {Function} props.onVerDetalles - Callback al presionar "Ver detalles"
 */
export default function ReporteCard({ reporte, urlMiniatura, onVerDetalles }) {
  const [errorImagen, setErrorImagen] = useState(false);

  // Calcular tiempo relativo
  const tiempoRelativo = calcularTiempoRelativo(reporte.created_at);

  // Determinar ícono según tipo de incidente
  const icono = obtenerIcono(reporte.tipo_incidente);

  // Determinar si mostrar la imagen real o el ícono de fallback
  const mostrarImagen = urlMiniatura && !errorImagen;

  return (
    <View
      className="bg-white rounded-xl mx-4 mb-3 p-4 flex-row"
      style={{ borderWidth: 1, borderColor: 'rgba(23,74,26,0.2)', minHeight: 96 }}
    >
      {/* Miniatura: imagen de evidencia o ícono de fallback */}
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

      {/* Info del reporte */}
      <View className="flex-1 justify-between">
        {/* Fila superior: nombre del criminal + tiempo relativo */}
        <View className="flex-row items-center justify-between mb-1">
          <Text
            style={{ fontSize: 14, fontWeight: 'bold', color: '#111' }}
            className="flex-1 mr-2"
            numberOfLines={1}
          >
            {reporte.nombres} {reporte.apellidos}
          </Text>
          <View className="flex-row items-center">
            <Ionicons name="time-outline" size={14} color="#8B1D1D" />
            <Text style={{ fontSize: 11, fontWeight: '600', color: '#8B1D1D', marginLeft: 4 }}>
              {tiempoRelativo}
            </Text>
          </View>
        </View>

        {/* Insignia de tipo de incidente */}
        <View className="bg-verde-claro rounded-full px-3 py-1 self-start mb-1">
          <Text className="text-xs font-semibold text-verde-institucional">
            {reporte.tipo_incidente}
          </Text>
        </View>

        {/* Fila inferior: domicilio + botón */}
        <View className="flex-row items-end justify-between">
          {reporte.domicilio ? (
            <View className="flex-row items-start flex-1 mr-2">
              <Ionicons name="location" size={14} color="#174A1A" style={{ marginTop: 1 }} />
              <Text style={{ fontSize: 11, color: '#6B7280', marginLeft: 4, flex: 1 }} numberOfLines={2}>
                {reporte.domicilio}
              </Text>
            </View>
          ) : (
            <View className="flex-1" />
          )}

          <TouchableOpacity
            onPress={onVerDetalles}
            activeOpacity={0.7}
            className="flex-row items-center rounded-lg px-3 py-2"
            style={{ borderWidth: 1, borderColor: '#174A1A' }}
          >
            <Text className="text-xs font-semibold text-verde-institucional">Ver detalles</Text>
            <Ionicons name="arrow-forward" size={14} color="#174A1A" style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

function calcularTiempoRelativo(fecha) {
  if (!fecha) return '';
  const ahora = new Date();
  const creado = new Date(fecha);
  const diffMs = ahora - creado;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHoras = Math.floor(diffMin / 60);
  const diffDias = Math.floor(diffHoras / 24);

  if (diffMin < 1) return 'Ahora';
  if (diffMin < 60) return `Hace ${diffMin} min`;
  if (diffHoras < 24) return `Hace ${diffHoras} horas`;
  if (diffDias === 1) return 'Ayer';
  if (diffDias < 7) return `Hace ${diffDias} días`;
  return formatearFecha(fecha);
}

function formatearFecha(fecha) {
  if (!fecha) return '';
  if (typeof fecha === 'string') {
    const partes = fecha.split('T')[0].split('-');
    if (partes.length === 3) {
      const [anio, mes, dia] = partes;
      return `${dia.padStart(2, '0')}/${mes.padStart(2, '0')}/${anio}`;
    }
  }
  const d = new Date(fecha);
  const dia = String(d.getDate()).padStart(2, '0');
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const anio = d.getFullYear();
  return `${dia}/${mes}/${anio}`;
}

function obtenerIcono(tipo) {
  const tipoLower = (tipo || '').toLowerCase();
  if (tipoLower.includes('robo') || tipoLower.includes('hurto') || tipoLower.includes('asalto')) return 'warning';
  if (tipoLower.includes('accidente')) return 'car-outline';
  if (tipoLower.includes('asesinato') || tipoLower.includes('homicidio')) return 'alert-circle';
  if (tipoLower.includes('violencia')) return 'hand-left-outline';
  return 'document-text-outline';
}

