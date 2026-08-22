import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { CiudadProvider } from './src/application/context/CiudadContext';
import { DiaProvider } from './src/application/context/DiaContext';
import { FavoritosProvider } from './src/application/context/FavoritosContext';
import { AuthProvider } from './src/application/context/AuthContext';
import { CofradeProvider } from './src/application/context/CofradeContext';
import { RootNavigator } from './src/ui/navigation/RootNavigator';
import { colors, fontsToLoad } from './src/theme';
import { queryClient, persistOptions } from './src/infrastructure/api/queryClient';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded] = useFonts(fontsToLoad);

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <View style={styles.container}>
      <PersistQueryClientProvider client={queryClient} persistOptions={persistOptions}>
        <AuthProvider>
          <CiudadProvider>
            <DiaProvider>
              <FavoritosProvider>
                <CofradeProvider>
                  <NavigationContainer>
                    <RootNavigator />
                  </NavigationContainer>
                </CofradeProvider>
              </FavoritosProvider>
            </DiaProvider>
          </CiudadProvider>
        </AuthProvider>
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
