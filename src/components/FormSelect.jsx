import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Selector dropdown reutilizable.
 *
 * @param {Object} props
 * @param {string} props.label - Etiqueta del campo
 * @param {boolean} props.requerido - Si muestra asterisco rojo
 * @param {string} props.placeholder - Placeholder
 * @param {string} props.valor - Valor seleccionado
 * @param {Array<string>} props.opciones - Lista de opciones
 * @param {Function} props.onSeleccionar - Callback al seleccionar
 * @param {string} props.error - Mensaje de error
 */
export default function FormSelect({
  label,
  requerido = false,
  placeholder = 'Seleccione una opción',
  valor,
  opciones = [],
  onSeleccionar,
  error,
}) {
  const [visible, setVisible] = useState(false);

  return (
    <View className="mb-4">
      {label && (
        <Text className="text-sm font-semibold text-negro mb-1">
          {label} {requerido && <Text className="text-red-500">*</Text>}
        </Text>
      )}
      <TouchableOpacity
        onPress={() => setVisible(true)}
        className={`bg-white rounded-xl border ${error ? 'border-red-500' : 'border-gray-300'} px-4 py-3 flex-row items-center justify-between`}
      >
        <Text className={`text-sm ${valor ? 'text-negro' : 'text-gray-400'}`}>
          {valor || placeholder}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
      </TouchableOpacity>
      {error && (
        <Text className="text-xs text-red-500 mt-1">{error}</Text>
      )}

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/50 justify-center px-6"
          activeOpacity={1}
          onPress={() => setVisible(false)}
        >
          <View className="bg-white rounded-2xl max-h-96 overflow-hidden">
            <View className="px-4 py-3 border-b border-gray-200">
              <Text className="text-base font-bold text-verde-institucional">{label || 'Seleccionar'}</Text>
            </View>
            <FlatList
              data={opciones}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    onSeleccionar(item);
                    setVisible(false);
                  }}
                  className={`px-4 py-3 border-b border-gray-100 ${
                    valor === item ? 'bg-verde-claro' : ''
                  }`}
                >
                  <Text className={`text-sm ${valor === item ? 'text-verde-institucional font-semibold' : 'text-negro'}`}>
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
