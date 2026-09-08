import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';

/**
 * Selector de hora reutilizable.
 *
 * @param {Object} props
 * @param {string} props.label - Etiqueta
 * @param {boolean} props.requerido - Si muestra asterisco
 * @param {Date} props.valor - Hora seleccionada (como Date)
 * @param {Function} props.onCambiar - Callback con la hora
 * @param {string} props.error - Mensaje de error
 */
export default function FormTimePicker({
  label,
  requerido = false,
  valor,
  onCambiar,
  error,
}) {
  const [mostrar, setMostrar] = useState(false);

  function formatearHora(date) {
    if (!date) return '';
    const d = new Date(date);
    const horas = String(d.getHours()).padStart(2, '0');
    const minutos = String(d.getMinutes()).padStart(2, '0');
    return `${horas}:${minutos}`;
  }

  function handleChange(event, selectedDate) {
    setMostrar(Platform.OS === 'ios');
    if (selectedDate) {
      onCambiar(selectedDate);
    }
  }

  return (
    <View className="mb-4">
      {label && (
        <Text className="text-sm font-semibold text-negro mb-1">
          {label} {requerido && <Text className="text-red-500">*</Text>}
        </Text>
      )}
      <TouchableOpacity
        onPress={() => setMostrar(true)}
        className={`bg-white rounded-xl border ${error ? 'border-red-500' : 'border-gray-300'} px-4 py-3 flex-row items-center justify-between`}
      >
        <Text className={`text-sm ${valor ? 'text-negro' : 'text-gray-400'}`}>
          {valor ? formatearHora(valor) : 'HH:MM'}
        </Text>
        <Ionicons name="time-outline" size={20} color="#9CA3AF" />
      </TouchableOpacity>
      {error && (
        <Text className="text-xs text-red-500 mt-1">{error}</Text>
      )}

      {mostrar && (
        <DateTimePicker
          value={valor || new Date()}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleChange}
          is24Hour={true}
        />
      )}
    </View>
  );
}
