import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';

/**
 * Selector de fecha reutilizable.
 *
 * @param {Object} props
 * @param {string} props.label - Etiqueta
 * @param {boolean} props.requerido - Si muestra asterisco
 * @param {Date} props.valor - Fecha seleccionada
 * @param {Function} props.onCambiar - Callback con la fecha
 * @param {Date} props.maximumDate - Fecha máxima
 * @param {string} props.error - Mensaje de error
 */
export default function FormDatePicker({
  label,
  requerido = false,
  valor,
  onCambiar,
  maximumDate = new Date(),
  error,
}) {
  const [mostrar, setMostrar] = useState(false);

  function formatearFecha(date) {
    if (!date) return '';
    const d = new Date(date);
    const dia = String(d.getDate()).padStart(2, '0');
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const anio = d.getFullYear();
    return `${dia}/${mes}/${anio}`;
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
          {valor ? formatearFecha(valor) : 'DD/MM/AAAA'}
        </Text>
        <Ionicons name="calendar-outline" size={20} color="#9CA3AF" />
      </TouchableOpacity>
      {error && (
        <Text className="text-xs text-red-500 mt-1">{error}</Text>
      )}

      {mostrar && (
        <DateTimePicker
          value={valor || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          maximumDate={maximumDate}
          onChange={handleChange}
        />
      )}
    </View>
  );
}
