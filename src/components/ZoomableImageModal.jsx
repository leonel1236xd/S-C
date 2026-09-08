import React, { useMemo, memo } from 'react';
import { Modal, View, TouchableOpacity, StyleSheet, Dimensions, Text } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GestureDetector, Gesture, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * Modal para visualizar una imagen ampliada con soporte de gestos:
 * - Pellizcar para hacer zoom (Pinch)
 * - Arrastrar para mover cuando hay zoom (Pan)
 * - Doble toque para acercar/alejar rápido (Double Tap)
 */
function ZoomableImageModal({ visible, url, onClose }) {
  const insets = useSafeAreaInsets();

  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  function resetZoom() {
    'worklet';
    scale.value = withTiming(1);
    savedScale.value = 1;
    translateX.value = withTiming(0);
    savedTranslateX.value = 0;
    translateY.value = withTiming(0);
    savedTranslateY.value = 0;
  }

  function handleClose() {
    resetZoom();
    onClose();
  }

  const composedGestures = useMemo(() => {
    const pinchGesture = Gesture.Pinch()
      .onUpdate((e) => {
        scale.value = Math.max(1, Math.min(savedScale.value * e.scale, 5));
      })
      .onEnd(() => {
        if (scale.value < 1.1) {
          resetZoom();
        } else {
          savedScale.value = scale.value;
        }
      });

    const panGesture = Gesture.Pan()
      .onUpdate((e) => {
        if (scale.value > 1) {
          translateX.value = savedTranslateX.value + e.translationX;
          translateY.value = savedTranslateY.value + e.translationY;
        }
      })
      .onEnd(() => {
        savedTranslateX.value = translateX.value;
        savedTranslateY.value = translateY.value;
      });

    const doubleTapGesture = Gesture.Tap()
      .numberOfTaps(2)
      .onEnd(() => {
        if (scale.value > 1.2) {
          resetZoom();
        } else {
          scale.value = withTiming(2.5);
          savedScale.value = 2.5;
        }
      });

    return Gesture.Simultaneous(pinchGesture, panGesture, doubleTapGesture);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  if (!visible || !url) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <GestureHandlerRootView style={styles.container}>
        {/* Botón cerrar */}
        <TouchableOpacity
          onPress={handleClose}
          style={[styles.closeButton, { top: insets.top + 16 }]}
          activeOpacity={0.8}
        >
          <Ionicons name="close" size={28} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Indicador de ayuda */}
        <View style={[styles.helpBadge, { bottom: insets.bottom + 24 }]}>
          <Ionicons name="search-outline" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
          <Text style={styles.helpText}>
            Pellizca o toca 2 veces para ampliar
          </Text>
        </View>

        {/* Área de la imagen con gestos */}
        <GestureDetector gesture={composedGestures}>
          <View style={styles.imageContainer}>
            <Animated.View style={[styles.animatedView, animatedStyle]}>
              <Image
                source={{ uri: url }}
                style={styles.image}
                contentFit="contain"
              />
            </Animated.View>
          </View>
        </GestureDetector>
      </GestureHandlerRootView>
    </Modal>
  );
}

export default memo(ZoomableImageModal);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    right: 20,
    zIndex: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 22,
    padding: 8,
  },
  helpBadge: {
    position: 'absolute',
    zIndex: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  helpText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  imageContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  animatedView: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '92%',
    height: '100%',
  },
});

