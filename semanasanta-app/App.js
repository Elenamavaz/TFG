import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { CiudadProvider } from './src/application/context/CiudadContext';
import { DiaProvider } from './src/application/context/DiaContext';
import { RootNavigator } from './src/ui/navigation/RootNavigator';
import { colors, fontsToLoad } from './src/theme';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded] = useFonts(fontsToLoad);

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <View style={styles.container}>
      <CiudadProvider>
        <DiaProvider>
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
        </DiaProvider>
      </CiudadProvider>
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
