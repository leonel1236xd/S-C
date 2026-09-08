import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Avatar circular genérico con ícono de persona.
 * Matching el diseño de los mockups.
 *
 * @param {Object} props
 * @param {number} props.tamaño - Tamaño del avatar en píxeles (default 80)
 */
export default function AvatarUsuario({ tamaño = 80 }) {
  const iconSize = tamaño * 0.5;

  return (
    <View
      className="bg-verde-institucional rounded-full items-center justify-center"
      style={{ width: tamaño, height: tamaño }}
    >
      <View
        className="border-2 border-white rounded-full items-center justify-center"
        style={{ width: tamaño - 4, height: tamaño - 4 }}
      >
        <Ionicons name="person-outline" size={iconSize} color="#FFFFFF" />
      </View>
    </View>
  );
}
