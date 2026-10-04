// app.json sigue siendo la configuración base de Expo; esto solo le añade lo
// que no puede ir escrito en un repositorio público (2026-10-03): la API key
// de Google Maps para Android, que se lee de la variable de entorno
// GOOGLE_MAPS_API_KEY -en las builds de EAS, la variable secreta creada con
// `eas env:create`; en local, un .env.local (ignorado por git).
//
// iOS no la necesita: react-native-maps usa Apple Maps por defecto allí.
module.exports = ({ config }) => {
  const androidGoogleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;
  // Solo se avisa en los servidores de EAS (EAS_BUILD=true), que es donde la
  // clave se mete en el APK. En local (npm start) la variable secreta nunca
  // está disponible y no hace falta: Metro solo sirve el JavaScript.
  if (!androidGoogleMapsApiKey && process.env.EAS_BUILD) {
    console.warn('[app.config] Falta GOOGLE_MAPS_API_KEY: el mapa de Android se verá en blanco.');
  }
  return {
    ...config,
    plugins: [...(config.plugins ?? []), ['react-native-maps', { androidGoogleMapsApiKey }]],
  };
};
