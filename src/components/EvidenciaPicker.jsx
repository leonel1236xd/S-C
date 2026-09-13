import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Alert, Text, TouchableOpacity, View } from 'react-native';

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
        Evidencia visual
      </Text>
      <View className="flex-row flex-wrap gap-3">
        {imagenes.map((img, index) => (
          <View
            key={index}
            style={{ width: 96, height: 96, position: 'relative' }}
          >
            <Image
              source={{ uri: img.uri }}
              style={{ width: 96, height: 96, borderRadius: 8 }}
              contentFit="cover"
            />
            <TouchableOpacity
              onPress={() => onEliminar(index)}
              style={{
                position: 'absolute',
                top: -6,
                right: -6,
                backgroundColor: '#EF4444',
                borderRadius: 12,
                width: 24,
                height: 24,
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10,
                elevation: 3,
              }}
            >
              <Ionicons name="close" size={14} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        ))}

        {puedeAgregar && (
          <TouchableOpacity
            onPress={seleccionarImagen}
            style={{
              width: 96,
              height: 96,
              borderRadius: 8,
              borderWidth: 2,
              borderStyle: 'dashed',
              borderColor: 'rgba(23,74,26,0.5)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="cloud-upload-outline" size={28} color="#174A1A" />
            <Text className="text-xs text-verde-institucional mt-1">Agregar</Text>
          </TouchableOpacity>
        )}
      </View>
      <Text className="text-sm font-normal text-negro mt-3">
        {`${imagenes.length}/3 imágenes adjuntas (Máximo 3)`}
      </Text>
    </View>
  );
}
