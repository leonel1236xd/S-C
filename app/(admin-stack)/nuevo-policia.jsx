import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, ScrollView, Text, Alert, KeyboardAvoidingView, Platform, TouchableOpacity, BackHandler } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useNavigation, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import FormInput from '../../src/components/FormInput';
import FormSelect from '../../src/components/FormSelect';
import BotonPrimario from '../../src/components/BotonPrimario';
import MedidorPassword from '../../src/components/MedidorPassword';
import ModalPoliciaCreado from '../../src/components/ModalPoliciaCreado';
import { TIPOS_POLICIA } from '../../src/constants/theme';
import { crearPolicia } from '../../src/services/usuarios';

export default function NuevoPolicia() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const navigation = useNavigation();
  const scrollViewRef = useRef(null);

  const [nombres, setNombres] = useState('');
  const [apellidoPaterno, setApellidoPaterno] = useState('');
  const [apellidoMaterno, setApellidoMaterno] = useState('');
  const [correo, setCorreo] = useState('');
  const [tipoPolicia, setTipoPolicia] = useState('');
  const [password, setPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [errores, setErrores] = useState({});

  const limpiarError = (campo) => {
    setErrores((prev) => {
      if (!prev[campo]) return prev;
      const nuevos = { ...prev };
      delete nuevos[campo];
      return nuevos;
    });
  };

  // Modal de Éxito
  const [modalExitoVisible, setModalExitoVisible] = useState(false);
  const [datosCreado, setDatosCreado] = useState(null);
  const [errorGeneral, setErrorGeneral] = useState('');

  function traducirErrorUsuario(errorRaw) {
    if (!errorRaw) return 'Error al registrar el policía';
    const msg = String(errorRaw);
    if (
      msg.includes('already been registered') ||
      msg.includes('already registered') ||
      msg.includes('email_exists')
    ) {
      return 'El correo electrónico ya se encuentra registrado en el sistema. Por favor, utilice uno diferente.';
    }
    if (msg.includes('Password should be at least')) {
      return 'La contraseña debe tener al menos 6 caracteres.';
    }
    if (msg.includes('invalid_email') || msg.includes('Invalid email')) {
      return 'El formato del correo electrónico es inválido.';
    }
    return msg.replace(/^Error al crear cuenta:\s*/i, '').replace(/^Error:\s*/i, '');
  }

  // Configurar flecha del header para volver al inicio del Admin
  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => router.replace('/(admin)')}
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
        router.replace('/(admin)');
        return true;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [router])
  );

  function validar() {
    const e = {};
    if (!nombres.trim()) e.nombres = 'Requerido';
    if (!apellidoPaterno.trim()) e.apellidoPaterno = 'Requerido';
    if (!apellidoMaterno.trim()) e.apellidoMaterno = 'Requerido';
    if (!correo.trim()) e.correo = 'Requerido';
    else if (!/\S+@\S+\.\S+/.test(correo)) e.correo = 'Correo inválido';
    if (!tipoPolicia) e.tipoPolicia = 'Requerido';
    if (!password) e.password = 'Requerido';
    else if (password.length < 6) e.password = 'Mínimo 6 caracteres';
    if (!confirmarPassword) e.confirmarPassword = 'Requerido';
    else if (password !== confirmarPassword) e.confirmarPassword = 'Las contraseñas no coinciden';
    setErrores(e);
    return Object.keys(e).length === 0;
  }

  async function handleRegistrar() {
    setErrorGeneral('');
    if (!validar()) return;

    try {
      setCargando(true);
      const apellidos = `${apellidoPaterno.trim()} ${apellidoMaterno.trim()}`;

      await crearPolicia({
        nombres: nombres.trim(),
        apellidos,
        correo: correo.trim().toLowerCase(),
        password,
        tipo_policia: tipoPolicia,
      });

      // Guardar datos para el modal animado de éxito
      setDatosCreado({
        nombres: nombres.trim(),
        apellidos,
        correo: correo.trim().toLowerCase(),
        tipoPolicia,
      });
      setModalExitoVisible(true);
    } catch (err) {
      const msgTraducido = traducirErrorUsuario(err.message);
      setErrorGeneral(msgTraducido);
      if (err.message && (err.message.includes('registered') || err.message.includes('email'))) {
        setErrores((prev) => ({ ...prev, correo: msgTraducido }));
      }
    } finally {
      setCargando(false);
    }
  }

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 200);
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 450);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-fondo"
    >
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 280 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-xl font-bold text-verde-institucional text-center mb-6">
          Nuevo Policía
        </Text>

        {/* Mensaje de Error Banner */}
        {errorGeneral ? (
          <View className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3.5 mb-5 flex-row items-center">
            <Ionicons name="alert-circle" size={20} color="#DC2626" style={{ marginRight: 10 }} />
            <Text className="text-red-700 text-xs font-semibold flex-1 leading-5">
              {errorGeneral}
            </Text>
            <TouchableOpacity
              onPress={() => setErrorGeneral('')}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close-circle" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        ) : null}

        <FormInput
          label="Nombre(s)"
          requerido
          placeholder="Ej: Juan Carlos"
          valor={nombres}
          onCambiar={(val) => {
            setNombres(val);
            if (val.trim()) limpiarError('nombres');
          }}
          error={errores.nombres}
        />

        <View className="flex-row gap-3">
          <View className="flex-1">
            <FormInput
              label="Apellido Paterno"
              requerido
              placeholder="Ej: Peredo"
              valor={apellidoPaterno}
              onCambiar={(val) => {
                setApellidoPaterno(val);
                if (val.trim()) limpiarError('apellidoPaterno');
              }}
              error={errores.apellidoPaterno}
            />
          </View>
          <View className="flex-1">
            <FormInput
              label="Apellido Materno"
              requerido
              placeholder="Ej: Ramirez"
              valor={apellidoMaterno}
              onCambiar={(val) => {
                setApellidoMaterno(val);
                if (val.trim()) limpiarError('apellidoMaterno');
              }}
              error={errores.apellidoMaterno}
            />
          </View>
        </View>

        <FormInput
          label="Correo"
          requerido
          placeholder="Ej: official12@gmail.com"
          valor={correo}
          onCambiar={(val) => {
            setCorreo(val);
            if (val.trim() && /\S+@\S+\.\S+/.test(val)) limpiarError('correo');
          }}
          keyboardType="email-address"
          autoCapitalize="none"
          error={errores.correo}
        />

        <FormSelect
          label="Tipo de policia"
          requerido
          placeholder="Seleccione el tipo"
          valor={tipoPolicia}
          opciones={TIPOS_POLICIA}
          onSeleccionar={(val) => {
            setTipoPolicia(val);
            if (val) limpiarError('tipoPolicia');
          }}
          error={errores.tipoPolicia}
        />

        <FormInput
          label="Contraseña"
          requerido
          placeholder="************"
          valor={password}
          onCambiar={(val) => {
            setPassword(val);
            if (val.length >= 6) limpiarError('password');
            if (confirmarPassword && val === confirmarPassword) limpiarError('confirmarPassword');
          }}
          secureTextEntry={!mostrarPassword}
          mostrarTogglePassword
          onTogglePassword={() => setMostrarPassword(!mostrarPassword)}
          error={errores.password}
          onFocus={scrollToBottom}
        />

        {/* Medidor de fortaleza de contraseña */}
        <MedidorPassword password={password} />

        <FormInput
          label="Confirmar Contraseña"
          requerido
          placeholder="**************"
          valor={confirmarPassword}
          onCambiar={(val) => {
            setConfirmarPassword(val);
            if (val && val === password) limpiarError('confirmarPassword');
          }}
          secureTextEntry={!mostrarConfirmar}
          mostrarTogglePassword
          onTogglePassword={() => setMostrarConfirmar(!mostrarConfirmar)}
          error={errores.confirmarPassword}
          onFocus={scrollToBottom}
        />

        <View className="mt-4">
          <BotonPrimario
            titulo="Registrar Policia"
            onPresionar={handleRegistrar}
            cargando={cargando}
            className="bg-verde-institucional"
            textoClassName="text-white"
          />
        </View>
      </ScrollView>

      {/* Modal Animado de Éxito al registrar */}
      <ModalPoliciaCreado
        visible={modalExitoVisible}
        datosPolicia={datosCreado}
        onConfirmar={() => {
          setModalExitoVisible(false);
          router.replace('/(admin)');
        }}
      />
    </KeyboardAvoidingView>
  );
}


