import { createNavigationContainerRef } from '@react-navigation/native';

// Para navegar desde fuera de una pantalla: RootNavigator lo usa para volver
// al inicio de sesión cuando la sesión caduca en mitad del uso (bug 8 de
// bugs.md), sea cual sea el panel o la pantalla abierta en ese momento.
export const navigationRef = createNavigationContainerRef();
