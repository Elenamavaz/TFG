import { useMemo, useState } from 'react';
import { FlatList, Text, TouchableOpacity } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { common } from '../../../components';
import { context } from '../../../../application';
import { services } from '../../../../data';
import { orden } from '../../../utils';
import { colors } from '../../../../theme';
import { styles } from './SeleccionCiudadScreen.styles';

export function SeleccionCiudadScreen({ navigation }) {
  const { seleccionarCiudad } = context.useCiudad();
  const { data: ciudades = [] } = useQuery({ queryKey: ['ciudades'], queryFn: services.getCiudades });
  const [busqueda, setBusqueda] = useState('');

  const ciudadesFiltradas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    const filtradas = texto ? ciudades.filter((ciudad) => ciudad.nombre.toLowerCase().includes(texto)) : ciudades;
    return orden.ordenarPorNombre(filtradas);
  }, [ciudades, busqueda]);

  function onSeleccionar(ciudad) {
    seleccionarCiudad(ciudad);
    services.guardarCiudadId(ciudad.id);
    // Sin await (ver arranqueCiudadano.js): las notificaciones son por
    // ciudad, así que un cambio de ciudad a mano también hay que
    // reregistrarlo -no debe retrasar la navegación ni romperla si falla.
    services.registrarDispositivoPush(ciudad.id);
    navigation.replace('MainTabs');
  }

  // Si se llegó desde Inicio/Perfil ("cambiar ciudad"), volver es regresar
  // ahí. Si no (se acaba de elegir Ciudadano en la Bienvenida, o se arrancó
  // en modo Ciudadano sin ciudad guardada), no hay nada detrás: se vuelve a
  // la Bienvenida para elegir otro tipo de usuario, olvidando el modo
  // Ciudadano para que el próximo arranque tampoco se lo salte.
  async function onVolver() {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    await services.olvidarSesionLocal();
    navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
  }

  return (
    <common.ScreenContainer style={styles.container}>
      <TouchableOpacity style={styles.volver} onPress={onVolver} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Ionicons name="chevron-back" size={22} color={colors.subtitle} />
      </TouchableOpacity>

      <Text style={styles.eyebrow}>España · 2027</Text>
      <Text style={styles.title}>Semana Santa</Text>
      <Text style={styles.subtitle}>Elige tu ciudad para comenzar</Text>

      <common.SearchInput value={busqueda} onChangeText={setBusqueda} placeholder="Buscar ciudad..." />

      <FlatList
        data={ciudadesFiltradas}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => onSeleccionar(item)} activeOpacity={0.8}>
            <Text style={styles.cardTitle}>{item.nombre}</Text>
            <Text style={styles.cardMeta}>{item.comunidadAutonoma}</Text>
          </TouchableOpacity>
        )}
      />
    </common.ScreenContainer>
  );
}
