import { useCallback } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';

export default function RegistrarRedirectAdmin() {
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      router.replace('/(admin-stack)/nuevo-policia');
    }, [router])
  );

  return null;
}

