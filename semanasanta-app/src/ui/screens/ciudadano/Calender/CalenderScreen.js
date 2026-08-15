import { useEffect, useMemo, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer, AgendaItemCard } from '../../../components/common';
import { useCiudad, useDia, useFavoritos } from '../../../../application/context';
import {
  getProcesionesPorCiudad,
  getEventosPorCiudad,
  getCofradiasPorCiudad,
  getDiasSemanaSanta,
} from '../../../../data/services';
import { formatearDuracion, MESES, DIAS_SEMANA_CORTOS, DIAS_SEMANA_LARGOS } from '../../../utils/tiempo';
import { obtenerMatrizMes, obtenerSemanaDe, obtenerIndiceSemana, formatearFechaISO } from '../../../utils/calendario';
import { colors } from '../../../../theme';
import { styles } from './CalenderScreen.styles';

const HIT_SLOP = { top: 8, bottom: 8, left: 8, right: 8 };

function capitalizar(texto) {
  return `${texto.charAt(0).toUpperCase()}${texto.slice(1)}`;
}

function mesDeFecha(fechaISO) {
  const [anio, mes] = fechaISO.split('-').map(Number);
  return { anio, mesIndex: mes - 1 };
}

function formatearResumenDia(diaSemanaSanta, fechaISO, agenda) {
  const [anio, mes, dia] = fechaISO.split('-').map(Number);
  const nombreDia = diaSemanaSanta
    ? diaSemanaSanta.nombre
    : DIAS_SEMANA_LARGOS[obtenerIndiceSemana(new Date(anio, mes - 1, dia))];

  const numProcesiones = agenda.filter((item) => item.categoria === 'procesion').length;
  const numEventos = agenda.filter((item) => item.categoria === 'evento').length;
  const partes = [];
  if (numProcesiones > 0) partes.push(`${numProcesiones} procesión${numProcesiones === 1 ? '' : 'es'}`);
  if (numEventos > 0) partes.push(`${numEventos} evento${numEventos === 1 ? '' : 's'}`);

  return `${nombreDia} · ${dia} ${MESES[mes - 1]} · ${partes.length > 0 ? partes.join(' · ') : 'sin agenda'}`;
}

export function CalendarioScreen({ navigation }) {
  const { ciudadSeleccionada } = useCiudad();
  const { diaSeleccionado: diaHome } = useDia();

  const [mesActual, setMesActual] = useState(null);
  const [diaAgenda, setDiaAgenda] = useState(null);
  const [diasSemanaSanta, setDiasSemanaSanta] = useState([]);
  const [procesiones, setProcesiones] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [cofradiasPorId, setCofradiasPorId] = useState({});
  const { esFavorito, alternarFavorito } = useFavoritos();

  useEffect(() => {
    getDiasSemanaSanta().then((lista) => {
      setDiasSemanaSanta(lista);
      setMesActual((actual) => {
        if (actual) return actual;
        if (diaHome) return mesDeFecha(diaHome.fecha);
        return lista.length > 0 ? mesDeFecha(lista[0].fecha) : actual;
      });
    });
  }, [diaHome]);

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
    });
  }, [ciudadSeleccionada]);

  const diasConAgenda = useMemo(() => {
    const nombrePorFecha = new Map(diasSemanaSanta.map((d) => [d.nombre, d.fecha]));
    const fechas = new Set();
    procesiones.forEach((p) => {
      const fecha = nombrePorFecha.get(p.dia);
      if (fecha) fechas.add(fecha);
    });
    eventos.forEach((e) => fechas.add(e.fecha));
    return fechas;
  }, [procesiones, eventos, diasSemanaSanta]);

  const matrizMes = useMemo(
    () => (mesActual ? obtenerMatrizMes(mesActual.anio, mesActual.mesIndex) : []),
    [mesActual]
  );

  const semanaDeAgenda = useMemo(() => (diaAgenda ? obtenerSemanaDe(diaAgenda) : []), [diaAgenda]);

  const diaSemanaSantaDeAgenda = useMemo(
    () => diasSemanaSanta.find((d) => d.fecha === diaAgenda) ?? null,
    [diasSemanaSanta, diaAgenda]
  );

  const agendaDelDia = useMemo(() => {
    if (!diaAgenda) return [];
    const procesionesDelDia = diaSemanaSantaDeAgenda
      ? procesiones.filter((p) => p.dia === diaSemanaSantaDeAgenda.nombre)
      : [];
    const eventosDelDia = eventos.filter((e) => e.fecha === diaAgenda);
    // Un evento/procesión puede tener varias cofradías participantes (N:M
    // real en el backend): se muestran todas, separadas por coma.
    const nombresDeCofradias = (cofradiaIds) =>
      cofradiaIds.map((id) => cofradiasPorId[id]).filter(Boolean).join(', ');

    return [
      ...procesionesDelDia.map((p) => ({
        ...p,
        categoria: 'procesion',
        cofradiaNombre: nombresDeCofradias(p.cofradiaIds),
      })),
      ...eventosDelDia.map((e) => ({
        ...e,
        categoria: 'evento',
        horaSalida: e.hora,
        cofradiaNombre: nombresDeCofradias(e.cofradiaIds),
      })),
    ].sort((a, b) => (a.horaSalida ?? '').localeCompare(b.horaSalida ?? ''));
  }, [diaAgenda, diaSemanaSantaDeAgenda, procesiones, eventos, cofradiasPorId]);

  function cambiarMes(delta) {
    setMesActual((actual) => {
      if (!actual) return actual;
      const fecha = new Date(actual.anio, actual.mesIndex + delta, 1);
      return { anio: fecha.getFullYear(), mesIndex: fecha.getMonth() };
    });
  }

  function alternarDia(fecha) {
    setDiaAgenda((actual) => (actual === fecha ? null : fecha));
  }

  function cambiarSemana(deltaDias) {
    setDiaAgenda((actual) => {
      if (!actual) return actual;
      const [anio, mes, dia] = actual.split('-').map(Number);
      return formatearFechaISO(new Date(anio, mes - 1, dia + deltaDias));
    });
  }

  function volverAlMes() {
    setDiaAgenda(null);
  }

  function abrirAgendaItem(item) {
    if (item.categoria === 'procesion') {
      navigation.navigate('DetalleProcesion', { procesionId: item.id });
    }
    if (item.categoria === 'evento') {
      navigation.navigate('DetalleEvento', { eventoId: item.id });
    }
  }

  if (!ciudadSeleccionada || !mesActual) return null;

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Calendario</Text>
        <Text style={styles.subtitle}>{ciudadSeleccionada.nombre} · Semana Santa</Text>

        {diaAgenda ? (
          <>
            <TouchableOpacity style={styles.volverButton} onPress={volverAlMes} hitSlop={HIT_SLOP}>
              <Ionicons name="calendar-outline" size={16} color={colors.gold} />
              <Text style={styles.volverTexto}>Volver al calendario</Text>
            </TouchableOpacity>

            <View style={styles.semanaNavRow}>
              <TouchableOpacity onPress={() => cambiarSemana(-7)} hitSlop={HIT_SLOP}>
                <Ionicons name="chevron-back" size={20} color={colors.gold} />
              </TouchableOpacity>

              <View style={styles.semanaRow}>
                {semanaDeAgenda.map((celda, indice) => {
                  const seleccionada = celda.fecha === diaAgenda;
                  return (
                    <TouchableOpacity
                      key={celda.fecha}
                      style={[styles.semanaCelda, seleccionada && styles.semanaCeldaActiva]}
                      onPress={() => alternarDia(celda.fecha)}
                    >
                      <Text style={[styles.semanaLetra, seleccionada && styles.semanaTextoActivo]}>
                        {DIAS_SEMANA_CORTOS[indice]}
                      </Text>
                      <Text style={[styles.semanaNumero, seleccionada && styles.semanaTextoActivo]}>
                        {celda.numero}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TouchableOpacity onPress={() => cambiarSemana(7)} hitSlop={HIT_SLOP}>
                <Ionicons name="chevron-forward" size={20} color={colors.gold} />
              </TouchableOpacity>
            </View>

            <Text style={styles.resumenDia}>
              {formatearResumenDia(diaSemanaSantaDeAgenda, diaAgenda, agendaDelDia)}
            </Text>

            {agendaDelDia.length > 0 ? (
              agendaDelDia.map((item) => (
                <AgendaItemCard
                  key={`${item.categoria}-${item.id}`}
                  titulo={item.nombre}
                  subtitulo={item.cofradiaNombre}
                  hora={item.horaSalida}
                  duracion={item.duracionMin ? formatearDuracion(item.duracionMin) : null}
                  esFavorito={esFavorito(item.id, item.categoria)}
                  onToggleFavorito={() => alternarFavorito(item.id, item.categoria)}
                  onPress={() => abrirAgendaItem(item)}
                />
              ))
            ) : (
              <Text style={styles.empty}>No hay procesiones ni eventos registrados este día.</Text>
            )}
          </>
        ) : (
          <>
            <View style={styles.mesRow}>
              <TouchableOpacity onPress={() => cambiarMes(-1)} hitSlop={HIT_SLOP}>
                <Ionicons name="chevron-back" size={20} color={colors.gold} />
              </TouchableOpacity>
              <Text style={styles.mesTitulo}>
                {capitalizar(MESES[mesActual.mesIndex])} {mesActual.anio}
              </Text>
              <TouchableOpacity onPress={() => cambiarMes(1)} hitSlop={HIT_SLOP}>
                <Ionicons name="chevron-forward" size={20} color={colors.gold} />
              </TouchableOpacity>
            </View>

            <View style={styles.diasSemanaRow}>
              {DIAS_SEMANA_CORTOS.map((letra, indice) => (
                <Text key={`${letra}-${indice}`} style={styles.diaSemanaLetra}>
                  {letra}
                </Text>
              ))}
            </View>

            {matrizMes.map((semana, indiceSemana) => (
              <View key={indiceSemana} style={styles.semanaGridRow}>
                {semana.map((celda, indiceCelda) => {
                  if (!celda) return <View key={indiceCelda} style={styles.diaCelda} />;
                  const tieneAgenda = diasConAgenda.has(celda.fecha);
                  const esDiaDeHome = celda.fecha === diaHome?.fecha;
                  return (
                    <TouchableOpacity
                      key={celda.fecha}
                      style={[styles.diaCelda, esDiaDeHome && styles.diaCeldaActiva]}
                      onPress={() => alternarDia(celda.fecha)}
                      disabled={!tieneAgenda}
                    >
                      <Text style={[styles.diaNumero, esDiaDeHome && styles.diaNumeroActivo]}>{celda.numero}</Text>
                      {tieneAgenda ? (
                        <View style={[styles.puntoAgenda, esDiaDeHome && styles.puntoAgendaActivo]} />
                      ) : null}
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}

            <View style={styles.leyendaRow}>
              <View style={styles.puntoAgenda} />
              <Text style={styles.leyendaTexto}>Día con procesiones · toca para ver la agenda</Text>
            </View>
          </>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
