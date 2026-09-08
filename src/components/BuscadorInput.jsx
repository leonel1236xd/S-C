import React from 'react';
import { View, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Input de búsqueda con ícono de lupa.
 *
 * @param {Object} props
 * @param {string} props.valor - Valor actual del input
 * @param {Function} props.onCambiar - Callback al cambiar texto
 * @param {string} props.placeholder - Placeholder del input
 */
export default function BuscadorInput({ valor, onCambiar, placeholder = 'Buscar por nombre ...' }) {
  return (
    <View className="bg-white rounded-xl border border-gray-300 mx-4 mb-3 px-4 py-3 flex-row items-center">
      <Ionicons name="search-outline" size={20} color="#9CA3AF" />
      <TextInput
        value={valor}
        onChangeText={onCambiar}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        className="flex-1 ml-3 text-sm text-negro"
        returnKeyType="search"
      />
    </View>
  );
}
