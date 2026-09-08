import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';

/**
 * Botón secundario con borde (acciones secundarias).
 *
 * @param {Object} props
 * @param {string} props.titulo - Texto del botón
 * @param {Function} props.onPresionar - Callback al presionar
 * @param {boolean} props.cargando - Si muestra spinner
 * @param {string} props.className - Clases adicionales
 */
export default function BotonSecundario({
  titulo,
  onPresionar,
  cargando = false,
  className = '',
}) {
  return (
    <TouchableOpacity
      onPress={onPresionar}
      disabled={cargando}
      className={`border-2 border-amarillo rounded-xl py-4 items-center justify-center ${className}`}
      activeOpacity={0.8}
    >
      {cargando ? (
        <ActivityIndicator color="#FFD100" />
      ) : (
        <Text className="text-amarillo text-base font-bold">{titulo}</Text>
      )}
    </TouchableOpacity>
  );
}
