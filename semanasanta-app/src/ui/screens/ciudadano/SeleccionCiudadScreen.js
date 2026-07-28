import { useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { SearchInput } from '../../components/common/SearchInput';
import { useCiudad } from '../../../application/context/CiudadContext';
import { getCiudades } from '../../../data/services/ciudadService';
import { colors, fontFamilies, radii, spacing } from '../../../theme';

export function SeleccionCiudadScreen({ navigation }) {
  const { seleccionarCiudad } = useCiudad();
  const [ciudades, setCiudades] = useState([]);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    getCiudades().then(setCiudades);
  }, []);

  const ciudadesFiltradas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    if (!texto) return ciudades;
    return ciudades.filter((ciudad) => ciudad.nombre.toLowerCase().includes(texto));
  }, [ciudades, busqueda]);

  function onSeleccionar(ciudad) {
    seleccionarCiudad(ciudad);
    navigation.replace('MainTabs');
  }

  return (
    <ScreenContainer style={styles.container}>
      <Text style={styles.eyebrow}>España · 2027</Text>
      <Text style={styles.title}>Semana Santa</Text>
      <Text style={styles.subtitle}>Elige tu ciudad para comenzar</Text>

      <SearchInput value={busqueda} onChangeText={setBusqueda} placeholder="Buscar ciudad..." />

      <FlatList
        data={ciudadesFiltradas}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => onSeleccionar(item)} activeOpacity={0.8}>
            <Text style={styles.cardTitle}>{item.nombre}</Text>
            <Text style={styles.cardMeta}>{item.numProcesiones} procesiones</Text>
          </TouchableOpacity>
        )}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  eyebrow: {
    color: colors.goldMuted,
    fontFamily: fontFamilies.uiRegular,
    fontSize: 13,
  },
  title: {
    color: colors.textPrimary,
    fontFamily: fontFamilies.titleBold,
    fontSize: 40,
    marginTop: spacing.xs,
  },
  subtitle: {
    color: colors.cream,
    fontFamily: fontFamilies.bodyRegular,
    fontSize: 14,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  list: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  cardTitle: {
    color: colors.textPrimary,
    fontFamily: fontFamilies.titleSemiBold,
    fontSize: 22,
  },
  cardMeta: {
    color: colors.goldMuted,
    fontFamily: fontFamilies.uiRegular,
    fontSize: 13,
    marginTop: 2,
  },
});
