import { useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text } from 'react-native';
import { ScreenContainer } from '../../../components/common/ScreenContainer';
import { SearchInput } from '../../../components/common/SearchInput';
import { ListItemCard } from '../../../components/common/ListItemCard';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { useCiudad } from '../../../../application/context/CiudadContext';
import { getCofradiasPorCiudad } from '../../../../data/services/cofradiaService';
import { getProcesionesPorCiudad } from '../../../../data/services/procesionService';
import { getEventosPorCiudad } from '../../../../data/services/eventoService';
import { pasosMock } from '../../../../data/mock/pasos';
import { cofradiasMock } from '../../../../data/mock/cofradias';
import { colors, fontFamilies, spacing } from '../../../../theme';

const CONFIG_POR_TIPO = {
  cofradias: {
    titulo: 'Cofradías',
    detalle: 'DetalleCofradia',
    idParam: 'cofradiaId',
    cargar: (ciudadId) => getCofradiasPorCiudad(ciudadId),
  },
  procesiones: {
    titulo: 'Procesiones',
    detalle: 'DetalleProcesion',
    idParam: 'procesionId',
    cargar: (ciudadId) => getProcesionesPorCiudad(ciudadId),
  },
  eventos: {
    titulo: 'Eventos',
    detalle: null,
    idParam: 'eventoId',
    cargar: (ciudadId) => getEventosPorCiudad(ciudadId),
  },
  pasos: {
    titulo: 'Pasos',
    detalle: 'DetallePaso',
    idParam: 'pasoId',
    // los pasos no guardan ciudadId directamente: se resuelven vía la cofradía a la que pertenecen
    cargar: (ciudadId) => {
      const cofradiaIds = cofradiasMock.filter((c) => c.ciudadId === ciudadId).map((c) => c.id);
      return Promise.resolve(pasosMock.filter((p) => cofradiaIds.includes(p.cofradiaId)));
    },
  },
};

export function ListadoScreen({ route, navigation }) {
  const { tipo } = route.params;
  const config = CONFIG_POR_TIPO[tipo];
  const { ciudadSeleccionada } = useCiudad();
  const [items, setItems] = useState([]);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    if (!ciudadSeleccionada) return;
    config.cargar(ciudadSeleccionada.id).then(setItems);
  }, [ciudadSeleccionada, tipo]);

  useEffect(() => {
    navigation.setOptions({ title: config.titulo });
  }, [tipo]);

  const itemsFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    if (!texto) return items;
    return items.filter((item) => item.nombre.toLowerCase().includes(texto));
  }, [items, busqueda]);

  function onPressItem(item) {
    if (!config.detalle) return;
    navigation.navigate(config.detalle, { [config.idParam]: item.id });
  }

  return (
    <ScreenContainer style={styles.container}>
      <SearchInput value={busqueda} onChangeText={setBusqueda} placeholder={`Buscar en ${config.titulo.toLowerCase()}...`} />

      <FlatList
        data={itemsFiltrados}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No hay elementos que coincidan con la búsqueda.</Text>}
        renderItem={({ item }) => (
          <ListItemCard
            title={item.nombre}
            badge={item.estado ? <StatusBadge estado={item.estado} /> : null}
            onPress={() => onPressItem(item)}
            rightIcon={config.detalle ? 'chevron-forward' : null}
          />
        )}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
  },
  list: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  empty: {
    color: colors.goldMuted,
    fontFamily: fontFamilies.bodyRegular,
    fontSize: 14,
    marginTop: spacing.lg,
  },
});
