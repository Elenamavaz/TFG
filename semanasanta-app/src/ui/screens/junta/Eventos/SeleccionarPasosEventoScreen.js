import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getEventoPorId, getPasosPorCofradia, actualizarEvento } from '../../../../data/services';
import { ScreenContainer } from '../../../components/common';
import { colors } from '../../../../theme';
import { styles } from './SeleccionarPasosEventoScreen.styles';

// Equivalente para Evento de SeleccionarPasosScreen (junta/Procesiones,
// 2026-08-23): "los eventos también pueden tener pasos", no es exclusivo de
// las procesiones -ver Evento.java, la relación con Paso vive ahora en la
// clase base. Misma lógica, sin fechaInicio/fechaFin/recorridoId (Evento no
// los tiene, esos son propios de Procesion).
export function SeleccionarPasosEventoScreen({ route, navigation }) {
  const { eventoId, ciudadId } = route.params;

  const [cargando, setCargando] = useState(true);
  const [nombreEvento, setNombreEvento] = useState('');
  const [datosBase, setDatosBase] = useState(null);
  const [pasosDisponibles, setPasosDisponibles] = useState([]);
  const [seleccionados, setSeleccionados] = useState([]);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    navigation.setOptions({
      headerTintColor: colors.subtitle,
      headerTitleStyle: { color: colors.textPrimary },
      title: 'Pasos del evento',
    });
  }, [navigation]);

  useEffect(() => {
    getEventoPorId(eventoId).then(async (evento) => {
      const porCofradia = await Promise.all(evento.cofradiaIds.map((id) => getPasosPorCofradia(id)));
      setNombreEvento(evento.nombre);
      setPasosDisponibles(porCofradia.flat());
      setSeleccionados(evento.pasoIds);
      setDatosBase({
        nombre: evento.nombre,
        historia: evento.historia,
        tradicion: evento.tradicion,
        fecha: evento.fecha,
        cofradiaIds: evento.cofradiaIds,
        ubicacionId: evento.ubicacionId,
        web: evento.web,
      });
      setCargando(false);
    });
  }, [eventoId]);

  function alternarPaso(pasoId) {
    setSeleccionados((actual) => (actual.includes(pasoId) ? actual.filter((id) => id !== pasoId) : [...actual, pasoId]));
  }

  async function guardar() {
    if (guardando) return;
    setError(null);
    setGuardando(true);
    try {
      await actualizarEvento(eventoId, { ...datosBase, pasosIds: seleccionados });
      navigation.navigate('Eventos', { ciudadId });
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  if (cargando) {
    return (
      <ScreenContainer style={styles.cargando}>
        <ActivityIndicator color={colors.gold} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.subtitle}>{nombreEvento}</Text>
        <Text style={styles.ayuda}>Elige qué pasos de las cofradías participantes desfilan en este evento.</Text>

        {pasosDisponibles.length === 0 ? (
          <Text style={styles.empty}>Las cofradías de este evento todavía no tienen pasos creados.</Text>
        ) : (
          pasosDisponibles.map((paso) => {
            const marcado = seleccionados.includes(paso.id);
            return (
              <TouchableOpacity key={paso.id} style={styles.fila} onPress={() => alternarPaso(paso.id)} activeOpacity={0.8}>
                <Ionicons
                  name={marcado ? 'checkbox' : 'square-outline'}
                  size={22}
                  color={marcado ? colors.gold : colors.subtitle}
                />
                <Text style={styles.filaTexto}>{paso.nombre}</Text>
              </TouchableOpacity>
            );
          })
        )}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.boton, guardando && styles.botonDeshabilitado]}
          onPress={guardar}
          activeOpacity={0.85}
          disabled={guardando}
        >
          {guardando ? <ActivityIndicator color={colors.background} /> : <Text style={styles.botonTexto}>Guardar</Text>}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelarButton}
          onPress={() => navigation.navigate('Eventos', { ciudadId })}
          activeOpacity={0.85}
          disabled={guardando}
        >
          <Text style={styles.cancelarTexto}>Hacerlo más tarde</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenContainer>
  );
}
