import { memo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AvatarUsuario from './AvatarUsuario';

/**
 * Tarjeta de policía para la lista del admin.
 *
 * @param {Object} props
 * @param {Object} props.policia - Datos del policía
 * @param {Function} props.onEditar - Callback al presionar editar
 * @param {Function} props.onDesactivar - Callback al presionar desactivar/activar
 * @param {boolean} props.esInactivo - Si el policía está en la pestaña de inactivos
 */
function PoliciaTarjeta({ policia, onEditar, onDesactivar, esInactivo = false }) {
  return (
    <View className="bg-white rounded-xl border-l-4 border-verde-institucional mx-4 mb-3 p-4 flex-row items-center">
      {/* Avatar */}
      <AvatarUsuario tamaño={50} />

      {/* Info */}
      <View className="flex-1 ml-3">
        <Text className="text-sm font-bold text-negro" numberOfLines={1}>
          {policia.nombres} {policia.apellidos}
        </Text>
        <View className="flex-row items-center mt-1">
          <Ionicons name="mail-outline" size={12} color="#6B7280" />
          <Text className="text-xs text-gris ml-1" numberOfLines={1}>
            {policia.correo}
          </Text>
        </View>
        {policia.tipo_policia && (
          <View className="flex-row items-center mt-1">
            <View className="bg-verde-claro rounded-full px-3 py-1 flex-row items-center">
              <Ionicons name="person-outline" size={12} color="#174A1A" />
              <Text className="text-xs text-verde-institucional font-medium ml-1">
                {policia.tipo_policia}
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Acciones */}
      <View className="flex-row gap-2">
        <TouchableOpacity
          onPress={onEditar}
          className="bg-verde-claro rounded-lg p-3"
        >
          <Ionicons name="create-outline" size={20} color="#174A1A" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onDesactivar}
          className={`rounded-lg p-3 ${esInactivo ? 'bg-verde-claro' : 'bg-red-50'}`}
        >
          <Ionicons
            name={esInactivo ? 'checkmark-circle-outline' : 'trash-outline'}
            size={20}
            color={esInactivo ? '#174A1A' : '#DC2626'}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default memo(PoliciaTarjeta);
