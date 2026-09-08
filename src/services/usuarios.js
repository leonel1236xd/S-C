import { supabase } from './supabaseClient';

/**
 * Obtener lista de policías filtrada por estado activo/inactivo.
 */
export async function obtenerPolicias({ activo = true } = {}) {
  const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('rol', 'POLICIA')
    .eq('activo', activo)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Obtener un policía por su ID.
 */
export async function obtenerPoliciaPorId(idUsuario) {
  const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('id_usuario', idUsuario)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Actualizar datos de un policía (UPDATE directo, cubierto por RLS admin).
 */
export async function actualizarPolicia(idUsuario, datos) {
  const camposActualizables = {};

  if (datos.nombres !== undefined) camposActualizables.nombres = datos.nombres;
  if (datos.apellidos !== undefined) camposActualizables.apellidos = datos.apellidos;
  if (datos.tipo_policia !== undefined) camposActualizables.tipo_policia = datos.tipo_policia;

  const { data, error } = await supabase
    .from('usuarios')
    .update(camposActualizables)
    .eq('id_usuario', idUsuario)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Desactivar un policía (dar de baja). No se borra, solo se marca inactivo.
 */
export async function desactivarPolicia(idUsuario) {
  const { data, error } = await supabase
    .from('usuarios')
    .update({ activo: false })
    .eq('id_usuario', idUsuario)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Reactivar un policía.
 */
export async function activarPolicia(idUsuario) {
  const { data, error } = await supabase
    .from('usuarios')
    .update({ activo: true })
    .eq('id_usuario', idUsuario)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Crear un nuevo policía invocando la Edge Function (nunca INSERT directo).
 * La Edge Function retorna el error en el body JSON, pero supabase.functions.invoke
 * lo envuelve en un FunctionsHttpError genérico. Hay que leer el body real.
 */
export async function crearPolicia({ nombres, apellidos, correo, password, tipo_policia }) {
  const { data, error } = await supabase.functions.invoke('crear-policia', {
    body: { nombres, apellidos, correo, password, tipo_policia },
  });

  if (error) {
    // Intentar extraer el mensaje real del body de la respuesta
    let mensajeError = error.message;
    try {
      // FunctionsHttpError tiene la respuesta en error.context
      if (error.context && typeof error.context.json === 'function') {
        const body = await error.context.json();
        if (body?.error) mensajeError = body.error;
      }
    } catch {
      // Si no se puede leer el body, usar el mensaje genérico
    }
    throw new Error(mensajeError);
  }

  if (data?.error) throw new Error(data.error);
  return data;
}

