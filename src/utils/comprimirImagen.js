import * as ImageManipulator from 'expo-image-manipulator';

/**
 * Comprime y redimensiona una imagen antes de subirla a Storage.
 * - Ancho máximo 1024px (mantiene proporción)
 * - Calidad JPEG al 60%
 * Cada foto pesa ~100 KB, permitiendo ~10,000 imágenes en el plan gratuito.
 *
 * @param {string} uri - URI local de la imagen original
 * @returns {Promise<string>} URI de la imagen comprimida
 */
export async function comprimirImagen(uri) {
  const resultado = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 1024 } }],
    { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG }
  );
  return resultado.uri;
}
