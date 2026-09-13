import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, BackHandler, KeyboardAvoidingView, Modal, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BotonPrimario from '../../src/components/BotonPrimario';
import EvidenciaPicker from '../../src/components/EvidenciaPicker';
import FormDatePicker from '../../src/components/FormDatePicker';
import FormInput from '../../src/components/FormInput';
import FormSelect from '../../src/components/FormSelect';
import FormTimePicker from '../../src/components/FormTimePicker';
import LoadingSpinner from '../../src/components/LoadingSpinner';
import ModalReporteActualizado from '../../src/components/ModalReporteActualizado';
import { NACIONALIDADES, TIPOS_INCIDENTE } from '../../src/constants/theme';
import { useAuth } from '../../src/context/AuthContext';
import { eliminarEvidencia, obtenerUrlPublica, subirEvidencia } from '../../src/services/evidencias';
import { actualizarReporte, crearReporte, obtenerReportePorId } from '../../src/services/reportes';
import { supabase } from '../../src/services/supabaseClient';

export default function NuevoReporte() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const navigation = useNavigation();
  const scrollViewRef = useRef(null);
  const { usuario } = useAuth();
  const params = useLocalSearchParams();
  const modoEdicion = params.modoEdicion === 'true';
  const idReporte = params.idReporte;

  const [modalExitoVisible, setModalExitoVisible] = useState(false);
  const [datosActualizado, setDatosActualizado] = useState(null);
  const [evidenciasAEliminar, setEvidenciasAEliminar] = useState([]);
  const [modalAlmacenamientoVisible, setModalAlmacenamientoVisible] = useState(false);

  // Manejar el botón físico de retroceso (Android) para que vuelva a Inicio y no se salga de la app
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (modoEdicion && router.canGoBack()) {
          router.back();
        } else {
          router.replace('/(policia)');
        }
        return true;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [modoEdicion, router])
  );

  // Configurar botón de ir atrás en la barra superior para ir a Inicio
  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => {
            if (modoEdicion && router.canGoBack()) {
              router.back();
            } else {
              router.replace('/(policia)');
            }
          }}
          style={{ marginLeft: 0, marginRight: 15 }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, modoEdicion, router]);

  const [cargando, setCargando] = useState(false);
  const [cargandoDatos, setCargandoDatos] = useState(modoEdicion);
  const [errores, setErrores] = useState({});

  // Función helper para limpiar el error de un campo de forma reactiva
  const limpiarError = (campo) => {
    setErrores((prev) => {
      if (!prev[campo]) return prev;
      const nuevos = { ...prev };
      delete nuevos[campo];
      return nuevos;
    });
  };

  // Campos del delincuente
  const [apellidos, setApellidos] = useState('');
  const [nombres, setNombres] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState(null);
  const [nacionalidad, setNacionalidad] = useState('');
  const [ci, setCi] = useState('');
  const [edad, setEdad] = useState('');
  const [alias, setAlias] = useState('');
  const [especialidad, setEspecialidad] = useState('');
  const [domicilio, setDomicilio] = useState('');

  // Campos del incidente
  const [tipoIncidente, setTipoIncidente] = useState('');
  const [fechaIncidente, setFechaIncidente] = useState(null);
  const [horaIncidente, setHoraIncidente] = useState(null);
  const [descripcion, setDescripcion] = useState('');

  // Evidencias
  const [imagenes, setImagenes] = useState([]);

  // Cargar datos en modo edición
  useEffect(() => {
    if (modoEdicion && idReporte) {
      cargarReporte();
    }
  }, [modoEdicion, idReporte]);

  function parsearFechaLocal(fechaStr) {
    if (!fechaStr) return null;
    const partes = String(fechaStr).split('T')[0].split('-');
    if (partes.length === 3) {
      return new Date(parseInt(partes[0], 10), parseInt(partes[1], 10) - 1, parseInt(partes[2], 10));
    }
    return new Date(fechaStr);
  }

  async function cargarReporte() {
    try {
      setCargandoDatos(true);
      const reporte = await obtenerReportePorId(idReporte);
      setApellidos(reporte.apellidos || '');
      setNombres(reporte.nombres || '');
      setFechaNacimiento(parsearFechaLocal(reporte.fecha_nacimiento));
      setNacionalidad(reporte.nacionalidad || '');
      setCi(reporte.ci || '');
      setEdad(reporte.edad ? String(reporte.edad) : '');
      setAlias(reporte.alias || '');
      setEspecialidad(reporte.especialidad || '');
      setDomicilio(reporte.domicilio || '');
      setTipoIncidente(reporte.tipo_incidente || '');
      setFechaIncidente(parsearFechaLocal(reporte.fecha_incidente));
      setHoraIncidente(reporte.hora_incidente ? parsearHora(reporte.hora_incidente) : null);
      setDescripcion(reporte.descripcion_incidente || '');

      // Cargar evidencias existentes como imágenes con URL
      if (reporte.evidencias?.length) {
        const imgs = reporte.evidencias
          .sort((a, b) => a.orden - b.orden)
          .map((e) => ({
            uri: obtenerUrlPublica(e.ruta_archivo),
            existente: true,
            id_evidencia: e.id_evidencia,
            ruta_archivo: e.ruta_archivo,
            orden: e.orden,
          }));
        setImagenes(imgs);
      }
    } catch (err) {
      Alert.alert('Error', 'No se pudieron cargar los datos del reporte');
      router.back();
    } finally {
      setCargandoDatos(false);
    }
  }

  function parsearHora(horaStr) {
    const [h, m] = horaStr.split(':');
    const d = new Date();
    d.setHours(parseInt(h, 10), parseInt(m, 10), 0, 0);
    return d;
  }

  function formatearFechaISO(date) {
    if (!date) return null;
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  function formatearHoraISO(date) {
    if (!date) return null;
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:00`;
  }

  function validar() {
    const e = {};
    if (!apellidos.trim()) e.apellidos = 'Requerido';
    if (!nombres.trim()) e.nombres = 'Requerido';
    if (!fechaNacimiento) e.fechaNacimiento = 'Requerido';
    if (!nacionalidad) e.nacionalidad = 'Requerido';
    if (!edad.trim()) e.edad = 'Requerido';
    if (!especialidad.trim()) e.especialidad = 'Requerido';
    if (!tipoIncidente) e.tipoIncidente = 'Requerido';
    if (!fechaIncidente) e.fechaIncidente = 'Requerido';
    if (!horaIncidente) e.horaIncidente = 'Requerido';
    setErrores(e);
    return Object.keys(e).length === 0;
  }

  async function handleEnviar() {
    if (!validar()) return;

    try {
      setCargando(true);

      const datos = {
        apellidos: apellidos.trim(),
        nombres: nombres.trim(),
        fecha_nacimiento: formatearFechaISO(fechaNacimiento),
        nacionalidad: nacionalidad || null,
        ci: ci.trim() || null,
        edad: edad || null,
        alias: alias.trim() || null,
        especialidad: especialidad.trim() || null,
        domicilio: domicilio.trim() || null,
        tipo_incidente: tipoIncidente,
        fecha_incidente: formatearFechaISO(fechaIncidente),
        hora_incidente: formatearHoraISO(horaIncidente),
        descripcion_incidente: descripcion.trim() || null,
        id_usuario: usuario.id_usuario,
      };

      let reporte;
      if (modoEdicion) {
        reporte = await actualizarReporte(idReporte, datos);

        // 1. Obtener todas las evidencias registradas en BD para este reporte
        const { data: evidenciasBD } = await supabase
          .from('evidencias')
          .select('id_evidencia, ruta_archivo')
          .eq('id_reporte', idReporte);

        // 2. Determinar cuáles de las evidencias de la BD ya no están en la lista actual 'imagenes'
        if (evidenciasBD && evidenciasBD.length > 0) {
          const idsAConservar = imagenes
            .filter((img) => img.existente)
            .map((img) => img.id_evidencia);

          const evidenciasABorrar = evidenciasBD.filter(
            (e) => !idsAConservar.includes(e.id_evidencia)
          );

          for (const ev of evidenciasABorrar) {
            try {
              await eliminarEvidencia(ev.id_evidencia, ev.ruta_archivo);
            } catch (err) {
              console.error('Error al eliminar evidencia obsoleta:', err);
            }
          }
        }

        // 3. Subir nuevas evidencias (las que no son existentes)
        const nuevas = imagenes.filter((img) => !img.existente);
        const existentes = imagenes.filter((img) => img.existente);
        let orden = existentes.length + 1;
        let almacenamientoLlenoEdicion = false;
        for (const img of nuevas) {
          try {
            await subirEvidencia(idReporte, img.uri, orden);
            orden++;
          } catch (err) {
            if (err.esAlmacenamientoLleno) {
              almacenamientoLlenoEdicion = true;
              break;
            }
            throw err;
          }
        }
        if (almacenamientoLlenoEdicion) {
          setModalAlmacenamientoVisible(true);
          return;
        }
        setDatosActualizado({
          nombres: nombres.trim(),
          apellidos: apellidos.trim(),
          tipoIncidente,
        });
        setModalExitoVisible(true);
      } else {
        reporte = await crearReporte(datos);
        // Subir evidencias
        let almacenamientoLleno = false;
        for (let i = 0; i < imagenes.length; i++) {
          try {
            await subirEvidencia(reporte.id_reporte, imagenes[i].uri, i + 1);
          } catch (err) {
            if (err.esAlmacenamientoLleno) {
              almacenamientoLleno = true;
              break;
            }
            Alert.alert(
              'Error parcial',
              `La imagen ${i + 1} no se pudo subir: ${err.message}. El reporte fue creado pero revisa las evidencias.`
            );
          }
        }
        if (almacenamientoLleno) {
          setModalAlmacenamientoVisible(true);
          return;
        }
        router.replace({
          pathname: '/(policia-stack)/reporte-registrado',
          params: { numeroCaso: reporte.numero_caso },
        });
      }
    } catch (err) {
      Alert.alert('Error', err.message || 'No se pudo guardar el reporte');
    } finally {
      setCargando(false);
    }
  }

  if (cargandoDatos) {
    return (
      <View className="flex-1 bg-fondo">
        <LoadingSpinner mensaje="Cargando reporte..." />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 80}
      className="flex-1 bg-fondo"
    >
      <ScrollView
        ref={scrollViewRef}
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 140 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Datos del delincuente */}
        <FormInput
          label="Apellidos"
          requerido
          placeholder="Ej: Martinez Peredo"
          valor={apellidos}
          onCambiar={(val) => {
            setApellidos(val);
            if (val.trim()) limpiarError('apellidos');
          }}
          icono="person-outline"
          error={errores.apellidos}
        />

        <FormInput
          label="Nombres"
          requerido
          placeholder="Ej: Jose Roberto"
          valor={nombres}
          onCambiar={(val) => {
            setNombres(val);
            if (val.trim()) limpiarError('nombres');
          }}
          icono="person-outline"
          error={errores.nombres}
        />

        <View className="flex-row gap-3">
          <View className="flex-1">
            <FormDatePicker
              label="Fecha del nacimiento"
              requerido
              valor={fechaNacimiento}
              onCambiar={(val) => {
                setFechaNacimiento(val);
                if (val) limpiarError('fechaNacimiento');
              }}
              error={errores.fechaNacimiento}
            />
          </View>
          <View className="flex-1">
            <FormSelect
              label="Nacionalidad"
              requerido
              placeholder="Boliviano"
              valor={nacionalidad}
              opciones={NACIONALIDADES}
              onSeleccionar={(val) => {
                setNacionalidad(val);
                if (val) limpiarError('nacionalidad');
              }}
              error={errores.nacionalidad}
            />
          </View>
        </View>

        <View className="flex-row gap-3">
          <View className="flex-1">
            <FormInput
              label="C.I. / NIT"
              placeholder="Ej: 8896635"
              valor={ci}
              onCambiar={setCi}
              icono="card-outline"
              keyboardType="numeric"
            />
          </View>
          <View className="flex-1">
            <FormInput
              label="Edad"
              requerido
              placeholder="Ej: 32"
              valor={edad}
              onCambiar={(val) => {
                setEdad(val);
                if (val.trim()) limpiarError('edad');
              }}
              keyboardType="numeric"
              error={errores.edad}
              maxLength={3}
            />
          </View>
        </View>

        <FormInput
          label="Alias"
          placeholder="Ej: El chuños"
          valor={alias}
          onCambiar={setAlias}
        />

        <FormInput
          label="Especialidad"
          requerido
          placeholder="Ej: Cerrajero"
          valor={especialidad}
          onCambiar={(val) => {
            setEspecialidad(val);
            if (val.trim()) limpiarError('especialidad');
          }}
          icono="construct-outline"
          error={errores.especialidad}
        />

        <FormSelect
          label="Tipo de incidente"
          requerido
          placeholder="Seleccione un tipo"
          valor={tipoIncidente}
          opciones={TIPOS_INCIDENTE}
          onSeleccionar={(val) => {
            setTipoIncidente(val);
            if (val) limpiarError('tipoIncidente');
          }}
          error={errores.tipoIncidente}
        />

        <FormInput
          label="Domicilio"
          placeholder="Ej: Calle San Martin entre la Calle Brasil"
          valor={domicilio}
          onCambiar={setDomicilio}
          icono="location-outline"
        />

        <View className="flex-row gap-3">
          <View className="flex-1">
            <FormDatePicker
              label="Fecha del incidente"
              requerido
              valor={fechaIncidente}
              onCambiar={(val) => {
                setFechaIncidente(val);
                if (val) limpiarError('fechaIncidente');
              }}
              error={errores.fechaIncidente}
            />
          </View>
          <View className="flex-1">
            <FormTimePicker
              label="Hora del incidente"
              requerido
              valor={horaIncidente}
              onCambiar={(val) => {
                setHoraIncidente(val);
                if (val) limpiarError('horaIncidente');
              }}
              error={errores.horaIncidente}
            />
          </View>
        </View>

        <FormInput
          label="Descripcion del incidente"
          placeholder="Ingrese una descripcion ..."
          valor={descripcion}
          onCambiar={setDescripcion}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          onFocus={() => {
            setTimeout(() => {
              scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 120);
          }}
        />

        {/* Evidencias */}
        <View className="mb-6">
          <EvidenciaPicker
            imagenes={imagenes}
            onAgregar={(img) => {
              const nuevas = [...imagenes, img];
              setImagenes(nuevas);
            }}
            onEliminar={(index) => {
              const imgAEliminar = imagenes[index];
              if (imgAEliminar?.existente) {
                setEvidenciasAEliminar((prev) => [...prev, imgAEliminar]);
              }
              const nuevas = [...imagenes];
              nuevas.splice(index, 1);
              setImagenes(nuevas);
            }}
          />
        </View>

        {/* Botón enviar */}
        <BotonPrimario
          titulo={modoEdicion ? 'Guardar Cambios' : 'Enviar Denuncia'}
          onPresionar={handleEnviar}
          cargando={cargando}
        />
      </ScrollView>

      {/* Modal animado de confirmación al actualizar reporte */}
      <ModalReporteActualizado
        visible={modalExitoVisible}
        datosReporte={datosActualizado}
        onConfirmar={() => {
          setModalExitoVisible(false);
          router.back();
        }}
      />

      {/* Modal informativo: almacenamiento lleno */}
      <Modal
        visible={modalAlmacenamientoVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalAlmacenamientoVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 }}>
          <View style={{ backgroundColor: '#FFFFFF', borderRadius: 20, padding: 28, width: '100%', maxWidth: 360, alignItems: 'center' }}>
            {/* Icono */}
            <View style={{ backgroundColor: '#FFF3E0', borderRadius: 50, width: 72, height: 72, justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
              <Ionicons name="cloud-offline-outline" size={36} color="#E65100" />
            </View>

            {/* Título */}
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#1A1A2E', textAlign: 'center', marginBottom: 8 }}>
              Almacenamiento Lleno
            </Text>

            {/* Descripción */}
            <Text style={{ fontSize: 14, color: '#666', textAlign: 'center', lineHeight: 20, marginBottom: 6 }}>
              No se pueden subir más evidencias porque el almacenamiento de imágenes ha alcanzado su capacidad máxima.
            </Text>
            <Text style={{ fontSize: 14, color: '#666', textAlign: 'center', lineHeight: 20, marginBottom: 24 }}>
              El reporte fue registrado correctamente. Podrás seguir registrando reportes sin evidencias visuales.
            </Text>

            {/* Botón */}
            <TouchableOpacity
              onPress={() => {
                setModalAlmacenamientoVisible(false);
                if (modoEdicion) {
                  router.back();
                } else {
                  router.replace('/(policia)');
                }
              }}
              style={{
                backgroundColor: '#1A5632',
                borderRadius: 12,
                paddingVertical: 14,
                paddingHorizontal: 32,
                width: '100%',
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600' }}>
                Entendido
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}
