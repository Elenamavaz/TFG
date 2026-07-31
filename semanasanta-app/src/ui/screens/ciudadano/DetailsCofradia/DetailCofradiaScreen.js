import { useEffect, useState } from 'react';
import { ScrollView, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  ScreenContainer,
  InfoSection,
  LinkBox,
  ProcesionCard,
  PasoListItem,
  StatusBadge,
} from '../../../components/common';
import { getCofradiaPorId, getProcesionPorId, getEventoPorId, getPasosPorIds } from '../../../../data/services';
import { colors } from '../../../../theme';
import { styles } from './DetailCofradiaScreen.styles';

export function DetalleCofradiaScreen({ route, navigation }) {
  const { cofradiaId } = route.params;
  const [cofradia, setCofradia] = useState(null);
  const [procesiones, setProcesiones] = useState([]);
  const [evento, setEvento] = useState(null);
  const [pasos, setPasos] = useState([]);

  useEffect(() => {
    navigation.setOptions({
      title: 'Detalles',
      headerRight: () => <Ionicons name="heart-outline" size={22} color={colors.gold} />,
    });
  }, []);

  useEffect(() => {
    getCofradiaPorId(cofradiaId).then((data) => {
      setCofradia(data);
      if (!data) return;
      Promise.all(data.procesionIds.map((id) => getProcesionPorId(id))).then((lista) =>
        setProcesiones(lista.filter(Boolean))
      );
      if (data.eventoId) getEventoPorId(data.eventoId).then(setEvento);
      getPasosPorIds(data.pasoIds).then(setPasos);
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

        {procesiones.length > 0 || evento ? (
          <>
            <Text style={styles.sectionTitle}>Procesiones y evento</Text>
            {procesiones.map((procesion) => (
              <ProcesionCard
                key={procesion.id}
                titulo={procesion.nombre}
                subtitulo={cofradia.nombre}
                dia={procesion.dia}
                hora={procesion.horaSalida}
                ruta={procesion.resumenRuta?.join(' → ')}
                badge={<StatusBadge estado={procesion.estado} />}
                onPress={() => navigation.navigate('DetalleProcesion', { procesionId: procesion.id })}
              />
            ))}
            {evento ? (
              <ProcesionCard
                titulo={evento.nombre}
                subtitulo={cofradia.nombre}
                badge={<StatusBadge estado={evento.estado} />}
                mostrarChevron={false}
              />
            ) : null}
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
                onPress={() => navigation.navigate('DetallePaso', { pasoId: paso.id })}
              />
            ))}
          </>
        ) : null}
      </ScrollView>
    </ScreenContainer>
  );
}
