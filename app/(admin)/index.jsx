import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import PoliciaTarjeta from '../../src/components/PoliciaTarjeta';
import ConfirmModal from '../../src/components/ConfirmModal';
import LoadingSpinner from '../../src/components/LoadingSpinner';
import { obtenerPolicias, desactivarPolicia, activarPolicia } from '../../src/services/usuarios';

export default function UsuariosAdmin() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [tabActivo, setTabActivo] = useState('activos');
  const [activos, setActivos] = useState([]);
  const [inactivos, setInactivos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [policiaSeleccionado, setPoliciaSeleccionado] = useState(null);
  const [accionModal, setAccionModal] = useState('desactivar');

  useFocusEffect(
    useCallback(() => {
      cargarDatos();
    }, [])
  );

  async function cargarDatos() {
    try {
      setCargando(true);
      const [datosActivos, datosInactivos] = await Promise.all([
        obtenerPolicias({ activo: true }),
        obtenerPolicias({ activo: false }),
      ]);
      setActivos(datosActivos);
      setInactivos(datosInactivos);
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setCargando(false);
    }
  }

  function confirmarAccion(policia, accion) {
    setPoliciaSeleccionado(policia);
    setAccionModal(accion);
    setModalVisible(true);
  }

  async function ejecutarAccion() {
    if (!policiaSeleccionado) return;
    setModalVisible(false);

    try {
      if (accionModal === 'desactivar') {
        await desactivarPolicia(policiaSeleccionado.id_usuario);
        Alert.alert('Éxito', 'Policía dado de baja correctamente');
      } else {
        await activarPolicia(policiaSeleccionado.id_usuario);
        Alert.alert('Éxito', 'Policía reactivado correctamente');
      }
      cargarDatos();
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  }

  const listaActual = tabActivo === 'activos' ? activos : inactivos;

  return (
    <View className="flex-1 bg-fondo">
      {/* Header */}
      <View
        className="bg-verde-institucional px-4 pb-4"
        style={{ paddingTop: insets.top + 12 }}
      >
        <Text className="text-white text-xl font-bold">Lista de Policias</Text>
      </View>

      {/* Tabs Activos / Inactivos */}
      <View className="flex-row mx-4 mt-4 mb-4 bg-white rounded-xl overflow-hidden border border-verde-institucional/20">
        <TouchableOpacity
          onPress={() => setTabActivo('activos')}
          className={`flex-1 py-3 items-center ${
            tabActivo === 'activos' ? 'bg-verde-institucional' : ''
          }`}
        >
          <Text className={`text-sm font-bold ${
            tabActivo === 'activos' ? 'text-white' : 'text-gris'
          }`}>
            Activos ({activos.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setTabActivo('inactivos')}
          className={`flex-1 py-3 items-center ${
            tabActivo === 'inactivos' ? 'bg-gray-500' : ''
          }`}
        >
          <Text className={`text-sm font-bold ${
            tabActivo === 'inactivos' ? 'text-white' : 'text-gris'
          }`}>
            Inactivos ({inactivos.length})
          </Text>
        </TouchableOpacity>
      </View>

      {cargando ? (
        <LoadingSpinner />
      ) : (
        <FlatList
          data={listaActual}
          keyExtractor={(item) => item.id_usuario}
          renderItem={({ item }) => (
            <PoliciaTarjeta
              policia={item}
              esInactivo={tabActivo === 'inactivos'}
              onEditar={() =>
                router.push(`/(admin-stack)/editar-policia/${item.id_usuario}`)
              }
              onDesactivar={() =>
                confirmarAccion(
                  item,
                  tabActivo === 'activos' ? 'desactivar' : 'activar'
                )
              }
            />
          )}
          ListEmptyComponent={
            <View className="items-center py-12">
              <Text className="text-gris text-sm">
                No hay policías {tabActivo === 'activos' ? 'activos' : 'inactivos'}
              </Text>
            </View>
          }
          onRefresh={cargarDatos}
          refreshing={false}
          showsVerticalScrollIndicator={false}
        />
      )}

      <ConfirmModal
        visible={modalVisible}
        titulo={accionModal === 'desactivar' ? '¿Dar de baja?' : '¿Reactivar policía?'}
        mensaje={
          accionModal === 'desactivar'
            ? `¿Estás seguro de dar de baja a ${policiaSeleccionado?.nombres} ${policiaSeleccionado?.apellidos}? No podrá iniciar sesión hasta ser reactivado.`
            : `¿Deseas reactivar la cuenta de ${policiaSeleccionado?.nombres} ${policiaSeleccionado?.apellidos}?`
        }
        textoConfirmar={accionModal === 'desactivar' ? 'Dar de baja' : 'Reactivar'}
        peligroso={accionModal === 'desactivar'}
        onConfirmar={ejecutarAccion}
        onCancelar={() => setModalVisible(false)}
      />
    </View>
  );
}
