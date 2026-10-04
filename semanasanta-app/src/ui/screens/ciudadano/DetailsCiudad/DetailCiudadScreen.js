import { useEffect } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { common } from '../../../components';
import { context } from '../../../../application';
import { services } from '../../../../data';
import { colors } from '../../../../theme';
import { styles } from './DetailCiudadScreen.styles';

// "Ver detalles" de la ciudad (icono de libro en HomeScreen, mockup del
// 2026-08-21): Historia + Patrimonio, mismos campos que ya edita la Junta/
// Admin en el panel (Ciudad.historia/patrimonio, ver backend). Sin "Web
// oficial"/"Contacta" del mockup -Ciudad no tiene esos campos todavía (a
// diferencia de Cofradia.web), se añaden el día que haga falta de verdad.
export function DetalleCiudadScreen({ navigation }) {
  const { ciudadSeleccionada } = context.useCiudad();
  const { data: ciudad } = useQuery({
    queryKey: ['ciudad', ciudadSeleccionada?.id],
    queryFn: () => services.getCiudadPorId(ciudadSeleccionada.id),
    enabled: !!ciudadSeleccionada,
  });

  useEffect(() => {
    navigation.setOptions({
      headerTintColor: colors.subtitle,
      headerTitleAlign: 'center',
      headerBackground: () => <View style={styles.headerBackground} />,
      headerTitle: () => (
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>Información</Text>
        </View>
      ),
    });
  }, [navigation]);

  if (!ciudad) return null;

  return (
    <common.ScreenContainer>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{ciudad.nombre}</Text>
        <Text style={styles.subtitle}>Historia, tradición y Semana Santa</Text>

        {ciudad.historia ? (
          <common.InfoSection title="Historia">
            <Text style={styles.body}>{ciudad.historia}</Text>
          </common.InfoSection>
        ) : null}

        {ciudad.patrimonio ? (
          <common.InfoSection title="Patrimonio">
            <Text style={styles.body}>{ciudad.patrimonio}</Text>
          </common.InfoSection>
        ) : null}
      </ScrollView>
    </common.ScreenContainer>
  );
}
