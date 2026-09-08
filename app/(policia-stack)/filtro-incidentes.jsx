import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, Text, TouchableOpacity, BackHandler } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, useNavigation, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import BotonPrimario from '../../src/components/BotonPrimario';
import { INCIDENTES_CON_ICONOS } from '../../src/constants/theme';

export default function FiltroIncidentes() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const navigation = useNavigation();
  const params = useLocalSearchParams();

  // Inicializar seleccionados desde los parámetros si existen
  const [seleccionados, setSeleccionados] = useState(() => {
    if (params.seleccionados) {
      try {
        return JSON.parse(params.seleccionados);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  // Manejar el botón de ir atrás en Android
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace('/(policia)');
        }
        return true;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [router])
  );

  // Configurar flecha del header
  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => {
            if (router.canGoBack()) {
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
  }, [navigation, router]);

  function toggleIncidente(nombre) {
    if (seleccionados.includes(nombre)) {
      setSeleccionados(seleccionados.filter((item) => item !== nombre));
    } else {
      setSeleccionados([...seleccionados, nombre]);
    }
  }

  function limpiarSeleccion() {
    setSeleccionados([]);
  }

  function handleAplicar() {
    router.replace({
      pathname: '/(policia)',
      params: { incidentesFiltro: JSON.stringify(seleccionados) },
    });
  }

  return (
    <View className="flex-1 bg-fondo">
      <ScrollView
        className="flex-1 px-4 pt-4"
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Sección: Incidentes Seleccionados */}
        <View className="bg-white rounded-2xl p-4 mb-5 border border-gray-200 shadow-sm">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-base font-bold text-negro">
              Incidentes Seleccionados:
            </Text>
            {seleccionados.length > 0 && (
              <TouchableOpacity onPress={limpiarSeleccion} activeOpacity={0.7}>
                <Text className="text-sm font-bold text-red-500">Limpiar</Text>
              </TouchableOpacity>
            )}
          </View>

          {seleccionados.length === 0 ? (
            <View className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-4 items-center justify-center">
              <Ionicons name="filter-outline" size={24} color="#9CA3AF" />
              <Text className="text-xs text-gray-400 text-center mt-1">
                No has seleccionado ningún tipo de incidente.
              </Text>
            </View>
          ) : (
            <View className="flex-row flex-wrap gap-2">
              {seleccionados.map((nombre) => {
                const itemIcono = INCIDENTES_CON_ICONOS.find((item) => item.nombre === nombre);
                const iconoNombre = itemIcono ? itemIcono.icono : 'alert-circle-outline';
                return (
                  <View
                    key={nombre}
                    className="flex-row items-center bg-verde-institucional rounded-full px-3 py-1.5 shadow-sm"
                  >
                    <Ionicons name={iconoNombre} size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text className="text-xs font-semibold text-white mr-2">
                      {nombre}
                    </Text>
                    <TouchableOpacity
                      onPress={() => toggleIncidente(nombre)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Ionicons name="close-circle" size={16} color="#FFD100" />
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* Sección: Explorar Incidentes */}
        <View className="bg-white rounded-2xl p-4 mb-6 border border-gray-200 shadow-sm">
          <Text className="text-base font-bold text-negro mb-3">
            Explorar Incidentes:
          </Text>

          <View className="flex-row flex-wrap gap-2.5">
            {INCIDENTES_CON_ICONOS.map((item) => {
              const estaSeleccionado = seleccionados.includes(item.nombre);
              return (
                <TouchableOpacity
                  key={item.nombre}
                  onPress={() => toggleIncidente(item.nombre)}
                  activeOpacity={0.7}
                  className={`flex-row items-center rounded-xl px-3.5 py-2.5 border ${
                    estaSeleccionado
                      ? 'bg-verde-institucional border-verde-institucional'
                      : 'bg-gray-100 border-gray-200'
                  }`}
                >
                  <Ionicons
                    name={item.icono}
                    size={16}
                    color={estaSeleccionado ? '#FFFFFF' : '#174A1A'}
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    className={`text-xs font-semibold ${
                      estaSeleccionado ? 'text-white' : 'text-gray-800'
                    }`}
                  >
                    {item.nombre}
                  </Text>
                  {estaSeleccionado && (
                    <Ionicons
                      name="checkmark"
                      size={14}
                      color="#FFD100"
                      style={{ marginLeft: 6 }}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Contenedor Fijo Inferior con Botón Buscar */}
      <View
        className="bg-white px-4 py-3 border-t border-gray-200 shadow-lg"
        style={{ paddingBottom: Math.max(insets.bottom, 12) }}
      >
        <BotonPrimario
          titulo={
            seleccionados.length > 0
              ? `Buscar (${seleccionados.length} ${seleccionados.length === 1 ? 'filtro' : 'filtros'})`
              : 'Buscar todos'
          }
          onPresionar={handleAplicar}
        />
      </View>
    </View>
  );
}
