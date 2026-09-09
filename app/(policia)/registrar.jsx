import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';

export default function RegistrarRedirect() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/(policia-stack)/nuevo-reporte');
    }, 50);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <View style={{ flex: 1, backgroundColor: '#174A1A', justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#FFD100" />
    </View>
  );
}


