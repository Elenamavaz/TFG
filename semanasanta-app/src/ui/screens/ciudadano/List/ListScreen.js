import { useEffect, useMemo, useState } from 'react';
import { FlatList, Text } from 'react-native';
import { ScreenContainer, SearchInput, ListItemCard, StatusBadge } from '../../../components/common';
import { useCiudad, useFavoritos } from '../../../../application/context';
import {
  getCofradiasPorCiudad,
  getProcesionesPorCiudad,
  getEventosPorCiudad,
  getProcesionPorId,
  getEventoPorId,
} from '../../../../data/services';
import { pasosMock } from '../../../../data/mock/pasos';
import { cofradiasMock } from '../../../../data/mock/cofradias';
import { styles } from './ListScreen.styles';

const CONFIG_POR_TIPO = {
  cofradias: {
    titulo: 'Cofradías',
    detalle: 'DetalleCofradia',
    idParam: 'cofradiaId',
    icono: 'people',
    cargar: (ciudadId) => getCofradiasPorCiudad(ciudadId),
  },
  procesiones: {
    titulo: 'Procesiones',
    detalle: 'DetalleProcesion',
    idParam: 'procesionId',
    icono: 'church',
    cargar: (ciudadId) => getProcesionesPorCiudad(ciudadId),
  },
  eventos: {
    titulo: 'Eventos',
    detalle: null,
    idParam: 'eventoId',
    icono: 'candle',
    cargar: (ciudadId) => getEventosPorCiudad(ciudadId),
  },
  pasos: {
    titulo: 'Pasos',
    detalle: 'DetallePaso',
    idParam: 'pasoId',
    icono: 'cross',
    // los pasos no guardan ciudadId directamente: se resuelven vía la cofradía a la que pertenecen
    cargar: (ciudadId) => {
      const cofradiaIds = cofradiasMock.filter((c) => c.ciudadId === ciudadId).map((c) => c.id);
      return Promise.resolve(pasosMock.filter((p) => cofradiaIds.includes(p.cofradiaId)));
    },
  },
  // Mezcla procesiones y eventos: no viene de un servicio por ciudad, sino
  // del FavoritosContext (se resuelve aparte, ver useEffect de abajo).
  favoritos: {
    titulo: 'Tus Favoritos',
    detalle: null,
    idParam: null,
    icono: 'heart',
    cargar: null,
  },
};

export function ListadoScreen({ route, navigation }) {
  const { tipo } = route.params;
  const config = CONFIG_POR_TIPO[tipo];
  const { ciudadSeleccionada } = useCiudad();
  const { favoritos, esFavorito, alternarFavorito } = useFavoritos();
  const [items, setItems] = useState([]);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    if (tipo === 'favoritos') {
      Promise.all(
        favoritos.map((f) =>
          (f.tipo === 'procesion' ? getProcesionPorId(f.id) : getEventoPorId(f.id)).then(
            (item) => item && { ...item, categoria: f.tipo, icono: f.tipo === 'procesion' ? 'church' : 'candle' }
          )
        )
      ).then((lista) => setItems(lista.filter(Boolean)));
      return;
    }
    if (!ciudadSeleccionada) return;
    config.cargar(ciudadSeleccionada.id).then(setItems);
  }, [ciudadSeleccionada, tipo, favoritos]);

  useEffect(() => {
    navigation.setOptions({ title: config.titulo });
  }, [tipo]);

  const itemsFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    if (!texto) return items;
    return items.filter((item) => item.nombre.toLowerCase().includes(texto));
  }, [items, busqueda]);

  function detalleDe(item) {
    if (tipo === 'favoritos') return item.categoria === 'procesion' ? 'DetalleProcesion' : null;
    return config.detalle;
  }

  function onPressItem(item) {
    const detalle = detalleDe(item);
    if (!detalle) return;
    const idParam = tipo === 'favoritos' ? 'procesionId' : config.idParam;
    navigation.navigate(detalle, { [idParam]: item.id });
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
            icon={tipo === 'favoritos' ? item.icono : config.icono}
            title={item.nombre}
            badge={item.estado ? <StatusBadge estado={item.estado} /> : null}
            mostrarFavorito={tipo === 'favoritos'}
            esFavorito={tipo === 'favoritos' ? esFavorito(item.id, item.categoria) : false}
            onToggleFavorito={() => alternarFavorito(item.id, item.categoria)}
            onPress={() => onPressItem(item)}
            rightIcon={detalleDe(item) ? 'chevron-forward' : null}
          />
        )}
      />
    </ScreenContainer>
  );
}
