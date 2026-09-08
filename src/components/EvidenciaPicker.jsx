import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

/**
 * Selector de hasta 3 imágenes de evidencia con preview.
 * No llama a Supabase — solo maneja la selección local.
 *
 * @param {Object} props
 * @param {Array<{uri: string}>} props.imagenes - Lista actual de imágenes seleccionadas
 * @param {Function} props.onAgregar - Callback con la nueva imagen {uri}
 * @param {Function} props.onEliminar - Callback con el índice a eliminar
 */
export default function EvidenciaPicker({ imagenes = [], onAgregar, onEliminar }) {
  const puedeAgregar = imagenes.length < 3;

  async function seleccionarImagen() {
    Alert.alert(
      'Agregar evidencia',
      '¿De dónde deseas obtener la imagen?',
      [
        {
          text: 'Cámara',
          onPress: async () => {
            const permiso = await ImagePicker.requestCameraPermissionsAsync();
            if (!permiso.granted) {
              Alert.alert('Permiso denegado', 'Se necesita acceso a la cámara.');
              return;
            }
            const resultado = await ImagePicker.launchCameraAsync({
              mediaTypes: ['images'],
              quality: 1,
            });
            if (!resultado.canceled && resultado.assets?.[0]) {
              onAgregar({ uri: resultado.assets[0].uri });
            }
          },
        },
        {
          text: 'Galería',
          onPress: async () => {
            const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permiso.granted) {
              Alert.alert('Permiso denegado', 'Se necesita acceso a la galería.');
              return;
            }
            const resultado = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ['images'],
              quality: 1,
            });
            if (!resultado.canceled && resultado.assets?.[0]) {
              onAgregar({ uri: resultado.assets[0].uri });
            }
          },
        },
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  }

  return (
    <View>
      <Text className="text-sm font-semibold text-negro mb-2">
        Evidencia visual <Text className="text-red-500">*</Text>
      </Text>
      <View className="flex-row flex-wrap gap-3">
        {imagenes.map((img, index) => (
          <View key={index} style={{ width: 96, height: 96, position: 'relative' }}>
            <Image
              source={{ uri: img.uri }}
              style={{ width: 96, height: 96, borderRadius: 12 }}
              contentFit="cover"
            />
            <TouchableOpacity
              onPress={() => onEliminar(index)}
              className="absolute -top-2 -right-2 bg-red-500 rounded-full w-6 h-6 items-center justify-center shadow-sm"
              style={{ zIndex: 10 }}
            >
              <Ionicons name="close" size={14} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        ))}

        {puedeAgregar && (
          <TouchableOpacity
            onPress={seleccionarImagen}
            style={{ width: 96, height: 96 }}
            className="rounded-xl border-2 border-dashed border-verde-institucional/50 items-center justify-center bg-verde-claro/30"
          >
            <Ionicons name="cloud-upload-outline" size={28} color="#174A1A" />
            <Text className="text-xs text-verde-institucional font-medium mt-1">Agregar</Text>
          </TouchableOpacity>
        )}
      </View>
      <Text className="text-xs text-gris mt-1.5">
        {imagenes.length}/3 imágenes adjuntas (Máximo 3)
      </Text>
    </View>
  );
}

