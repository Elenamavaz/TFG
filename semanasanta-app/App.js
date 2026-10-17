import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { context } from './src/application';
import { RootNavigator } from './src/ui/navigation/RootNavigator';
import { navigationRef } from './src/ui/navigation/navigationRef';
import { colors } from './src/theme';
import { fontsToLoad } from './src/theme';
import { cache } from './src/infrastructure';
import { services } from './src/data';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded] = useFonts(fontsToLoad);

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  // Una sola vez por arranque, no depende de fontsLoaded ni de nada más -ver
  // pushService.js.
  useEffect(() => {
    services.configurarManejoNotificaciones();
  }, []);

  if (!fontsLoaded) return null;

  // SafeAreaProvider en la raíz: ScreenContainer usa el SafeAreaView de
  // react-native-safe-area-context, que lo necesita -en web falla sin él, y
  // la pantalla de carga de RootNavigator se pinta antes que cualquier
  // navegador que pudiera aportarlo.
  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <PersistQueryClientProvider client={cache.queryClient} persistOptions={cache.persistOptions}>
          <context.AuthProvider>
            <context.CiudadProvider>
              <context.DiaProvider>
                <context.FavoritosProvider>
                  <context.CofradeProvider>
                    <NavigationContainer ref={navigationRef}>
                      <RootNavigator />
                    </NavigationContainer>
                  </context.CofradeProvider>
                </context.FavoritosProvider>
              </context.DiaProvider>
            </context.CiudadProvider>
          </context.AuthProvider>
        </PersistQueryClientProvider>
        <StatusBar style="light" />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
