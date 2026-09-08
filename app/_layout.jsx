import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { configureReanimatedLogger, ReanimatedLogLevel } from 'react-native-reanimated';
import '../global.css';
import { AuthProvider, useAuth } from '../src/context/AuthContext';

// Desactivar avisos del modo estricto de Reanimated en desarrollo
configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});

// Prevenir que el splash se oculte automáticamente
SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { usuario, cargando } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (cargando) return;

    // Ocultar splash cuando terminamos de cargar
    SplashScreen.hideAsync();

    const rol = (usuario?.rol || '').toUpperCase();
    const enAuth = segments[0] === '(auth)';
    const enPolicia = segments[0] === '(policia)' || segments[0] === '(policia-stack)';
    const enAdmin = segments[0] === '(admin)' || segments[0] === '(admin-stack)';

    if (!usuario) {
      // No hay sesión → ir al login
      if (!enAuth) {
        router.replace('/(auth)/login');
      }
    } else if (rol === 'POLICIA') {
      // Policía autenticado → redirigir a pantalla de policía
      if (enAuth || enAdmin || (!enPolicia && !enAdmin)) {
        router.replace('/(policia)');
      }
    } else if (rol === 'ADMIN') {
      // Admin autenticado → redirigir a pantalla de admin
      if (enAuth || enPolicia || (!enPolicia && !enAdmin)) {
        router.replace('/(admin)');
      }
    }
  }, [usuario, cargando, segments]);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(policia)" />
        <Stack.Screen name="(policia-stack)" />
        <Stack.Screen name="(admin)" />
        <Stack.Screen name="(admin-stack)" />
      </Stack>
      <StatusBar style="light" />
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}
