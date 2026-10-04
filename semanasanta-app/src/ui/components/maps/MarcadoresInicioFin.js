import { View } from 'react-native';
import { Marker } from 'react-native-maps';
import { styles } from './mapas.styles';

// Primer y último punto del recorrido (el orden del GPX importado o de la
// lista de puntos), marcados para que se distinga dónde sale y dónde acaba
// la procesión (2026-10-04, a petición de Elena): inicio dorado relleno,
// fin oscuro con borde dorado. Al tocarlos se ve el nombre del punto si lo
// tiene (p.ej. "Inicio – Iglesia de las Esclavas").
//
// Solo se importa desde los mapas .native.js (usa react-native-maps).
// "puntos": PuntoDeInteres con latitud/longitud, en orden.
export function MarcadoresInicioFin({ puntos }) {
  const conCoordenadas = puntos.filter((p) => p.latitud != null && p.longitud != null);
  if (conCoordenadas.length < 2) return null;
  const inicio = conCoordenadas[0];
  const fin = conCoordenadas[conCoordenadas.length - 1];

  return (
    <>
      <Marker
        coordinate={{ latitude: inicio.latitud, longitude: inicio.longitud }}
        title={inicio.nombre ?? 'Inicio'}
        anchor={{ x: 0.5, y: 0.5 }}
        zIndex={5}
      >
        <View style={styles.marcadorInicio} />
      </Marker>
      <Marker
        coordinate={{ latitude: fin.latitud, longitude: fin.longitud }}
        title={fin.nombre ?? 'Fin'}
        anchor={{ x: 0.5, y: 0.5 }}
        zIndex={5}
      >
        <View style={styles.marcadorFin} />
      </Marker>
    </>
  );
}
