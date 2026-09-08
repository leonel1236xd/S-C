import { useCallback } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';

export default function RegistrarRedirect() {
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      router.replace('/(policia-stack)/nuevo-reporte');
    }, [])
  );

  return null;
}

