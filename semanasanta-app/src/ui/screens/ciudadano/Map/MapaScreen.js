import { ComingSoonScreen } from '../../../components/common';

// Versión web del Mapa en Vivo: react-native-maps solo funciona en
// Android/iOS (ver MapaScreen.native.js, que es la que usa el móvil -Metro
// la elige sola por la extensión .native). En el navegador se avisa.
export function MapaScreen() {
  return (
    <ComingSoonScreen
      icon="map-outline"
      title="Mapa en Vivo"
      description="El mapa en tiempo real de las procesiones está disponible en la app para Android e iOS."
    />
  );
}
