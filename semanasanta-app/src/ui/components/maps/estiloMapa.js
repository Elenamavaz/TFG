// Estilo oscuro de Google Maps (customMapStyle) con la paleta de la app
// -marrones casi negros y texto crema, ver theme/colors.js- en vez del gris
// azulado por defecto, para que el mapa no desentone con el resto de
// pantallas (mockup "Mapa en Vivo", 2026-10-03). Formato: Google Maps
// Platform "styling" JSON; se puede retocar con https://mapstyle.withgoogle.com.
export const estiloMapaOscuro = [
  { elementType: 'geometry', stylers: [{ color: '#241710' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#BFA88A' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#120A06' }] },
  { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#472F17' }] },
  { featureType: 'landscape.man_made', elementType: 'geometry', stylers: [{ color: '#2E1E14' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#2A1B12' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#9A7D60' }] },
  // Los comercios restan protagonismo a las procesiones: fuera. Iglesias,
  // monumentos y parques (resto de POI) se quedan.
  { featureType: 'poi.business', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#1F2A17' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#3A281C' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#1E1008' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#C9B597' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#4A3524' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#101820' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#5B6B78' }] },
];
