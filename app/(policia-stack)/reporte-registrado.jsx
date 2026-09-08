import React, { useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, BackHandler } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  withSpring,
} from 'react-native-reanimated';

export default function ReporteRegistrado() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { numeroCaso } = useLocalSearchParams();

  // Manejar botón físico de atrás (Android)
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        router.replace('/(policia)');
        return true;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [router])
  );

  // Animaciones
  const checkScale = useSharedValue(0);
  const checkOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const cardTranslateY = useSharedValue(30);
  const cardOpacity = useSharedValue(0);
  const buttonsOpacity = useSharedValue(0);

  useEffect(() => {
    // Secuencia de animación
    checkScale.value = withSpring(1, { damping: 8, stiffness: 100 });
    checkOpacity.value = withTiming(1, { duration: 500 });

    textOpacity.value = withDelay(400, withTiming(1, { duration: 500 }));

    cardTranslateY.value = withDelay(700, withSpring(0, { damping: 12 }));
    cardOpacity.value = withDelay(700, withTiming(1, { duration: 400 }));

    buttonsOpacity.value = withDelay(1100, withTiming(1, { duration: 400 }));
  }, []);

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
    opacity: checkOpacity.value,
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: cardTranslateY.value }],
    opacity: cardOpacity.value,
  }));

  const buttonsStyle = useAnimatedStyle(() => ({
    opacity: buttonsOpacity.value,
  }));

  return (
    <View
      className="flex-1 bg-verde-fuerte items-center justify-center px-8"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      {/* Check animado */}
      <Animated.View style={checkStyle} className="items-center mb-6">
        <View className="w-40 h-40 rounded-full border-4 border-amarillo/50 items-center justify-center">
          <View className="w-32 h-32 rounded-full border-2 border-amarillo/30 items-center justify-center">
            <View className="w-24 h-24 rounded-full bg-verde-institucional/80 items-center justify-center">
              <Ionicons name="checkmark" size={48} color="#FFD100" />
            </View>
          </View>
        </View>

        {/* Estrellas */}
        <View className="flex-row mt-3 gap-1">
          {[...Array(5)].map((_, i) => (
            <Ionicons key={i} name="star" size={16} color="#FFD100" />
          ))}
        </View>
      </Animated.View>

      {/* Título */}
      <Animated.View style={textStyle} className="items-center mb-8">
        <Text className="text-white text-2xl font-black text-center">
          ¡REPORTE REGISTRADO
        </Text>
        <Text className="text-amarillo text-2xl font-black text-center">
          CON ÉXITO!
        </Text>
      </Animated.View>

      {/* Número de caso */}
      <Animated.View
        style={cardStyle}
        className="bg-verde-institucional/60 border-2 border-amarillo rounded-2xl px-8 py-6 items-center mb-10 w-full"
      >
        <Text className="text-white text-sm font-bold mb-2">NÚMERO DE CASO</Text>
        <Text className="text-amarillo text-3xl font-black">#{numeroCaso}</Text>
      </Animated.View>

      {/* Botones */}
      <Animated.View style={buttonsStyle} className="w-full gap-4">
        <TouchableOpacity
          onPress={() => router.replace('/(policia)/historial')}
          className="bg-amarillo rounded-xl py-4 items-center"
        >
          <Text className="text-verde-fuerte text-base font-bold">Ver mis reportes</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.replace('/(policia)')}
          className="border-2 border-amarillo rounded-xl py-4 items-center"
        >
          <Text className="text-amarillo text-base font-bold">Volver al inicio</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}
