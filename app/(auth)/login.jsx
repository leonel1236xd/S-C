import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Animated, Image, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BotonPrimario from '../../src/components/BotonPrimario';
import { useAuth } from '../../src/context/AuthContext';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { login, cargando } = useAuth();

  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [error, setError] = useState('');

  const [focusCorreo, setFocusCorreo] = useState(false);
  const [focusPassword, setFocusPassword] = useState(false);

  const translateY = useRef(new Animated.Value(0)).current;
  const isFocusedRef = useRef(false);

  const handleFocus = (tipo) => {
    if (tipo === 'correo') setFocusCorreo(true);
    if (tipo === 'password') setFocusPassword(true);

    isFocusedRef.current = true;
    Animated.timing(translateY, {
      toValue: -70,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  const handleBlur = (tipo) => {
    if (tipo === 'correo') setFocusCorreo(false);
    if (tipo === 'password') setFocusPassword(false);

    isFocusedRef.current = false;
    setTimeout(() => {
      if (!isFocusedRef.current) {
        Animated.timing(translateY, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }).start();
      }
    }, 50);
  };

  function traducirError(mensajeRaw) {
    if (!mensajeRaw) return 'Error al iniciar sesión';
    const msg = mensajeRaw.toString();
    if (msg.includes('Invalid login credentials')) {
      return 'Correo electrónico o contraseña incorrectos. Por favor, verifique sus datos.';
    }
    if (msg.includes('Email not confirmed')) {
      return 'El correo electrónico no ha sido confirmado aún.';
    }
    if (msg.includes('User not found')) {
      return 'El usuario ingresado no está registrado.';
    }
    if (msg.includes('Too many requests')) {
      return 'Demasiados intentos fallidos. Por favor, espere unos minutos.';
    }
    return mensajeRaw;
  }

  async function handleLogin() {
    setError('');

    if (!correo.trim()) {
      setError('Ingrese su correo electrónico');
      return;
    }
    if (!password.trim()) {
      setError('Ingrese su contraseña');
      return;
    }

    try {
      const perfil = await login(correo.trim(), password);
      if (perfil) {
        const rol = (perfil.rol || '').toUpperCase();
        if (rol === 'ADMIN') {
          router.replace('/(admin)');
        } else {
          router.replace('/(policia)');
        }
      }
    } catch (err) {
      setError(traducirError(err.message));
    }
  }

  return (
    <View
      className="flex-1 bg-verde-institucional"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View
            className="px-8 items-center w-full"
            style={{ transform: [{ translateY }] }}
          >
            {/* Logo */}
            <Image
              source={require('../../assets/escudo-policia-boliviana.png')}
              className="w-48 h-48"
              resizeMode="contain"
            />

            {/* Separador */}
            <View className="w-16 h-1 bg-amarillo mt-4 mb-2 rounded-full" />

            <Text className="text-white text-lg font-bold mb-10">
              SISTEMA DE DELITOS
            </Text>

            {/* Campo Correo */}
            <View
              className={`w-full bg-white rounded-xl px-4 py-3 flex-row items-center mb-4 border-2 ${
                focusCorreo ? 'border-amarillo' : 'border-transparent'
              }`}
            >
              <Ionicons
                name="mail-outline"
                size={22}
                color={focusCorreo ? '#174A1A' : '#6B7280'}
              />
              <TextInput
                value={correo}
                onChangeText={setCorreo}
                placeholder="Ingrese su correo"
                placeholderTextColor="#9CA3AF"
                className="flex-1 ml-3 text-sm text-negro font-medium"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                onFocus={() => handleFocus('correo')}
                onBlur={() => handleBlur('correo')}
              />
            </View>

            {/* Campo Contraseña */}
            <View
              className={`w-full bg-white rounded-xl px-4 py-3 flex-row items-center mb-4 border-2 ${
                focusPassword ? 'border-amarillo' : 'border-transparent'
              }`}
            >
              <Ionicons
                name="lock-closed-outline"
                size={22}
                color={focusPassword ? '#174A1A' : '#6B7280'}
              />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Ingrese su contraseña"
                placeholderTextColor="#9CA3AF"
                className="flex-1 ml-3 text-sm text-negro font-medium"
                secureTextEntry={!mostrarPassword}
                onFocus={() => handleFocus('password')}
                onBlur={() => handleBlur('password')}
              />
              <TouchableOpacity onPress={() => setMostrarPassword(!mostrarPassword)}>
                <Ionicons
                  name={mostrarPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={22}
                  color="#6B7280"
                />
              </TouchableOpacity>
            </View>

            {/* Error */}
            {error ? (
              <View className="bg-red-50 border border-red-200 rounded-xl px-4 py-3.5 mb-4 w-full flex-row items-center">
                <Ionicons
                  name="alert-circle"
                  size={20}
                  color="#DC2626"
                  style={{ marginRight: 10 }}
                />
                <Text className="text-red-700 text-xs font-semibold flex-1 leading-4">
                  {error}
                </Text>
              </View>
            ) : null}

            {/* Botón de login */}
            <View className="w-full mt-4">
              <BotonPrimario
                titulo="Iniciar Sesión"
                onPresionar={handleLogin}
                cargando={cargando}
              />
            </View>

            {/* Texto inferior */}
            <Text className="text-amarillo/70 text-sm mt-6">
              Solo personal autorizado
            </Text>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}


