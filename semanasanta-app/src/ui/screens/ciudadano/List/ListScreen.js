import { useEffect, useMemo, useState } from 'react';
import { FlatList, Text } from 'react-native';
import { common } from '../../../components';
import { context } from '../../../../application';
import { services } from '../../../../data';
import { orden } from '../../../utils';
import { styles } from './ListScreen.styles';

const CONFIG_POR_TIPO = {
  cofradias: {
    titulo: 'Cofradías',
    detalle: 'DetalleCofradia',
    idParam: 'cofradiaId',
    icono: 'account-multiple',
    categoria: 'cofradia',
    cargar: (ciudadId) => services.getCofradiasPorCiudad(ciudadId),
  },
  procesiones: {
    titulo: 'Procesiones',
    detalle: 'DetalleProcesion',
    idParam: 'procesionId',
    icono: 'candle',
    categoria: 'procesion',
    cargar: (ciudadId) => services.getProcesionesPorCiudad(ciudadId),
  },
  eventos: {
    titulo: 'Eventos',
    detalle: 'DetalleEvento',
    idParam: 'eventoId',
    icono: 'church',
    categoria: 'evento',
    cargar: (ciudadId) => services.getEventosPorCiudad(ciudadId),
  },
  pasos: {
    titulo: 'Pasos',
    detalle: 'DetallePaso',
    idParam: 'pasoId',
    icono: 'cross',
    categoria: 'paso',
    // Paso no tiene ciudadId directo ni el backend admite ese filtro para
    // pasos: se resuelve vía las cofradías de la ciudad (ambos servicios ya
    // son reales, ver memoria del TFG 2026-08-15).
    cargar: async (ciudadId) => {
      const cofradias = await services.getCofradiasPorCiudad(ciudadId);
      const listas = await Promise.all(cofradias.map((c) => services.getPasosPorCofradia(c.id)));
      return listas.flat();
    },
  },
  // Mezcla procesiones y eventos: no viene de un servicio por ciudad, sino
  // del FavoritosContext (se resuelve aparte, ver useEffect de abajo).
  favoritos: {
    titulo: 'Tus Favoritos',
    detalle: null,
    idParam: null,
    icono: 'heart',
    categoria: null,
    cargar: null,
  },
};

// Un favorito puede ser una cofradía, una procesión, un evento o un paso
// (ver FavoritosContext: se guardan como { id, tipo }). Cada categoría sabe
// cómo cargarse por id, con qué icono mostrarse y a qué pantalla de detalle ir.
const CONFIG_POR_CATEGORIA_FAVORITO = {
  cofradia: { obtener: services.getCofradiaPorId, detalle: 'DetalleCofradia', idParam: 'cofradiaId', icono: CONFIG_POR_TIPO.cofradias.icono },
  procesion: { obtener: services.getProcesionPorId, detalle: 'DetalleProcesion', idParam: 'procesionId', icono: CONFIG_POR_TIPO.procesiones.icono },
  evento: { obtener: services.getEventoPorId, detalle: 'DetalleEvento', idParam: 'eventoId', icono: CONFIG_POR_TIPO.eventos.icono },
  paso: { obtener: services.getPasoPorId, detalle: 'DetallePaso', idParam: 'pasoId', icono: CONFIG_POR_TIPO.pasos.icono },
};

export function ListadoScreen({ route, navigation }) {
  const { tipo } = route.params;
  const config = CONFIG_POR_TIPO[tipo];
  const { ciudadSeleccionada } = context.useCiudad();
  const { favoritos, esFavorito, alternarFavorito } = context.useFavoritos();
  const [items, setItems] = useState([]);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    if (tipo === 'favoritos') {
      Promise.all(
        favoritos.map((f) => {
          const cfg = CONFIG_POR_CATEGORIA_FAVORITO[f.tipo];
          if (!cfg) return Promise.resolve(null);
          return cfg.obtener(f.id).then((item) => item && { ...item, categoria: f.tipo, icono: cfg.icono });
        })
      ).then((lista) => setItems(orden.ordenarPorNombre(lista.filter(Boolean))));
      return;
    }
    if (!ciudadSeleccionada) return;
    config.cargar(ciudadSeleccionada.id).then((lista) => setItems(orden.ordenarPorNombre(lista)));
  }, [ciudadSeleccionada, tipo, favoritos]);

  const itemsFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    if (!texto) return items;
    return items.filter((item) => item.nombre.toLowerCase().includes(texto));
  }, [items, busqueda]);

  function detalleDe(item) {
    if (tipo === 'favoritos') return CONFIG_POR_CATEGORIA_FAVORITO[item.categoria]?.detalle ?? null;
    return config.detalle;
  }

  // La categoría para el FavoritosContext -en "favoritos" cada item ya trae
  // la suya (mezcla procesiones/eventos/pasos/cofradías); en el resto, todos
  // los items de la lista son de la misma categoría (config.categoria).
  function categoriaDe(item) {
    return tipo === 'favoritos' ? item.categoria : config.categoria;
  }

  function onPressItem(item) {
    const detalle = detalleDe(item);
    if (!detalle) return;
    const idParam = tipo === 'favoritos' ? CONFIG_POR_CATEGORIA_FAVORITO[item.categoria].idParam : config.idParam;
    navigation.navigate(detalle, { [idParam]: item.id });
  }

  return (
    <common.ScreenContainer style={styles.container}>
      <Text style={styles.title}>{config.titulo}</Text>

      <common.SearchInput value={busqueda} onChangeText={setBusqueda} placeholder={`Buscar en ${config.titulo.toLowerCase()}...`} />

      <FlatList
        data={itemsFiltrados}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No hay elementos que coincidan con la búsqueda.</Text>}
        renderItem={({ item }) => (
          <common.ListItemCard
            icon={tipo === 'favoritos' ? item.icono : config.icono}
            title={item.nombre}
            badge={item.estado ? <common.StatusBadge estado={item.estado} /> : null}
            mostrarFavorito
            esFavorito={esFavorito(item.id, categoriaDe(item))}
            onToggleFavorito={() => alternarFavorito(item.id, categoriaDe(item))}
            onPress={() => onPressItem(item)}
            rightIcon={detalleDe(item) ? 'chevron-forward' : null}
          />
        )}
      />
    </common.ScreenContainer>
  );
}
