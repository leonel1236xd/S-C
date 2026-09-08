import React from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Modal de confirmación (ej. dar de baja a un policía).
 *
 * @param {Object} props
 * @param {boolean} props.visible - Si el modal está visible
 * @param {string} props.titulo - Título del modal
 * @param {string} props.mensaje - Mensaje descriptivo
 * @param {string} props.textoConfirmar - Texto del botón de confirmar
 * @param {string} props.textoCancelar - Texto del botón de cancelar
 * @param {Function} props.onConfirmar - Callback al confirmar
 * @param {Function} props.onCancelar - Callback al cancelar
 * @param {boolean} props.peligroso - Si la acción es destructiva (rojo)
 */
export default function ConfirmModal({
  visible,
  titulo = '¿Estás seguro?',
  mensaje,
  textoConfirmar = 'Confirmar',
  textoCancelar = 'Cancelar',
  onConfirmar,
  onCancelar,
  peligroso = false,
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancelar}
    >
      <TouchableOpacity
        className="flex-1 bg-black/50 justify-center px-6"
        activeOpacity={1}
        onPress={onCancelar}
      >
        <View className="bg-white rounded-2xl p-6">
          <View className="items-center mb-4">
            <View className={`w-16 h-16 rounded-full items-center justify-center ${
              peligroso ? 'bg-red-50' : 'bg-verde-claro'
            }`}>
              <Ionicons
                name={peligroso ? 'warning-outline' : 'help-circle-outline'}
                size={32}
                color={peligroso ? '#DC2626' : '#174A1A'}
              />
            </View>
          </View>

          <Text className="text-lg font-bold text-center text-negro mb-2">{titulo}</Text>
          {mensaje && (
            <Text className="text-sm text-gris text-center mb-6">{mensaje}</Text>
          )}

          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={onCancelar}
              className="flex-1 border border-gray-300 rounded-xl py-3 items-center"
            >
              <Text className="text-sm font-medium text-gris">{textoCancelar}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onConfirmar}
              className={`flex-1 rounded-xl py-3 items-center ${
                peligroso ? 'bg-red-500' : 'bg-verde-institucional'
              }`}
            >
              <Text className="text-sm font-medium text-white">{textoConfirmar}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}
