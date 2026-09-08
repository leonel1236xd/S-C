import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { View, PanResponder, AppState } from 'react-native';
import { supabase } from '../services/supabaseClient';


export const TIEMPO_INACTIVIDAD_MS = 1 * 60 * 1000;

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [sesion, setSesion] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  const timerInactividadRef = useRef(null);

  // Cerrar sesión
  async function logout() {
    setCargando(true);
    try {
      if (timerInactividadRef.current) {
        clearTimeout(timerInactividadRef.current);
      }
      await supabase.auth.signOut();
      setSesion(null);
      setUsuario(null);
    } finally {
      setCargando(false);
    }
  }

  // Reiniciar el contador de inactividad cuando hay toques en pantalla
  const reiniciarTemporizador = useCallback(() => {
    if (timerInactividadRef.current) {
      clearTimeout(timerInactividadRef.current);
    }
    if (usuario) {
      timerInactividadRef.current = setTimeout(() => {
        logout();
      }, TIEMPO_INACTIVIDAD_MS);
    }
  }, [usuario]);

  // Escuchar toques en cualquier parte de la pantalla
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponderCapture: () => {
        reiniciarTemporizador();
        return false;
      },
      onMoveShouldSetPanResponderCapture: () => {
        reiniciarTemporizador();
        return false;
      },
      onPanResponderTerminationRequest: () => true,
    })
  ).current;

  // Escuchar cambios de estado de la app (Background / Foreground)
  useEffect(() => {
    let backgroundTime = null;

    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState.match(/inactive|background/)) {
        backgroundTime = Date.now();
      } else if (nextAppState === 'active') {
        if (backgroundTime && Date.now() - backgroundTime >= TIEMPO_INACTIVIDAD_MS && usuario) {
          logout();
        } else {
          reiniciarTemporizador();
        }
      }
    });

    return () => subscription.remove();
  }, [usuario, reiniciarTemporizador]);

  // Iniciar o limpiar temporizador al cambiar el estado del usuario
  useEffect(() => {
    if (usuario) {
      reiniciarTemporizador();
    } else if (timerInactividadRef.current) {
      clearTimeout(timerInactividadRef.current);
    }
  }, [usuario, reiniciarTemporizador]);

  // Obtener perfil de public.usuarios por id
  async function obtenerPerfil(idUsuario) {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id_usuario', idUsuario)
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  // Escuchar cambios de sesión (restore al abrir app, login, logout)
  useEffect(() => {
    let cancelado = false;

    async function cargarSesionInicial() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (cancelado) return;

        setSesion(session);

        if (session?.user) {
          try {
            const perfil = await obtenerPerfil(session.user.id);
            if (cancelado) return;

            if (perfil && !perfil.activo) {
              await supabase.auth.signOut();
              if (cancelado) return;
              setSesion(null);
              setUsuario(null);
            } else if (perfil) {
              setUsuario(perfil);
            }
          } catch (errPerfil) {
            console.error('Error al obtener perfil inicial:', errPerfil);
          }
        }
      } catch (errSesion) {
        console.error('Error al restaurar sesión:', errSesion);
      } finally {
        if (!cancelado) {
          setCargando(false);
        }
      }
    }

    cargarSesionInicial();

    // Listener para cambios de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (cancelado) return;
        setSesion(session);

        if (event === 'SIGNED_OUT' || !session) {
          setUsuario(null);
        }
      }
    );

    return () => {
      cancelado = true;
      subscription?.unsubscribe();
    };
  }, []);

  // Login con correo y contraseña
  async function login(correo, password) {
    setCargando(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: correo,
        password: password,
      });

      if (error) throw new Error(error.message);

      // Consultar perfil extendido
      const perfil = await obtenerPerfil(data.user.id);

      // Verificar que el usuario esté activo
      if (!perfil.activo) {
        await supabase.auth.signOut();
        setSesion(null);
        setUsuario(null);
        throw new Error('Tu cuenta ha sido desactivada. Contacta al administrador.');
      }

      setSesion(data.session);
      setUsuario(perfil);
      return perfil;
    } finally {
      setCargando(false);
    }
  }

  // Refrescar perfil del usuario (útil después de editar perfil)
  async function refrescarPerfil() {
    if (sesion?.user) {
      const perfil = await obtenerPerfil(sesion.user.id);
      setUsuario(perfil);
      return perfil;
    }
  }

  const value = {
    sesion,
    usuario,
    cargando,
    login,
    logout,
    refrescarPerfil,
  };

  return (
    <AuthContext.Provider value={value}>
      <View style={{ flex: 1 }} {...(usuario ? panResponder.panHandlers : {})}>
        {children}
      </View>
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}
