// Paleta de colores del proyecto SafeCity
// Usar estos valores para estilos programáticos fuera de NativeWind

export const COLORS = {
  verdeInstitucional: '#174A1A',
  amarillo: '#FFD100',
  fondo: '#D9D9D9',
  verdeFuerte: '#162A0F',
  verdeClaro: '#E8F2E3',
  blanco: '#FFFFFF',
  negro: '#000000',
  rojo: '#DC2626',
  gris: '#6B7280',
  grisClaro: '#9CA3AF',
};

export const TIPOS_POLICIA = [
  'General',
  'Coronel',
  'Teniente Coronel',
  'Mayor',
  'Capitán',
  'Teniente',
  'Subteniente',
  'Sargento Primero',
  'Sargento Segundo',
  'Cabo',
  'Policía',
];

export const TIPOS_INCIDENTE = [
  'Robo',
  'Robo agravado',
  'Hurto',
  'Asalto',
  'Asesinato',
  'Homicidio',
  'Violencia',
  'Disturbio público',
  'Accidente',
  'Narcotráfico',
  'Extorsión',
  'Secuestro',
  'Estafa',
  'Vandalismo',
  'Otros',
];

export const INCIDENTES_CON_ICONOS = [
  { nombre: 'Robo', icono: 'warning-outline' },
  { nombre: 'Robo agravado', icono: 'flash-outline' },
  { nombre: 'Hurto', icono: 'briefcase-outline' },
  { nombre: 'Asalto', icono: 'hand-left-outline' },
  { nombre: 'Asesinato', icono: 'skull-outline' },
  { nombre: 'Homicidio', icono: 'alert-circle-outline' },
  { nombre: 'Violencia', icono: 'fitness-outline' },
  { nombre: 'Disturbio público', icono: 'megaphone-outline' },
  { nombre: 'Accidente', icono: 'car-outline' },
  { nombre: 'Narcotráfico', icono: 'flask-outline' },
  { nombre: 'Extorsión', icono: 'cash-outline' },
  { nombre: 'Secuestro', icono: 'lock-closed-outline' },
  { nombre: 'Estafa', icono: 'card-outline' },
  { nombre: 'Vandalismo', icono: 'hammer-outline' },
  { nombre: 'Otros', icono: 'help-circle-outline' },
];

export const NACIONALIDADES = [
  'Boliviano',
  'Argentino',
  'Brasileño',
  'Chileno',
  'Colombiano',
  'Ecuatoriano',
  'Paraguayo',
  'Peruano',
  'Uruguayo',
  'Venezolano',
  'Otro',
];

/**
 * Obtener un ícono de Ionicons claro e identificativo según el tipo de incidente/delito.
 * @param {string} tipo
 * @returns {string} Nombre del icono en Ionicons
 */
export function obtenerIconoIncidente(tipo) {
  if (!tipo) return 'shield-outline';
  const t = tipo.toLowerCase().trim();

  if (t.includes('robo agravado')) return 'flash';
  if (t.includes('robo') || t.includes('hurto')) return 'warning';
  if (t.includes('asalto')) return 'hand-left';
  if (t.includes('asesinato') || t.includes('homicidio')) return 'skull';
  if (t.includes('violencia') || t.includes('agresion')) return 'fitness';
  if (t.includes('disturbio')) return 'megaphone';
  if (t.includes('accidente') || t.includes('choque')) return 'car';
  if (t.includes('narcotrafico') || t.includes('droga')) return 'flask';
  if (t.includes('extorsion') || t.includes('chantaje')) return 'cash';
  if (t.includes('secuestro')) return 'lock-closed';
  if (t.includes('estafa') || t.includes('fraude')) return 'card';
  if (t.includes('vandalismo') || t.includes('daño')) return 'hammer';

  const encontrado = INCIDENTES_CON_ICONOS.find(
    (item) => item.nombre.toLowerCase() === t
  );
  if (encontrado) {
    return encontrado.icono.replace('-outline', '');
  }

  return 'document-text';
}

