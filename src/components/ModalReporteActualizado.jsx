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
 * Modal animado de confirmación al actualizar un reporte existente.
 *
 * @param {Object} props
 * @param {boolean} props.visible - Controla la visibilidad del modal
 * @param {Object} props.datosReporte - Información del reporte (nombre, tipoIncidente, etc.)
 * @param {Function} props.onConfirmar - Callback al presionar el botón de cerrar/aceptar
 */
function ModalReporteActualizado({ visible, datosReporte, onConfirmar }) {
  const scale = useSharedValue(0.7);
  const opacity = useSharedValue(0);
  const iconScale = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      scale.value = withSpring(1, { damping: 14, stiffness: 120 });
      opacity.value = withTiming(1, { duration: 300 });
      iconScale.value = withDelay(150, withSpring(1, { damping: 10, stiffness: 140 }));
    } else {
      scale.value = 0.7;
      opacity.value = 0;
      iconScale.value = 0;
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
            ¡REPORTE ACTUALIZADO!
          </Text>
          <Text className="text-xs text-gray-500 text-center mt-2 mb-6 px-2 leading-5">
            Los cambios del reporte han sido guardados correctamente en SafeCity.
          </Text>

          {/* Botón principal */}
          <View className="w-full">
            <BotonPrimario
              titulo="ENTENDIDO"
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

export default memo(ModalReporteActualizado);
