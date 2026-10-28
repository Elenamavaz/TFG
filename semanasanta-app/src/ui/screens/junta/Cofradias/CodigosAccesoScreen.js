import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { ActivityIndicator, Alert, ScrollView, Share, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { services } from '../../../../data';
import { models } from '../../../../data';
import { common } from '../../../components';
import { colors } from '../../../../theme';
import { styles } from './CodigosAccesoScreen.styles';
import { QrCodigoModal, formatearFechaHora } from './QrCodigoModal';

// Mismo patrón de badge que EstadoBadge en Procesiones/Eventos. EMITIDO y
// VALIDADO valen igual para entrar (el código no se gasta); la diferencia
// solo informa de si alguien lo ha usado ya.
const BADGE_POR_ESTADO = {
  [models.EstadoCodigo.EMITIDO]: { etiqueta: 'Sin usar', background: colors.backgroundOrange, texto: colors.orangeText },
  [models.EstadoCodigo.VALIDADO]: { etiqueta: 'En uso', background: colors.greenBackground, texto: colors.lightGreenText },
  [models.EstadoCodigo.REVOCADO]: { etiqueta: 'Revocado', background: colors.backgroundRed, texto: colors.redText },
};
const BADGE_CADUCADO = { etiqueta: 'Caducado', background: colors.surfaceAlt, texto: colors.subtitle };

// Códigos de acceso de una cofradía (2026-10-02, sin mockup): era el hueco
// que impedía usar la geolocalización -los endpoints existían, pero la Junta
// no tenía dónde generar un código para dárselo a sus cofrades. Se llega
// desde "Elementos de la cofradia" en FormularioCofradiaScreen. "Compartir"
// usa el Share nativo (WhatsApp, correo...), sin librería nueva. Los
// revocados y caducados se quedan abajo, plegados: no sirven, pero son
// historial.
//
// QR (2026-10-25): "Ver QR" muestra el código como QR, con el texto del
// código debajo, para ponerlo en la iglesia el día de la procesión (en
// pantalla, o impreso a partir de una captura). El cofrade lo escanea al
// iniciar sesión, o escribe el texto si no puede usar la cámara: las dos
// vías llevan al mismo POST /auth/codigo-acceso. Cada código caduca 24 horas
// después de generarse.
export function CodigosAccesoScreen({ route, navigation }) {
  const { cofradiaId } = route.params;
  const [cofradia, setCofradia] = useState(null);
  const [codigos, setCodigos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [generando, setGenerando] = useState(false);
  const [revocandoId, setRevocandoId] = useState(null);
  const [verRevocados, setVerRevocados] = useState(false);
  const [codigoQr, setCodigoQr] = useState(null); // código cuyo QR se está mostrando, o null
  const [error, setError] = useState(null);

  useEffect(() => {
    navigation.setOptions({
      headerTintColor: colors.subtitle,
      headerTitleStyle: { color: colors.textPrimary },
      title: 'Códigos de acceso',
    });
  }, [navigation]);

  const cargar = useCallback(() => {
    Promise.all([services.getCofradiaPorId(cofradiaId), services.getCodigosAccesoDeCofradia(cofradiaId)])
      .then(([cofradiaCargada, lista]) => {
        setCofradia(cofradiaCargada);
        setCodigos(lista);
      })
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }, [cofradiaId]);

  useFocusEffect(cargar);

  async function generar() {
    if (generando) return;
    setGenerando(true);
    setError(null);
    try {
      const nuevo = await services.emitirCodigoAcceso(cofradiaId);
      setCodigos((actuales) => [nuevo, ...actuales]);
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerando(false);
    }
  }

  function compartir(codigo) {
    Share.share({
      message:
        `Código de acceso de ${cofradia?.nombre ?? 'tu cofradía'}: ${codigo.codigo}\n\n` +
        'Entra en la app con él (Iniciar sesión → pestaña Cofrade) y, durante la procesión, ' +
        `pulsa "Activar ubicación compartida". Sirve hasta el ${formatearFechaHora(codigo.fechaExpiracion)}.`,
    });
  }

  function confirmarRevocar(codigo) {
    Alert.alert(
      'Revocar código',
      `El código ${codigo.codigo} dejará de servir para entrar como cofrade. Quien lo esté usando dejará de compartir su ubicación en ese momento. Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Revocar',
          style: 'destructive',
          onPress: async () => {
            setRevocandoId(codigo.id);
            setError(null);
            try {
              const revocado = await services.revocarCodigoAcceso(codigo.id);
              setCodigos((actuales) => actuales.map((c) => (c.id === revocado.id ? revocado : c)));
            } catch (err) {
              setError(err.message);
            } finally {
              setRevocandoId(null);
            }
          },
        },
      ]
    );
  }

  if (cargando) {
    return (
      <common.ScreenContainer style={styles.cargando}>
        <ActivityIndicator color={colors.gold} />
      </common.ScreenContainer>
    );
  }

  const activos = codigos.filter((c) => c.activo);
  const inactivos = codigos.filter((c) => !c.activo);

  return (
    <common.ScreenContainer>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Códigos de acceso</Text>
        <Text style={styles.subtitle}>{cofradia ? cofradia.nombre : ''}</Text>
        <Text style={styles.explicacion}>
          Genera el código el mismo día de la procesión y muestra su QR a los cofrades que vayan a compartir su
          ubicación. Un mismo código puede usarlo más de una persona y sirve durante 24 horas, o hasta que lo revoques.
        </Text>

        <TouchableOpacity
          style={[styles.generarButton, generando && styles.botonDeshabilitado]}
          onPress={generar}
          activeOpacity={0.85}
          disabled={generando}
        >
          {generando ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <>
              <Ionicons name="key-outline" size={18} color={colors.background} />
              <Text style={styles.generarTexto}>Generar código</Text>
            </>
          )}
        </TouchableOpacity>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Text style={styles.sectionTitle}>Códigos activos</Text>
        {activos.map((codigo) => (
          <CodigoCard
            key={codigo.id}
            codigo={codigo}
            revocando={revocandoId === codigo.id}
            onVerQr={() => setCodigoQr(codigo)}
            onCompartir={() => compartir(codigo)}
            onRevocar={() => confirmarRevocar(codigo)}
          />
        ))}
        {activos.length === 0 ? (
          <Text style={styles.empty}>No hay códigos activos. Genera uno para dárselo a tus cofrades.</Text>
        ) : null}

        {inactivos.length > 0 ? (
          <>
            <TouchableOpacity style={styles.revocadosToggle} onPress={() => setVerRevocados((v) => !v)} activeOpacity={0.8}>
              <Text style={styles.sectionTitleSinMargen}>Revocados y caducados ({inactivos.length})</Text>
              <Ionicons name={verRevocados ? 'chevron-up' : 'chevron-down'} size={16} color={colors.subtitle} />
            </TouchableOpacity>
            {verRevocados ? inactivos.map((codigo) => <CodigoCard key={codigo.id} codigo={codigo} />) : null}
          </>
        ) : null}
      </ScrollView>

      <QrCodigoModal codigo={codigoQr} nombreCofradia={cofradia?.nombre} onCerrar={() => setCodigoQr(null)} />
    </common.ScreenContainer>
  );
}

function CodigoCard({ codigo, revocando = false, onVerQr, onCompartir, onRevocar }) {
  const caducado = codigo.estado !== models.EstadoCodigo.REVOCADO && codigo.caducado;
  const badge = caducado ? BADGE_CADUCADO : BADGE_POR_ESTADO[codigo.estado];
  return (
    <View style={[styles.card, !codigo.activo && styles.cardRevocada]}>
      <View style={styles.cardHeader}>
        <Text style={[styles.codigo, !codigo.activo && styles.codigoRevocado]} selectable>
          {codigo.codigo}
        </Text>
        <View style={[styles.badge, { backgroundColor: badge.background }]}>
          <Text style={[styles.badgeTexto, { color: badge.texto }]}>{badge.etiqueta}</Text>
        </View>
      </View>
      {codigo.fechaExpiracion && codigo.estado !== models.EstadoCodigo.REVOCADO ? (
        <Text style={styles.caducidad}>
          {caducado ? 'Caducó' : 'Caduca'} el {formatearFechaHora(codigo.fechaExpiracion)}
        </Text>
      ) : null}
      {codigo.activo ? (
        <View style={styles.cardAcciones}>
          <TouchableOpacity style={styles.accion} onPress={onVerQr}>
            <Ionicons name="qr-code-outline" size={15} color={colors.gold} />
            <Text style={styles.accionCompartir}>Ver QR</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.accion} onPress={onCompartir}>
            <Ionicons name="share-outline" size={15} color={colors.gold} />
            <Text style={styles.accionCompartir}>Compartir</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.accion} onPress={onRevocar} disabled={revocando}>
            {revocando ? (
              <ActivityIndicator size="small" color={colors.redText} />
            ) : (
              <>
                <Ionicons name="close-circle-outline" size={15} color={colors.redText} />
                <Text style={styles.accionRevocar}>Revocar</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
}
