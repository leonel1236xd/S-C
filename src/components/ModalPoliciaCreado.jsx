import React, { useEffect, memo } from 'react';
import { View, Text, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import BotonPrimario from './BotonPrimario';

/**
 * Modal animado de confirmación al registrar un nuevo policía.
 *
 * @param {Object} props
 * @param {boolean} props.visible - Controla la visibilidad del modal
 * @param {Object} props.datosPolicia - Información del policía recién creado
 * @param {Function} props.onConfirmar - Callback al presionar el botón principal
 */
function ModalPoliciaCreado({ visible, datosPolicia, onConfirmar }) {
  const scale = useSharedValue(0.7);
  const opacity = useSharedValue(0);
  const iconScale = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      scale.value = withSpring(1, { damping: 14, stiffness: 120 });
      opacity.value = withTiming(1, { duration: 300 });
      iconScale.value = withDelay(150, withSpring(1, { damping: 10, stiffness: 140 }));
    }
  }, [visible]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onConfirmar}
    >
      <View className="flex-1 bg-black/65 items-center justify-center px-6">
        <Animated.View
          style={containerStyle}
          className="w-full bg-white rounded-3xl p-6 items-center shadow-2xl border border-gray-100"
        >
          {/* Icono animado */}
          <Animated.View style={iconStyle} className="mb-4 items-center">
            <View className="w-24 h-24 rounded-full bg-emerald-100 items-center justify-center border-4 border-emerald-500/20">
              <View className="w-18 h-18 rounded-full bg-verde-institucional items-center justify-center shadow-md">
                <Ionicons name="checkmark-sharp" size={44} color="#FFD100" />
              </View>
            </View>
          </Animated.View>

          {/* Título y subtítulo */}
          <Text className="text-xl font-extrabold text-verde-institucional text-center tracking-wide">
            ¡POLICÍA REGISTRADO!
          </Text>
          <Text className="text-xs text-gray-500 text-center mt-1 mb-5">
            El efectivo ha sido registrado correctamente en la base de datos de SafeCity.
          </Text>

          {/* Tarjeta de información */}
          <View className="w-full bg-gray-50 rounded-2xl p-4 mb-6 border border-gray-200">
            <View className="flex-row items-center mb-3">
              <View className="w-8 h-8 rounded-full bg-verde-institucional/10 items-center justify-center mr-3">
                <Ionicons name="person" size={16} color="#174A1A" />
              </View>
              <View className="flex-1">
                <Text className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Rango y Nombre
                </Text>
                <Text className="text-sm font-bold text-gray-900">
                  {datosPolicia?.tipoPolicia || 'Policía'} • {datosPolicia?.nombres} {datosPolicia?.apellidos}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center mb-3">
              <View className="w-8 h-8 rounded-full bg-verde-institucional/10 items-center justify-center mr-3">
                <Ionicons name="mail" size={16} color="#174A1A" />
              </View>
              <View className="flex-1">
                <Text className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Correo Electrónico
                </Text>
                <Text className="text-xs font-semibold text-gray-800">
                  {datosPolicia?.correo}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center justify-between pt-2 border-t border-gray-200/80">
              <Text className="text-xs font-medium text-gray-500">Estado de cuenta:</Text>
              <View className="bg-emerald-100 px-3 py-1 rounded-full flex-row items-center">
                <View className="w-2 h-2 rounded-full bg-emerald-600 mr-1.5" />
                <Text className="text-xs font-bold text-emerald-800">Activo</Text>
              </View>
            </View>
          </View>

          {/* Botón principal */}
          <View className="w-full">
            <BotonPrimario
              titulo="VOLVER A LA LISTA"
              onPresionar={onConfirmar}
              className="bg-verde-institucional"
              textoClassName="text-white"
            />
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

export default memo(ModalPoliciaCreado);

