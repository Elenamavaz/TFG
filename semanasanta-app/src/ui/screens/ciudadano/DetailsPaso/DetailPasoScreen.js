import { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { common } from '../../../components';
import { services } from '../../../../data';
import { colors } from '../../../../theme';
import { styles } from './DetailPasoScreen.styles';

export function DetallePasoScreen({ route, navigation }) {
  const { pasoId } = route.params;
  const [paso, setPaso] = useState(null);
  // Error al cargar (sin conexión, bug 27) y reintentos desde AvisoError.
  const [errorCarga, setErrorCarga] = useState(null);
  const [intentoCarga, setIntentoCarga] = useState(0);
  const [cofradiaNombre, setCofradiaNombre] = useState(null);

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
      headerRight: () => <common.FavoritoCabecera id={pasoId} tipo="paso" />,
    });
  }, []);

  useEffect(() => {
    setErrorCarga(null);
    services.getPasoPorId(pasoId)
      .then((data) => {
        setPaso(data);
        if (!data) return;
        // .catch: Paso sigue en mock (pendiente de conectar, ver memoria del
        // TFG) y su cofradiaId no es un id real -getCofradiaPorId sí lo es
        // desde el 2026-08-15, así que fallará hasta que también se conecte;
        // que no muestre nombre de cofradía es mejor que una promesa rechazada
        // sin capturar.
        services.getCofradiaPorId(data.cofradiaId)
          .then((cofradia) => setCofradiaNombre(cofradia?.nombre))
          .catch(() => setCofradiaNombre(null));
      })
      .catch((err) => setErrorCarga(err.message));
  }, [pasoId, intentoCarga]);

  if (errorCarga) {
    return (
      <common.ScreenContainer>
        <common.AvisoError pantallaCompleta mensaje={errorCarga} onReintentar={() => setIntentoCarga((n) => n + 1)} />
      </common.ScreenContainer>
    );
  }
  if (!paso) {
    return (
      <common.ScreenContainer>
        <common.PantallaCargando />
      </common.ScreenContainer>
    );
  }

  return (
    <common.ScreenContainer>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerRow}>
          <View style={styles.headerText}>
            <Text style={styles.title}>{paso.nombre}</Text>
            {cofradiaNombre ? <Text style={styles.subtitle}>{cofradiaNombre}</Text> : null}
          </View>
          <common.ImagenRemota uri={paso.imagen} style={styles.imagen} placeholderStyle={styles.imagePlaceholder} />
        </View>

        {paso.historia ? (
          <common.InfoSection title="Historia y Origen">
            <Text style={styles.body}>{paso.historia}</Text>
          </common.InfoSection>
        ) : null}

        {paso.analisisArtistico ? (
          <common.InfoSection title="Análisis Artístico y Detalles">
            <Text style={styles.body}>{paso.analisisArtistico}</Text>
          </common.InfoSection>
        ) : null}
      </ScrollView>
    </common.ScreenContainer>
  );
}
