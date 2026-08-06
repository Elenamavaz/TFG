import { useEffect, useMemo, useState } from 'react';
import { FlatList, Text, TouchableOpacity } from 'react-native';
import { ScreenContainer, SearchInput } from '../../../components/common';
import { useCiudad } from '../../../../application/context';
import { getCiudades, guardarCiudadId } from '../../../../data/services';
import { styles } from './SeleccionCiudadScreen.styles';

export function SeleccionCiudadScreen({ navigation }) {
  const { seleccionarCiudad } = useCiudad();
  const [ciudades, setCiudades] = useState([]);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    getCiudades().then(setCiudades);
  }, []);

  const ciudadesFiltradas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    if (!texto) return ciudades;
    return ciudades.filter((ciudad) => ciudad.nombre.toLowerCase().includes(texto));
  }, [ciudades, busqueda]);

  function onSeleccionar(ciudad) {
    seleccionarCiudad(ciudad);
    guardarCiudadId(ciudad.id);
    navigation.replace('MainTabs');
  }

  return (
    <ScreenContainer style={styles.container}>
      <Text style={styles.eyebrow}>España · 2027</Text>
      <Text style={styles.title}>Semana Santa</Text>
      <Text style={styles.subtitle}>Elige tu ciudad para comenzar</Text>

      <SearchInput value={busqueda} onChangeText={setBusqueda} placeholder="Buscar ciudad..." />

      <FlatList
        data={ciudadesFiltradas}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => onSeleccionar(item)} activeOpacity={0.8}>
            <Text style={styles.cardTitle}>{item.nombre}</Text>
            <Text style={styles.cardMeta}>{item.numProcesiones} procesiones</Text>
          </TouchableOpacity>
        )}
      />
    </ScreenContainer>
  );
}
