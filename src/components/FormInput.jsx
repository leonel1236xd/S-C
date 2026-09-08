import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Input reutilizable con label, placeholder e ícono opcional.
 *
 * @param {Object} props
 * @param {string} props.label - Etiqueta del campo
 * @param {boolean} props.requerido - Si muestra asterisco rojo
 * @param {string} props.placeholder - Placeholder
 * @param {string} props.valor - Valor actual
 * @param {Function} props.onCambiar - Callback onChange
 * @param {string} props.icono - Nombre del ícono Ionicons (opcional)
 * @param {string} props.error - Mensaje de error (opcional)
 * @param {Object} props.inputProps - Props adicionales del TextInput
 */
export default function FormInput({
  label,
  requerido = false,
  placeholder,
  valor,
  onCambiar,
  icono,
  error,
  secureTextEntry = false,
  mostrarTogglePassword = false,
  onTogglePassword,
  ...inputProps
}) {
  return (
    <View className="mb-4">
      {label && (
        <Text className="text-sm font-semibold text-negro mb-1">
          {label} {requerido && <Text className="text-red-500">*</Text>}
        </Text>
      )}
      <View className={`bg-white rounded-xl border ${error ? 'border-red-500' : 'border-gray-300'} px-4 py-3 flex-row items-center`}>
        <TextInput
          value={valor}
          onChangeText={onCambiar}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          className="flex-1 text-sm text-negro"
          secureTextEntry={secureTextEntry}
          {...inputProps}
        />
        {mostrarTogglePassword ? (
          <Ionicons
            name={secureTextEntry ? 'eye-off-outline' : 'eye-outline'}
            size={20}
            color="#9CA3AF"
            onPress={onTogglePassword}
          />
        ) : icono ? (
          <Ionicons name={icono} size={20} color="#9CA3AF" />
        ) : null}
      </View>
      {error && (
        <Text className="text-xs text-red-500 mt-1">{error}</Text>
      )}
    </View>
  );
}
