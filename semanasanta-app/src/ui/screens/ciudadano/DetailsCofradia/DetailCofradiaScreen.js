import { useEffect, useState } from 'react';
import { Image, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { common } from '../../../components';
import { services } from '../../../../data';
import { context } from '../../../../application';
import { colors } from '../../../../theme';
import { styles } from './DetailCofradiaScreen.styles';

export function DetalleCofradiaScreen({ route, navigation }) {
  const { cofradiaId } = route.params;
  const { esFavorito, alternarFavorito } = context.useFavoritos();
  const { data: cofradia = null } = useQuery({
    queryKey: ['cofradia', cofradiaId],
    queryFn: () => services.getCofradiaPorId(cofradiaId),
  });
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
    if (!cofradia) return;
    // Procesion/Evento/Paso siguen en mock (ver memoria del TFG, pendiente
    // de conectar): cofradiaId real de esta cofradía no va a encontrar
    // coincidencias en esos mocks, así que estas listas saldrán vacías hasta
    // que también se conecten.
    services.getProcesionesPorCofradia(cofradiaId).then(setProcesiones);
    services.getEventosPorCofradia(cofradiaId).then(setEventos);
    services.getPasosPorCofradia(cofradiaId).then(setPasos);
  }, [cofradia, cofradiaId]);

  if (!cofradia) return null;

  return (
    <common.ScreenContainer>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerRow}>
          <View style={styles.headerText}>
            <Text style={styles.title}>{cofradia.nombre}</Text>
          </View>
          {cofradia.imagen ? (
            <Image source={{ uri: cofradia.imagen }} style={styles.imagen} resizeMode="cover" />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="image-outline" size={22} color={colors.subtitle} />
            </View>
          )}
        </View>

        <common.InfoSection title="Historia">
          <Text style={styles.body}>{cofradia.historia}</Text>
        </common.InfoSection>

        {cofradia.web ? (
          <common.InfoSection title="Web oficial">
            <common.LinkBox url={cofradia.web} />
          </common.InfoSection>
        ) : null}

        {procesiones.length > 0 || eventos.length > 0 ? (
          <>
            <Text style={styles.sectionTitle}>Procesiones y eventos</Text>
            {procesiones.map((procesion) => (
              <common.ProcesionCard
                key={procesion.id}
                titulo={procesion.nombre}
                subtitulo={cofradia.nombre}
                dia={procesion.dia}
                hora={procesion.horaSalida}
                ruta={procesion.recorrido?.puntos.map((punto) => punto.nombre).join(' → ')}
                badge={<common.StatusBadge estado={procesion.estado} />}
                esFavorito={esFavorito(procesion.id, 'procesion')}
                onToggleFavorito={() => alternarFavorito(procesion.id, 'procesion')}
                onPress={() => navigation.navigate('DetalleProcesion', { procesionId: procesion.id })}
              />
            ))}
            {eventos.map((evento) => (
              <common.ProcesionCard
                key={evento.id}
                titulo={evento.nombre}
                subtitulo={cofradia.nombre}
                dia={evento.dia}
                hora={evento.hora}
                badge={<common.StatusBadge estado={evento.estado} />}
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
              <common.PasoListItem
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
    </common.ScreenContainer>
  );
}
