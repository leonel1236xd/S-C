import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';

/**
 * Botón primario amarillo (acción principal).
 *
 * @param {Object} props
 * @param {string} props.titulo - Texto del botón
 * @param {Function} props.onPresionar - Callback al presionar
 * @param {boolean} props.cargando - Si muestra spinner
 * @param {boolean} props.deshabilitado - Si está deshabilitado
 * @param {string} props.className - Clases adicionales
 */
export default function BotonPrimario({
  titulo,
  onPresionar,
  cargando = false,
  deshabilitado = false,
  className = '',
  textoClassName = '',
}) {
  const esBgOscuro = className.includes('bg-verde') || className.includes('bg-negro') || textoClassName.includes('text-white');
  const textColorClass = textoClassName || (esBgOscuro ? 'text-white' : 'text-verde-fuerte');

  return (
    <TouchableOpacity
      onPress={onPresionar}
      disabled={deshabilitado || cargando}
      className={`bg-amarillo rounded-xl py-4 items-center justify-center ${
        deshabilitado ? 'opacity-50' : ''
      } ${className}`}
      activeOpacity={0.8}
    >
      {cargando ? (
        <ActivityIndicator color={esBgOscuro ? '#FFFFFF' : '#162A0F'} />
      ) : (
        <Text className={`${textColorClass} text-base font-bold`}>{titulo}</Text>
      )}
    </TouchableOpacity>
  );
}

