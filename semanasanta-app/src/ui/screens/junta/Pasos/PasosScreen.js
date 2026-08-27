import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Alert, Modal, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getCiudadPorId, getCofradiasGestion, getPasosPorCofradia, eliminarPaso } from '../../../../data/services';
import { ScreenContainer } from '../../../components/common';
import { colors } from '../../../../theme';
import { styles } from './PasosScreen.styles';

// Mockup del 2026-08-22: se llega desde "Pasos" del menú de Gestión en
// PerfilJuntaScreen, con ciudadId por params -mismo patrón que Procesiones/
// Cofradias/Eventos. Sin endpoint "pasos por ciudad" en el backend (Paso
// solo se filtra por cofradiaId): se cargan las cofradías de la ciudad
// (incluidas las desactivadas -ver CofradiasScreen, la Junta necesita poder
// gestionar sus pasos igual) y se piden los pasos de cada una en paralelo,
// mismo patrón que CiudadesScreen.cargar.
//
// El mockup mostraba un badge "Activa" en cada fila de paso, pero Paso no
// tiene ningún campo de estado en el backend (a diferencia de Cofradia,
// donde sí se ha añadido) -se ha quitado, se deja solo Editar/Eliminar.
export function PasosScreen({ route, navigation }) {
  const { ciudadId } = route.params;
  // cofradiaIdInicial (opcional): llegando desde "Ver Lista" en
  // FormularioEventoScreen, con el filtro ya puesto en la cofradía del
  // evento -el usuario puede quitarlo igualmente, es solo el punto de partida.
  const [ciudad, setCiudad] = useState(null);
  const [cofradias, setCofradias] = useState([]);
  const [pasos, setPasos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtroCofradiaId, setFiltroCofradiaId] = useState(route.params?.cofradiaIdInicial ?? null); // null = "Todos"
  const [modalFiltroVisible, setModalFiltroVisible] = useState(false);
  const [eliminandoId, setEliminandoId] = useState(null);

  useEffect(() => {
    navigation.setOptions({
      headerTintColor: colors.subtitle,
      headerTitleStyle: { color: colors.textPrimary },
      title: 'Pasos',
    });
  }, [navigation]);

  const cargar = useCallback(() => {
    Promise.all([getCiudadPorId(ciudadId), getCofradiasGestion(ciudadId)]).then(([ciudadCargada, listaCofradias]) => {
      setCiudad(ciudadCargada);
      setCofradias(listaCofradias);
      Promise.all(listaCofradias.map((cofradia) => getPasosPorCofradia(cofradia.id))).then((porCofradia) => {
        setPasos(porCofradia.flat());
        setCargando(false);
      });
    });
  }, [ciudadId]);

  useFocusEffect(cargar);

  function confirmarEliminar(paso) {
    Alert.alert('Eliminar paso', `¿Seguro que quieres eliminar "${paso.nombre}"? Esta acción no se puede deshacer.`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          setEliminandoId(paso.id);
          try {
            await eliminarPaso(paso.id);
            cargar();
          } finally {
            setEliminandoId(null);
          }
        },
      },
    ]);
  }

  const pasosFiltrados = filtroCofradiaId ? pasos.filter((p) => p.cofradiaId === filtroCofradiaId) : pasos;
  const cofradiaFiltro = cofradias.find((c) => c.id === filtroCofradiaId);

  if (cargando) return null;

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Pasos</Text>
        <Text style={styles.subtitle}>{ciudad ? `Pasos de ${ciudad.nombre}` : ''}</Text>

        <TouchableOpacity
          style={styles.nuevaButton}
          onPress={() => navigation.navigate('FormularioPaso', { ciudadId })}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={18} color={colors.background} />
          <Text style={styles.nuevaButtonTexto}>Añadir paso</Text>
        </TouchableOpacity>

        <View style={styles.filtroRow}>
          <Text style={styles.filtroEtiqueta}>Cofradia:</Text>
          <TouchableOpacity style={styles.filtroSelector} onPress={() => setModalFiltroVisible(true)} activeOpacity={0.8}>
            <Text style={styles.filtroTexto} numberOfLines={1}>
              {cofradiaFiltro ? cofradiaFiltro.nombre : 'Todos'}
            </Text>
            <Ionicons name="chevron-down" size={14} color={colors.subtitle} />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Lista de pasos actuales</Text>
        {pasosFiltrados.map((paso) => (
          <View key={paso.id} style={styles.card}>
            <Text style={styles.cardTitulo}>{paso.nombre}</Text>
            <View style={styles.cardAcciones}>
              <TouchableOpacity onPress={() => navigation.navigate('FormularioPaso', { ciudadId, pasoId: paso.id })}>
                <Text style={styles.accionEditar}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity disabled={eliminandoId === paso.id} onPress={() => confirmarEliminar(paso)}>
                <Text style={styles.accionEliminar}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
        {pasosFiltrados.length === 0 ? <Text style={styles.empty}>No hay pasos todavía.</Text> : null}
      </ScrollView>

      <Modal transparent visible={modalFiltroVisible} animationType="fade" onRequestClose={() => setModalFiltroVisible(false)}>
        <Pressable style={styles.overlay} onPress={() => setModalFiltroVisible(false)}>
          <View style={styles.modalLista}>
            <TouchableOpacity
              style={styles.modalItem}
              onPress={() => {
                setFiltroCofradiaId(null);
                setModalFiltroVisible(false);
              }}
            >
              <Text style={styles.modalItemTexto}>Todos</Text>
            </TouchableOpacity>
            {cofradias.map((cofradia) => (
              <TouchableOpacity
                key={cofradia.id}
                style={styles.modalItem}
                onPress={() => {
                  setFiltroCofradiaId(cofradia.id);
                  setModalFiltroVisible(false);
                }}
              >
                <Text style={styles.modalItemTexto}>{cofradia.nombre}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </ScreenContainer>
  );
}
