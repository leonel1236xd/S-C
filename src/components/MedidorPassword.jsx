import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Medidor de fortaleza de contraseña interactivo con barra de color y checklist de requisitos.
 *
 * @param {Object} props
 * @param {string} props.password - Contraseña actual ingresada
 */
export default function MedidorPassword({ password = '' }) {
  if (!password) return null;

  const tieneLongitud = password.length >= 8;
  const tieneMayuscula = /[A-Z]/.test(password);
  const tieneNumero = /[0-9]/.test(password);
  const tieneSimbolo = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  const requisitos = [
    { label: '8+ caracteres', cumplido: tieneLongitud },
    { label: 'Mayúscula (A-Z)', cumplido: tieneMayuscula },
    { label: 'Número (0-9)', cumplido: tieneNumero },
    { label: 'Símbolo (!@#...)', cumplido: tieneSimbolo },
  ];

  const cumplidos = requisitos.filter((r) => r.cumplido).length;

  let nivelInfo = {
    texto: 'Muy Débil',
    colorBarra: 'bg-red-500',
    colorTexto: 'text-red-600',
    ancho: 'w-1/4',
  };

  if (cumplidos === 2) {
    nivelInfo = {
      texto: 'Regular',
      colorBarra: 'bg-amber-500',
      colorTexto: 'text-amber-600',
      ancho: 'w-2/4',
    };
  } else if (cumplidos === 3) {
    nivelInfo = {
      texto: 'Buena',
      colorBarra: 'bg-lime-500',
      colorTexto: 'text-lime-600',
      ancho: 'w-3/4',
    };
  } else if (cumplidos === 4) {
    nivelInfo = {
      texto: 'Muy Segura',
      colorBarra: 'bg-emerald-600',
      colorTexto: 'text-emerald-600',
      ancho: 'w-full',
    };
  }

  return (
    <View className="mb-4 mt-1 bg-white p-3.5 rounded-2xl border border-gray-200">
      {/* Encabezado y nivel */}
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-xs font-bold text-gray-600 uppercase tracking-wider">
          Seguridad de Contraseña
        </Text>
        <Text className={`text-xs font-extrabold ${nivelInfo.colorTexto}`}>
          {nivelInfo.texto}
        </Text>
      </View>

      {/* Barra de progreso de color */}
      <View className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-3">
        <View className={`h-full ${nivelInfo.colorBarra} ${nivelInfo.ancho} transition-all duration-300`} />
      </View>

      {/* Requisitos individuales */}
      <View className="flex-row flex-wrap gap-2">
        {requisitos.map((req, index) => (
          <View
            key={index}
            className={`flex-row items-center px-2.5 py-1 rounded-lg border ${
              req.cumplido
                ? 'bg-emerald-50 border-emerald-300'
                : 'bg-gray-50 border-gray-200'
            }`}
          >
            <Ionicons
              name={req.cumplido ? 'checkmark-circle' : 'ellipse-outline'}
              size={13}
              color={req.cumplido ? '#059669' : '#9CA3AF'}
              style={{ marginRight: 4 }}
            />
            <Text
              className={`text-[11px] font-semibold ${
                req.cumplido ? 'text-emerald-800' : 'text-gray-400'
              }`}
            >
              {req.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
