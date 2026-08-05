import { useEffect, useMemo, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer, SearchInput, ProcesionCard, PasoListItem, StatusBadge } from '../../../components/common';
import { useCiudad, useFavoritos } from '../../../../application/context';
import {
  getProcesionesPorCiudad,
  getEventosPorCiudad,
  getCofradiasPorCiudad,
  getPasosPorCofradia,
  getDiasSemanaSanta,
} from '../../../../data/services';
import { colors } from '../../../../theme';
import { styles } from './SearchScreen.styles';

// Agrupa PROGRAMADA/PROGRAMADO y FINALIZADA/FINALIZADO bajo un mismo chip:
// procesiones y eventos usan formas gramaticales distintas para el mismo estado.
const FILTROS_ESTADO = [
  { id: 'en-curso', label: 'En curso', valores: ['EN_CURSO'] },
  { id: 'programada', label: 'Programada', valores: ['PROGRAMADA', 'PROGRAMADO'] },
  { id: 'finalizada', label: 'Finalizada', valores: ['FINALIZADA', 'FINALIZADO'] },
];

const ABREVIATURA_DIA = {
  'domingo-ramos': 'D. Ramos',
  'lunes-santo': 'L. Santo',
  'martes-santo': 'M. Santo',
  'miercoles-santo': 'Mi. Santo',
  'jueves-santo': 'J. Santo',
  'viernes-santo': 'V. Santo',
  'sabado-santo': 'S. Santo',
  'domingo-resurreccion': 'D. Resurrección',
};

export function BuscarScreen({ navigation }) {
  const { ciudadSeleccionada } = useCiudad();
  const { esFavorito, alternarFavorito } = useFavoritos();

  const [texto, setTexto] = useState('');
  const [filtrosVisibles, setFiltrosVisibles] = useState(false);
  const [diaFiltroId, setDiaFiltroId] = useState('todos');
  const [estadoFiltroId, setEstadoFiltroId] = useState(null);

  const [diasSemanaSanta, setDiasSemanaSanta] = useState([]);
  const [procesiones, setProcesiones] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [pasos, setPasos] = useState([]);
  const [cofradiasPorId, setCofradiasPorId] = useState({});

  useEffect(() => {
    getDiasSemanaSanta().then(setDiasSemanaSanta);
  }, []);

  useEffect(() => {
    if (!ciudadSeleccionada) return;
    const ciudadId = ciudadSeleccionada.id;
    Promise.all([
      getProcesionesPorCiudad(ciudadId),
      getEventosPorCiudad(ciudadId),
      getCofradiasPorCiudad(ciudadId),
    ]).then(([listaProcesiones, listaEventos, listaCofradias]) => {
      setProcesiones(listaProcesiones);
      setEventos(listaEventos);
      setCofradiasPorId(Object.fromEntries(listaCofradias.map((c) => [c.id, c.nombre])));
      Promise.all(listaCofradias.map((c) => getPasosPorCofradia(c.id))).then((listasPasos) => {
        setPasos(listasPasos.flat());
      });
    });
  }, [ciudadSeleccionada]);

  const idPorNombreDia = useMemo(() => new Map(diasSemanaSanta.map((d) => [d.nombre, d.id])), [diasSemanaSanta]);
  const diaPorFecha = useMemo(() => new Map(diasSemanaSanta.map((d) => [d.fecha, d])), [diasSemanaSanta]);

  const resultados = useMemo(() => {
    const items = [
      ...procesiones.map((p) => ({
        id: p.id,
        categoria: 'procesion',
        nombre: p.nombre,
        diaId: idPorNombreDia.get(p.dia) ?? null,
        diaNombre: p.dia,
        hora: p.horaSalida,
        estado: p.estado,
        cofradiaNombre: cofradiasPorId[p.cofradiaId],
        rutaTexto: p.recorrido?.puntos?.map((punto) => punto.nombre).join(' → ') ?? null,
        onPress: () => navigation.navigate('DetalleProcesion', { procesionId: p.id }),
      })),
      ...eventos.map((e) => {
        const dia = diaPorFecha.get(e.fecha) ?? null;
        return {
          id: e.id,
          categoria: 'evento',
          nombre: e.nombre,
          diaId: dia?.id ?? null,
          diaNombre: dia?.nombre ?? null,
          hora: e.hora,
          estado: e.estado,
          cofradiaNombre: cofradiasPorId[e.cofradiaId],
          rutaTexto: e.ubicacion?.direccion ?? null,
          onPress: null,
        };
      }),
    ];

    const textoNormalizado = texto.trim().toLowerCase();
    const filtroEstado = FILTROS_ESTADO.find((f) => f.id === estadoFiltroId);

    return items
      .filter((item) => !textoNormalizado || item.nombre.toLowerCase().includes(textoNormalizado))
      .filter((item) => diaFiltroId === 'todos' || item.diaId === diaFiltroId)
      .filter((item) => !filtroEstado || filtroEstado.valores.includes(item.estado))
      .sort((a, b) => (a.hora ?? '').localeCompare(b.hora ?? ''));
  }, [procesiones, eventos, cofradiasPorId, idPorNombreDia, diaPorFecha, texto, diaFiltroId, estadoFiltroId, navigation]);

  // Los pasos no tienen día ni estado: solo aparecen cuando no hay ningún
  // filtro de ese tipo activo (si no, un filtro por día/estado nunca los cumplirían).
  const resultadosPasos = useMemo(() => {
    if (diaFiltroId !== 'todos' || estadoFiltroId) return [];
    const textoNormalizado = texto.trim().toLowerCase();
    return pasos.filter((p) => !textoNormalizado || p.nombre.toLowerCase().includes(textoNormalizado));
  }, [pasos, texto, diaFiltroId, estadoFiltroId]);

  function alternarFiltroEstado(id) {
    setEstadoFiltroId((actual) => (actual === id ? null : id));
  }

  if (!ciudadSeleccionada) return null;

  const sinResultados = resultados.length === 0 && resultadosPasos.length === 0;

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Buscar</Text>

        <View style={styles.searchRow}>
          <View style={styles.searchInputWrapper}>
            <SearchInput value={texto} onChangeText={setTexto} placeholder="Procesiones, pasos, eventos, ..." />
          </View>
          <TouchableOpacity style={styles.filtroButton} onPress={() => setFiltrosVisibles((actual) => !actual)}>
            <Ionicons name="options-outline" size={20} color={colors.background} />
          </TouchableOpacity>
        </View>

        {filtrosVisibles ? (
          <>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
              <TouchableOpacity
                style={[styles.chip, diaFiltroId === 'todos' && styles.chipActivo]}
                onPress={() => setDiaFiltroId('todos')}
              >
                <Text style={[styles.chipTexto, diaFiltroId === 'todos' && styles.chipTextoActivo]}>
                  Todos los días
                </Text>
              </TouchableOpacity>
              {diasSemanaSanta.map((dia) => {
                const activo = diaFiltroId === dia.id;
                return (
                  <TouchableOpacity
                    key={dia.id}
                    style={[styles.chip, activo && styles.chipActivo]}
                    onPress={() => setDiaFiltroId(dia.id)}
                  >
                    <Text style={[styles.chipTexto, activo && styles.chipTextoActivo]}>
                      {ABREVIATURA_DIA[dia.id] ?? dia.nombre}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
              {FILTROS_ESTADO.map((filtro) => {
                const activo = estadoFiltroId === filtro.id;
                return (
                  <TouchableOpacity
                    key={filtro.id}
                    style={[styles.chip, activo && styles.chipActivo]}
                    onPress={() => alternarFiltroEstado(filtro.id)}
                  >
                    <Text style={[styles.chipTexto, activo && styles.chipTextoActivo]}>{filtro.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </>
        ) : null}

        {resultados.map((item) => (
          <ProcesionCard
            key={`${item.categoria}-${item.id}`}
            titulo={item.nombre}
            subtitulo={item.cofradiaNombre}
            dia={item.diaNombre}
            hora={item.hora}
            ruta={item.rutaTexto}
            badge={item.categoria === 'evento' ? <StatusBadge estado="EVENTO" /> : <StatusBadge estado={item.estado} />}
            esFavorito={esFavorito(item.id, item.categoria)}
            onToggleFavorito={() => alternarFavorito(item.id, item.categoria)}
            mostrarChevron={Boolean(item.onPress)}
            onPress={item.onPress}
          />
        ))}

        {resultadosPasos.length > 0 ? (
          <>
            <Text style={styles.sectionTitle}>Pasos</Text>
            {resultadosPasos.map((paso) => (
              <PasoListItem
                key={paso.id}
                label={paso.tipo}
                title={paso.nombre}
                onPress={() => navigation.navigate('DetallePaso', { pasoId: paso.id })}
              />
            ))}
          </>
        ) : null}

        {sinResultados ? <Text style={styles.empty}>No se encontraron resultados.</Text> : null}
      </ScrollView>
    </ScreenContainer>
  );
}
