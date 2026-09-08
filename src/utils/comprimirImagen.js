import * as ImageManipulator from 'expo-image-manipulator';

/**
 * Comprime y redimensiona una imagen antes de subirla a Storage.
 * - Ancho máximo 1280px (mantiene proporción)
 * - Calidad JPEG al 70%
 * Reduce drásticamente el tamaño respecto a la foto original de la cámara.
 *
 * @param {string} uri - URI local de la imagen original
 * @returns {Promise<string>} URI de la imagen comprimida
 */
export async function comprimirImagen(uri) {
  const resultado = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 1280 } }],
    { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
  );
  return resultado.uri;
}
