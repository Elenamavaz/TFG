import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { ActivityIndicator, Modal, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { services } from '../../../../data';
import { common } from '../../../components';
import { orden } from '../../../utils';
import { colors } from '../../../../theme';
import { styles as base } from './CodigosAccesoScreen.styles';
import { styles } from './CodigosQrScreen.styles';
import { QrCodigoModal, formatearFechaHora } from './QrCodigoModal';

// "Códigos QR" del panel de Junta (2026-10-26, a petición de Elena): los
// códigos de acceso ACTIVOS de todas las cofradías de la ciudad en una sola
// lista, para sacar el QR el día de la procesión sin ir cofradía por
// cofradía. Tocar uno muestra su QR; "Nuevo código QR" pide la cofradía,
// genera el código y abre su QR directamente. Revocar o compartir sigue en
// los códigos de cada cofradía ("Gestionar").
export function CodigosQrScreen({ route, navigation }) {
  const { ciudadId } = route.params;
  const [cofradias, setCofradias] = useState([]);
  const [activos, setActivos] = useState([]); // [{ codigo, cofradia }]
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [elegirCofradia, setElegirCofradia] = useState(false);
  const [generando, setGenerando] = useState(false);
  const [qr, setQr] = useState(null); // { codigo, cofradia } cuyo QR se muestra

  useEffect(() => {
    navigation.setOptions({
      headerTintColor: colors.subtitle,
      headerTitleStyle: { color: colors.textPrimary },
      title: 'Códigos QR',
    });
  }, [navigation]);

  const cargar = useCallback(() => {
    setError(null);
    services
      .getCofradiasPorCiudad(ciudadId)
      .then(async (lista) => {
        const ordenadas = orden.ordenarPorNombre(lista);
        const codigosPorCofradia = await Promise.all(ordenadas.map((c) => services.getCodigosAccesoDeCofradia(c.id)));
        setCofradias(ordenadas);
        // Por cofradía (orden alfabético) y, dentro de cada una, el más reciente primero.
        setActivos(
          ordenadas.flatMap((cofradia, i) => codigosPorCofradia[i].filter((c) => c.activo).map((codigo) => ({ codigo, cofradia })))
        );
      })
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }, [ciudadId]);

  useFocusEffect(cargar);

  async function generar(cofradia) {
    setElegirCofradia(false);
    setGenerando(true);
    setError(null);
    try {
      const nuevo = await services.emitirCodigoAcceso(cofradia.id);
      setActivos((actuales) => [{ codigo: nuevo, cofradia }, ...actuales]);
      setQr({ codigo: nuevo, cofradia });
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerando(false);
    }
  }

  if (cargando) {
    return (
      <common.ScreenContainer style={base.cargando}>
        <ActivityIndicator color={colors.gold} />
      </common.ScreenContainer>
    );
  }

  return (
    <common.ScreenContainer>
      <ScrollView contentContainerStyle={base.container}>
        <Text style={base.title}>Códigos QR</Text>
        <Text style={base.explicacion}>
          Muestra el QR a los cofrades que vayan a compartir su ubicación, o pon una captura impresa en la iglesia. Cada
          código sirve 24 horas desde que se genera.
        </Text>

        <TouchableOpacity
          style={[base.generarButton, (generando || cofradias.length === 0) && base.botonDeshabilitado]}
          onPress={() => setElegirCofradia(true)}
          activeOpacity={0.85}
          disabled={generando || cofradias.length === 0}
        >
          {generando ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <>
              <Ionicons name="add" size={18} color={colors.background} />
              <Text style={base.generarTexto}>Nuevo código QR</Text>
            </>
          )}
        </TouchableOpacity>

        {error ? <common.AvisoError mensaje={error} onReintentar={cargar} /> : null}

        <Text style={base.sectionTitle}>Códigos activos</Text>
        {activos.map(({ codigo, cofradia }) => (
          <TouchableOpacity key={codigo.id} style={base.card} onPress={() => setQr({ codigo, cofradia })} activeOpacity={0.8}>
            <Text style={styles.cofradia} numberOfLines={2}>
              {cofradia.nombre}
            </Text>
            <View style={base.cardHeader}>
              <Text style={base.codigo}>{codigo.codigo}</Text>
              <Ionicons name="qr-code-outline" size={26} color={colors.gold} />
            </View>
            <Text style={base.caducidad}>Caduca el {formatearFechaHora(codigo.fechaExpiracion)}</Text>
            <TouchableOpacity
              style={styles.gestionar}
              onPress={() => navigation.navigate('CodigosAcceso', { cofradiaId: cofradia.id })}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={base.accionCompartir}>Compartir o revocar</Text>
              <Ionicons name="chevron-forward" size={14} color={colors.gold} />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
        {activos.length === 0 && !error ? (
          <Text style={base.empty}>No hay ningún código activo. Pulsa "Nuevo código QR" para crear uno.</Text>
        ) : null}
      </ScrollView>

      <Modal transparent visible={elegirCofradia} animationType="fade" onRequestClose={() => setElegirCofradia(false)}>
        <Pressable style={styles.overlay} onPress={() => setElegirCofradia(false)}>
          <View style={styles.modalLista}>
            <Text style={styles.modalTitulo}>¿Para qué cofradía?</Text>
            <ScrollView>
              {cofradias.map((cofradia) => (
                <TouchableOpacity key={cofradia.id} style={styles.modalItem} onPress={() => generar(cofradia)}>
                  <Text style={styles.modalItemTexto}>{cofradia.nombre}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>

      <QrCodigoModal codigo={qr?.codigo ?? null} nombreCofradia={qr?.cofradia.nombre} onCerrar={() => setQr(null)} />
    </common.ScreenContainer>
  );
}
