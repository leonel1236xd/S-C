import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, ScrollView, Text, Alert, KeyboardAvoidingView, Platform, TouchableOpacity, BackHandler } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, useNavigation, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import FormInput from '../../../src/components/FormInput';
import FormSelect from '../../../src/components/FormSelect';
import BotonPrimario from '../../../src/components/BotonPrimario';
import LoadingSpinner from '../../../src/components/LoadingSpinner';
import { TIPOS_POLICIA } from '../../../src/constants/theme';
import { obtenerPoliciaPorId, actualizarPolicia } from '../../../src/services/usuarios';

export default function EditarPolicia() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const navigation = useNavigation();
  const scrollViewRef = useRef(null);
  const { id } = useLocalSearchParams();

  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [correo, setCorreo] = useState('');
  const [tipoPolicia, setTipoPolicia] = useState('');
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [errores, setErrores] = useState({});

  // Configurar flecha del header
  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/(admin)');
            }
          }}
          style={{ marginLeft: 0, marginRight: 15 }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, router]);

  // Manejar el botón físico de retroceso (Android)
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace('/(admin)');
        }
        return true;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [router])
  );

  useEffect(() => {
    cargarDatos();
  }, [id]);

  async function cargarDatos() {
    try {
      setCargando(true);
      const policia = await obtenerPoliciaPorId(id);
      setNombres(policia.nombres || '');
      setApellidos(policia.apellidos || '');
      setCorreo(policia.correo || '');
      setTipoPolicia(policia.tipo_policia || '');
    } catch (err) {
      Alert.alert('Error', 'No se pudieron cargar los datos');
      router.back();
    } finally {
      setCargando(false);
    }
  }

  function validar() {
    const e = {};
    if (!nombres.trim()) e.nombres = 'Requerido';
    if (!apellidos.trim()) e.apellidos = 'Requerido';
    if (!tipoPolicia) e.tipoPolicia = 'Requerido';
    setErrores(e);
    return Object.keys(e).length === 0;
  }

  async function handleGuardar() {
    if (!validar()) return;

    try {
      setGuardando(true);
      await actualizarPolicia(id, {
        nombres: nombres.trim(),
        apellidos: apellidos.trim(),
        tipo_policia: tipoPolicia,
      });

      Alert.alert('Éxito', 'Datos actualizados correctamente', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err) {
      Alert.alert('Error', err.message || 'No se pudieron guardar los cambios');
    } finally {
      setGuardando(false);
    }
  }

  if (cargando) {
    return (
      <View className="flex-1 bg-fondo">
        <LoadingSpinner mensaje="Cargando datos..." />
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
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 140 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-xl font-bold text-verde-institucional text-center mb-6">
          Editar Policía
        </Text>

        <FormInput
          label="Nombre(s)"
          requerido
          placeholder="Nombres"
          valor={nombres}
          onCambiar={setNombres}
          error={errores.nombres}
        />

        <FormInput
          label="Apellidos"
          requerido
          placeholder="Apellidos"
          valor={apellidos}
          onCambiar={setApellidos}
          error={errores.apellidos}
        />

        <FormInput
          label="Correo"
          placeholder="Correo electrónico"
          valor={correo}
          onCambiar={() => {}}
          editable={false}
        />
        <Text className="text-xs text-gris -mt-3 mb-4 ml-1">
          El correo no se puede modificar desde aquí
        </Text>

        <FormSelect
          label="Tipo de policia"
          requerido
          placeholder="Seleccione el tipo"
          valor={tipoPolicia}
          opciones={TIPOS_POLICIA}
          onSeleccionar={setTipoPolicia}
          error={errores.tipoPolicia}
        />

        <View className="mt-6">
          <BotonPrimario
            titulo="Guardar Cambios"
            onPresionar={handleGuardar}
            cargando={guardando}
            className="bg-verde-institucional"
            textoClassName="text-white"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

