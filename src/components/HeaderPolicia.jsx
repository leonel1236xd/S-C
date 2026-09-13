import { Image } from 'expo-image';
import { View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HeaderPolicia() {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="bg-verde-institucional flex-row items-center px-4 pb-4"
      style={{ paddingTop: insets.top + 8 }}
    >
      <Image
        source={require('../../assets/escudo_bolivia.png')}
        style={{ width: 56, height: 56 }}
        contentFit="contain"
      />
      <Text className="text-white text-xl font-bold ml-3">
        Policía Boliviana
      </Text>
    </View>
  );
}
