import { comprimirImagen } from '../utils/comprimirImagen';
import { supabase } from './supabaseClient';

/**
 * Subir una evidencia: comprime la imagen, sube a Storage, e inserta en la tabla.
 * Convención de ruta: {id_reporte}/{orden}.jpg
 */
export async function subirEvidencia(idReporte, uri, orden) {
  // 1. Comprimir imagen
  const uriComprimida = await comprimirImagen(uri);

  // 2. Leer el archivo como blob para subirlo
  const response = await fetch(uriComprimida);
  const blob = await response.blob();

  // Convertir blob a ArrayBuffer para Supabase Storage
  const arrayBuffer = await new Response(blob).arrayBuffer();

  const rutaArchivo = `${idReporte}/${orden}.jpg`;

  // 3. Subir a Storage
  const { error: errorStorage } = await supabase.storage
    .from('evidencias-reportes')
    .upload(rutaArchivo, arrayBuffer, {
      contentType: 'image/jpeg',
      upsert: true,
    });

  if (errorStorage) throw new Error(`Error al subir imagen: ${errorStorage.message}`);

  // 4. Insertar registro en tabla evidencias
  const { data, error: errorInsert } = await supabase
    .from('evidencias')
    .insert({
      id_reporte: idReporte,
      ruta_archivo: rutaArchivo,
      orden: orden,
    })
    .select()
    .single();

  if (errorInsert) {
    // Si falla el insert, intentar eliminar la imagen subida
    await supabase.storage.from('evidencias-reportes').remove([rutaArchivo]);
    throw new Error(`Error al registrar evidencia: ${errorInsert.message}`);
  }

  return data;
}

/**
 * Eliminar una evidencia (imagen de Storage + registro de tabla).
 */
export async function eliminarEvidencia(idEvidencia, rutaArchivo) {
  // Eliminar de Storage
  await supabase.storage.from('evidencias-reportes').remove([rutaArchivo]);

  // Eliminar registro de la tabla
  const { error } = await supabase
    .from('evidencias')
    .delete()
    .eq('id_evidencia', idEvidencia);

  if (error) throw new Error(error.message);
}

/**
 * Obtener la URL pública de una evidencia.
 */
export function obtenerUrlPublica(rutaArchivo) {
  const { data } = supabase.storage
    .from('evidencias-reportes')
    .getPublicUrl(rutaArchivo);

  return data.publicUrl;
}
