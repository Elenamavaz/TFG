import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { context } from './src/application';
import { RootNavigator } from './src/ui/navigation/RootNavigator';
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

  return (
    <View style={styles.container}>
      <PersistQueryClientProvider client={cache.queryClient} persistOptions={cache.persistOptions}>
        <context.AuthProvider>
          <context.CiudadProvider>
            <context.DiaProvider>
              <context.FavoritosProvider>
                <context.CofradeProvider>
                  <NavigationContainer>
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
