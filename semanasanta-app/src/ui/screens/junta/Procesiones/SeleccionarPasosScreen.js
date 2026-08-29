import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getProcesionPorId, getPasosPorCofradia, actualizarProcesion } from '../../../../data/services';
import { ScreenContainer } from '../../../components/common';
import { colors } from '../../../../theme';
import { styles } from './SeleccionarPasosScreen.styles';

// Pantalla a la que llevan los botones "Añadir pasos"/"Actualizar pasos" de
// ProcesionCreadaScreen/ProcesionActualizadaScreen (2026-08-23, hasta ahora
// deshabilitados con "Próximamente"): el backend ya soportaba esto
// (ProcesionRequest.pasosIds) desde el principio, solo faltaba una pantalla
// que lo usara -FormularioProcesionScreen siempre mandaba pasosIds: null.
//
// El PUT /procesiones/{id} sustituye TODO el recurso, no solo pasosIds -así
// que hay que reenviar el resto de campos tal cual están. En vez de volver a
// derivar fecha desde dia/horaSalida (como hace FormularioProcesionScreen,
// que parte de cero), se reutiliza fechaInicio ya en crudo del modelo
// Procesion: el propio FormularioProcesionScreen SIEMPRE guarda
// fecha == fechaInicio para una Procesion, así que es un valor seguro para
// los dos.
//
// pasoIds (no pasosIds): así se llama el campo en el modelo Procesion.js del
// cliente -no es un typo mío, ya estaba así.
export function SeleccionarPasosScreen({ route, navigation }) {
  const { procesionId, ciudadId } = route.params;

  const [cargando, setCargando] = useState(true);
  const [nombreProcesion, setNombreProcesion] = useState('');
  const [datosBase, setDatosBase] = useState(null);
  const [pasosDisponibles, setPasosDisponibles] = useState([]);
  const [seleccionados, setSeleccionados] = useState([]);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    navigation.setOptions({
      headerTintColor: colors.subtitle,
      headerTitleStyle: { color: colors.textPrimary },
      title: 'Pasos de la procesión',
    });
  }, [navigation]);

  useEffect(() => {
    getProcesionPorId(procesionId).then(async (procesion) => {
      const porCofradia = await Promise.all(procesion.cofradiaIds.map((id) => getPasosPorCofradia(id)));
      setNombreProcesion(procesion.nombre);
      setPasosDisponibles(porCofradia.flat());
      setSeleccionados(procesion.pasoIds);
      setDatosBase({
        nombre: procesion.nombre,
        historia: procesion.historia,
        tradicion: procesion.tradicion,
        fecha: procesion.fechaInicio,
        cofradiaIds: procesion.cofradiaIds,
        ubicacionId: procesion.ubicacionId,
        web: procesion.web,
        fechaInicio: procesion.fechaInicio,
        fechaFin: procesion.fechaFin,
        recorridoId: procesion.recorridoId,
      });
      setCargando(false);
    });
  }, [procesionId]);

  function alternarPaso(pasoId) {
    setSeleccionados((actual) => (actual.includes(pasoId) ? actual.filter((id) => id !== pasoId) : [...actual, pasoId]));
  }

  async function guardar() {
    if (guardando) return;
    setError(null);
    setGuardando(true);
    try {
      await actualizarProcesion(procesionId, { ...datosBase, pasosIds: seleccionados });
      navigation.navigate('Procesiones', { ciudadId });
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
        <Text style={styles.subtitle}>{nombreProcesion}</Text>
        <Text style={styles.ayuda}>Elige qué pasos de las cofradías participantes desfilan en esta procesión.</Text>

        {pasosDisponibles.length === 0 ? (
          <Text style={styles.empty}>Las cofradías de esta procesión todavía no tienen pasos creados.</Text>
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
          onPress={() => navigation.navigate('Procesiones', { ciudadId })}
          activeOpacity={0.85}
          disabled={guardando}
        >
          <Text style={styles.cancelarTexto}>Hacerlo más tarde</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenContainer>
  );
}
