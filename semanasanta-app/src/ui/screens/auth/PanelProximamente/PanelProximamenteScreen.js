import { ComingSoonScreen } from '../../../components/common';

// Destino tras un login correcto de Junta/Administrador: el JWT ya está
// guardado de verdad (AuthContext + sesionService), pero el panel de cada
// rol todavía no existe (iteraciones 4/5 de la memoria del TFG) -no hay
// nada más que mostrar por ahora.
export function PanelProximamenteScreen() {
  return (
    <ComingSoonScreen
      icon="construct-outline"
      title="Panel en camino"
      description="Tu sesión ha entrado correctamente. El panel de Junta de Cofradía y Administrador llegará en una iteración posterior."
    />
  );
}
