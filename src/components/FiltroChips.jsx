import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity } from 'react-native';

/**
 * Chips de filtro horizontal.
 *
 * @param {Object} props
 * @param {Array<{label: string, valor: string, icono?: string}>} props.filtros - Lista de filtros
 * @param {string} props.seleccionado - Valor del filtro activo
 * @param {Function} props.onSeleccionar - Callback al seleccionar un filtro
 * @param {boolean} props.cargando - Si está cargando datos del filtro
 */
export default function FiltroChips({ filtros, seleccionado, onSeleccionar, cargando = false }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ flexGrow: 0, flexShrink: 0, height: 48, paddingLeft: 16, marginVertical: 8 }}
      contentContainerStyle={{ alignItems: 'center', gap: 10, paddingRight: 32 }}
    >
      {filtros.map((filtro) => {
        const activo = seleccionado === filtro.valor;
        const mostrandoCargando = activo && cargando;
        return (
          <TouchableOpacity
            key={filtro.valor || 'todos'}
            onPress={() => onSeleccionar(filtro.valor)}
            activeOpacity={0.7}
            className={`flex-row items-center rounded-xl px-4 py-2.5 ${
              activo ? 'bg-verde-institucional' : ''
            }`}
            style={[
              { minHeight: 38, flexShrink: 0 },
              !activo ? { backgroundColor: '#E6EFE6' } : undefined,
            ]}
          >
            {mostrandoCargando ? (
              <ActivityIndicator size="small" color={activo ? '#FFFFFF' : '#174A1A'} style={{ marginRight: 6 }} />
            ) : filtro.icono ? (
              <Ionicons
                name={filtro.icono}
                size={18}
                color={activo ? '#FFFFFF' : '#174A1A'}
                style={{ marginRight: 6 }}
              />
            ) : null}
            <Text className={`text-xs font-semibold ${activo ? 'text-white' : 'text-verde-institucional'}`}>
              {filtro.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

