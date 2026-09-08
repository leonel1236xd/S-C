import React from 'react';
import { View, Text, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HeaderPolicia() {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="bg-verde-institucional flex-row items-center px-4 pb-4"
      style={{ paddingTop: insets.top + 8 }}
    >
      <Image
        source={require('../../assets/escudo-policia-boliviana.png')}
        className="w-14 h-14"
        resizeMode="contain"
      />
      <Text className="text-white text-xl font-bold ml-3">
        Policía Boliviana
      </Text>
    </View>
  );
}

