import { supabase } from './supabaseClient';

/**
 * Obtener todos los reportes (feed de inicio) con paginación y búsqueda.
 */
export async function obtenerReportes({ busqueda, tiposIncidentes = [], limite = 10, desde = 0 } = {}) {
  let query = supabase
    .from('reportes')
    .select('*, evidencias(id_evidencia, ruta_archivo, orden), usuarios!id_usuario(nombres, apellidos, tipo_policia)')
    .order('created_at', { ascending: false })
    .range(desde, desde + limite - 1);

  if (tiposIncidentes && tiposIncidentes.length > 0) {
    query = query.in('tipo_incidente', tiposIncidentes);
  }

  if (busqueda) {
    query = query.or(
      `nombres.ilike.%${busqueda}%,apellidos.ilike.%${busqueda}%,tipo_incidente.ilike.%${busqueda}%`
    );
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
}

/**
 * Obtener reportes propios de un policía con paginación y búsqueda.
 */
export async function obtenerReportesPropios({ idUsuario, busqueda, tiposIncidentes = [], limite = 10, desde = 0 } = {}) {
  let query = supabase
    .from('reportes')
    .select('*, evidencias(id_evidencia, ruta_archivo, orden), usuarios!id_usuario(nombres, apellidos, tipo_policia)')
    .eq('id_usuario', idUsuario)
    .order('created_at', { ascending: false })
    .range(desde, desde + limite - 1);

  if (tiposIncidentes && tiposIncidentes.length > 0) {
    query = query.in('tipo_incidente', tiposIncidentes);
  }

  if (busqueda) {
    query = query.or(
      `nombres.ilike.%${busqueda}%,apellidos.ilike.%${busqueda}%,tipo_incidente.ilike.%${busqueda}%`
    );
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
}

/**
 * Obtener un reporte por su ID, incluyendo evidencias y datos del policía.
 */
export async function obtenerReportePorId(idReporte) {
  const { data, error } = await supabase
    .from('reportes')
    .select('*, evidencias(id_evidencia, ruta_archivo, orden), usuarios!id_usuario(nombres, apellidos, tipo_policia)')
    .eq('id_reporte', idReporte)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Crear un nuevo reporte.
 * No envía numero_caso — lo genera el trigger de Postgres.
 */
export async function crearReporte(datos) {
  const { data, error } = await supabase
    .from('reportes')
    .insert({
      nombres: datos.nombres,
      apellidos: datos.apellidos,
      fecha_nacimiento: datos.fecha_nacimiento || null,
      nacionalidad: datos.nacionalidad || null,
      ci: datos.ci || null,
      edad: datos.edad ? parseInt(datos.edad, 10) : null,
      alias: datos.alias || null,
      especialidad: datos.especialidad || null,
      domicilio: datos.domicilio || null,
      tipo_incidente: datos.tipo_incidente,
      fecha_incidente: datos.fecha_incidente,
      hora_incidente: datos.hora_incidente || null,
      descripcion_incidente: datos.descripcion_incidente || null,
      id_usuario: datos.id_usuario,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Actualizar un reporte existente (solo el dueño, reforzado por RLS).
 */
export async function actualizarReporte(idReporte, datos) {
  const camposActualizables = {};
  const campos = [
    'nombres', 'apellidos', 'fecha_nacimiento', 'nacionalidad',
    'ci', 'edad', 'alias', 'especialidad', 'domicilio',
    'tipo_incidente', 'fecha_incidente', 'hora_incidente', 'descripcion_incidente',
  ];

  campos.forEach((campo) => {
    if (datos[campo] !== undefined) {
      camposActualizables[campo] = datos[campo] === '' ? null : datos[campo];
    }
  });

  if (camposActualizables.edad) {
    camposActualizables.edad = parseInt(camposActualizables.edad, 10);
  }

  const { data, error } = await supabase
    .from('reportes')
    .update(camposActualizables)
    .eq('id_reporte', idReporte)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Obtener estadísticas de reportes propios para el historial.
 * Total, pendientes (nunca editados) y modificados.
 */
export async function obtenerEstadisticasPropias(idUsuario) {
  const { data, error } = await supabase
    .from('reportes')
    .select('id_reporte, created_at, updated_at, fecha_incidente')
    .eq('id_usuario', idUsuario);

  if (error) throw new Error(error.message);

  const ahora = new Date();
  const mesActual = ahora.getMonth();
  const anioActual = ahora.getFullYear();

  const total = data.length;
  const modificadas = data.filter(
    (r) => new Date(r.updated_at).getTime() > new Date(r.created_at).getTime() + 1000
  ).length;
  const esteMes = data.filter((r) => {
    const fechaStr = r.fecha_incidente || r.created_at;
    if (!fechaStr) return false;
    const partes = String(fechaStr).split('T')[0].split('-');
    if (partes.length === 3) {
      const anio = parseInt(partes[0], 10);
      const mes = parseInt(partes[1], 10) - 1; // 0-indexed
      return mes === mesActual && anio === anioActual;
    }
    const f = new Date(fechaStr);
    return f.getMonth() === mesActual && f.getFullYear() === anioActual;
  }).length;

  return { total, esteMes, modificadas };
}
