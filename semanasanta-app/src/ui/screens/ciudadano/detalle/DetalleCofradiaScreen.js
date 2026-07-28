import { useEffect, useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { ScreenContainer } from '../../../components/common/ScreenContainer';
import { ListItemCard } from '../../../components/common/ListItemCard';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { getCofradiaPorId } from '../../../../data/services/cofradiaService';
import { getProcesionPorId } from '../../../../data/services/procesionService';
import { getPasosPorIds } from '../../../../data/services/pasoService';
import { colors, fontFamilies, spacing } from '../../../../theme';

export function DetalleCofradiaScreen({ route, navigation }) {
  const { cofradiaId } = route.params;
  const [cofradia, setCofradia] = useState(null);
  const [procesiones, setProcesiones] = useState([]);
  const [pasos, setPasos] = useState([]);

  useEffect(() => {
    getCofradiaPorId(cofradiaId).then((data) => {
      setCofradia(data);
      if (!data) return;
      navigation.setOptions({ title: data.nombre });
      Promise.all(data.procesionIds.map((id) => getProcesionPorId(id))).then((lista) =>
        setProcesiones(lista.filter(Boolean))
      );
      getPasosPorIds(data.pasoIds).then(setPasos);
    });
  }, [cofradiaId]);

  if (!cofradia) return null;

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{cofradia.nombre}</Text>

        <Text style={styles.sectionTitle}>Historia</Text>
        <Text style={styles.body}>{cofradia.historia}</Text>

        {cofradia.webOficial ? (
          <>
            <Text style={styles.sectionTitle}>Web oficial</Text>
            <TouchableOpacity onPress={() => Linking.openURL(cofradia.webOficial)}>
              <Text style={styles.link}>{cofradia.webOficial}</Text>
            </TouchableOpacity>
          </>
        ) : null}

        {procesiones.length > 0 ? (
          <>
            <Text style={styles.sectionTitle}>Procesiones</Text>
            {procesiones.map((procesion) => (
              <ListItemCard
                key={procesion.id}
                title={procesion.nombre}
                subtitle={`${procesion.dia} · ${procesion.horaSalida}`}
                badge={<StatusBadge estado={procesion.estado} />}
                onPress={() => navigation.navigate('DetalleProcesion', { procesionId: procesion.id })}
              />
            ))}
          </>
        ) : null}

        {pasos.length > 0 ? (
          <>
            <Text style={styles.sectionTitle}>Pasos</Text>
            {pasos.map((paso) => (
              <ListItemCard
                key={paso.id}
                title={paso.nombre}
                subtitle={paso.tipo}
                onPress={() => navigation.navigate('DetallePaso', { pasoId: paso.id })}
              />
            ))}
          </>
        ) : null}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  title: {
    color: colors.textPrimary,
    fontFamily: fontFamilies.titleBold,
    fontSize: 28,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    color: colors.gold,
    fontFamily: fontFamilies.titleSemiBold,
    fontSize: 18,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  body: {
    color: colors.cream,
    fontFamily: fontFamilies.bodyRegular,
    fontSize: 14,
    lineHeight: 20,
  },
  link: {
    color: colors.gold,
    fontFamily: fontFamilies.uiRegular,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
