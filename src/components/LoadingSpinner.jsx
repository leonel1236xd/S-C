import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';

/**
 * Indicador de carga centrado.
 *
 * @param {Object} props
 * @param {string} props.mensaje - Mensaje opcional debajo del spinner
 */
export default function LoadingSpinner({ mensaje }) {
  return (
    <View className="flex-1 items-center justify-center py-12">
      <ActivityIndicator size="large" color="#174A1A" />
      {mensaje && (
        <Text className="text-sm text-gris mt-3">{mensaje}</Text>
      )}
    </View>
  );
}
