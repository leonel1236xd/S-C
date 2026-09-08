import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';
import AvatarUsuario from '../../src/components/AvatarUsuario';
import ConfirmModal from '../../src/components/ConfirmModal';

export default function PerfilAdmin() {
  const insets = useSafeAreaInsets();
  const { usuario, logout } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);

  const nombreCompleto = usuario?.nombres
    ? `${usuario.nombres} ${usuario.apellidos || ''}`.trim()
    : 'Administrador del Sistema';

  return (
    <View className="flex-1 bg-fondo">
      {/* Header curvo verde institucional */}
      <View
        className="bg-verde-institucional items-center pb-16"
        style={{ paddingTop: insets.top + 20 }}
      >
        <Text className="text-amarillo font-extrabold text-xs tracking-widest uppercase mb-1">
          Panel Administrador
        </Text>
        <Text className="text-white text-xl font-extrabold">
          Perfil de Usuario
        </Text>
      </View>

      {/* Avatar centrado sobre el header */}
      <View className="items-center -mt-14">
        <View className="border-4 border-white rounded-full shadow-lg">
          <AvatarUsuario tamaño={120} />
        </View>
      </View>

      {/* Info del perfil */}
      <View className="items-center mt-4 px-8">
        <Text className="text-xl font-extrabold text-verde-institucional">
          Administrador
        </Text>

        <View className="w-24 h-1 bg-verde-institucional mt-1 mb-4 rounded-full" />

        <Text className="text-lg font-bold text-negro text-center">
          {nombreCompleto}
        </Text>
      </View>

      {/* Botón cerrar sesión */}
      <View className="flex-1 justify-center px-8">
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          className="border border-gray-300 rounded-xl py-4 px-6 flex-row items-center justify-center bg-white shadow-sm"
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={22} color="#DC2626" />
          <Text className="text-red-600 text-base font-bold ml-3">
            Cerrar Sesion
          </Text>
        </TouchableOpacity>
      </View>

      {/* Modal de confirmación para cerrar sesión */}
      <ConfirmModal
        visible={modalVisible}
        titulo="Cerrar Sesión"
        mensaje="¿Estás seguro que deseas cerrar la sesión de Administrador?"
        textoConfirmar="Cerrar Sesión"
        textoCancelar="Cancelar"
        peligroso={true}
        onConfirmar={() => {
          setModalVisible(false);
          logout();
        }}
        onCancelar={() => setModalVisible(false)}
      />
    </View>
  );
}

