import React from 'react';
import { Stack } from 'expo-router';

export default function PoliciaStackLayout() {
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
        name="nuevo-reporte"
        options={{ title: 'Nuevo Reporte' }}
      />
      <Stack.Screen
        name="reporte-registrado"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="detalle-reporte/[id]"
        options={{ title: 'Detalles del Caso' }}
      />
      <Stack.Screen
        name="filtro-incidentes"
        options={{ title: 'Seleccionar Incidentes' }}
      />
    </Stack>
  );
}
