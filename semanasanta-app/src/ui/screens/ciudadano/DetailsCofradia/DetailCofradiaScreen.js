import { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  ScreenContainer,
  InfoSection,
  LinkBox,
  ProcesionCard,
  PasoListItem,
  StatusBadge,
} from '../../../components/common';
import {
  getCofradiaPorId,
  getProcesionesPorCofradia,
  getEventosPorCofradia,
  getPasosPorCofradia,
} from '../../../../data/services';
import { useFavoritos } from '../../../../application/context';
import { colors } from '../../../../theme';
import { styles } from './DetailCofradiaScreen.styles';

export function DetalleCofradiaScreen({ route, navigation }) {
  const { cofradiaId } = route.params;
  const { esFavorito, alternarFavorito } = useFavoritos();
  const [cofradia, setCofradia] = useState(null);
  const [procesiones, setProcesiones] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [pasos, setPasos] = useState([]);

  useEffect(() => {
    navigation.setOptions({
      headerTintColor: colors.subtitle,
      headerTitleAlign: 'center',
      headerBackground: () => <View style={styles.headerBackground} />,
      headerTitle: () => (
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>Detalles</Text>
        </View>
      ),
      headerRight: () => <Ionicons name="heart-outline" size={22} color={colors.subtitle} />,
    });
  }, []);

  useEffect(() => {
    getCofradiaPorId(cofradiaId).then((data) => {
      setCofradia(data);
      if (!data) return;
      getProcesionesPorCofradia(cofradiaId).then(setProcesiones);
      getEventosPorCofradia(cofradiaId).then(setEventos);
      getPasosPorCofradia(cofradiaId).then(setPasos);
    });
  }, [cofradiaId]);

  if (!cofradia) return null;

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{cofradia.nombre}</Text>

        <InfoSection title="Historia">
          <Text style={styles.body}>{cofradia.historia}</Text>
        </InfoSection>

        {cofradia.webOficial ? (
          <InfoSection title="Web oficial">
            <LinkBox url={cofradia.webOficial} />
          </InfoSection>
        ) : null}

        {procesiones.length > 0 || eventos.length > 0 ? (
          <>
            <Text style={styles.sectionTitle}>Procesiones y eventos</Text>
            {procesiones.map((procesion) => (
              <ProcesionCard
                key={procesion.id}
                titulo={procesion.nombre}
                subtitulo={cofradia.nombre}
                dia={procesion.dia}
                hora={procesion.horaSalida}
                ruta={procesion.recorrido?.puntos.map((punto) => punto.nombre).join(' → ')}
                badge={<StatusBadge estado={procesion.estado} />}
                esFavorito={esFavorito(procesion.id, 'procesion')}
                onToggleFavorito={() => alternarFavorito(procesion.id, 'procesion')}
                onPress={() => navigation.navigate('DetalleProcesion', { procesionId: procesion.id })}
              />
            ))}
            {eventos.map((evento) => (
              <ProcesionCard
                key={evento.id}
                titulo={evento.nombre}
                subtitulo={cofradia.nombre}
                dia={evento.dia}
                hora={evento.hora}
                badge={<StatusBadge estado={evento.estado} />}
                esFavorito={esFavorito(evento.id, 'evento')}
                onToggleFavorito={() => alternarFavorito(evento.id, 'evento')}
                onPress={() => navigation.navigate('DetalleEvento', { eventoId: evento.id })}
              />
            ))}
          </>
        ) : null}

        {pasos.length > 0 ? (
          <>
            <Text style={styles.sectionTitle}>Pasos</Text>
            {pasos.map((paso) => (
              <PasoListItem
                key={paso.id}
                label={paso.tipo}
                title={paso.nombre}
                esFavorito={esFavorito(paso.id, 'paso')}
                onToggleFavorito={() => alternarFavorito(paso.id, 'paso')}
                onPress={() => navigation.navigate('DetallePaso', { pasoId: paso.id })}
              />
            ))}
          </>
        ) : null}
      </ScrollView>
    </ScreenContainer>
  );
}
