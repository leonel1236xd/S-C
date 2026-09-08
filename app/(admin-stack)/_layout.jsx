import React from 'react';
import { Stack } from 'expo-router';

export default function AdminStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#174A1A' },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { fontWeight: 'bold' },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="nuevo-policia"
        options={{ title: 'Registrar Policia' }}
      />
      <Stack.Screen
        name="editar-policia/[id]"
        options={{ title: 'Editar Policia' }}
      />
    </Stack>
  );
}
