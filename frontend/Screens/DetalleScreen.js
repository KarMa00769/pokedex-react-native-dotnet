import { useEffect, useState } from 'react';
import { ActivityIndicator, Button, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { getPokemon } from '../services/pokemonService';

export default function DetalleScreen({ route }) {
  const { id } = route.params;
  const [pokemon, setPokemon] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  async function cargarPokemon() {
    setCargando(true);
    setError('');
    try {
      const datos = await getPokemon(id);
      setPokemon(datos);
    } catch {
      setError('No se pudo cargar el detalle. Revisa tu conexión y que el backend esté encendido.');
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarPokemon();
  }, [id]);

  if (cargando) return <ActivityIndicator style={styles.estado} size="large" />;
  if (error) return (
    <View style={styles.estado}>
      <Text>{error}</Text>
      <Button title="Reintentar" onPress={cargarPokemon} />
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>#{pokemon.id} {pokemon.name}</Text>
      {pokemon.sprites.front_default && (
        <Image source={{ uri: pokemon.sprites.front_default }} style={styles.imagen} />
      )}
      <Text style={styles.dato}>Altura: {pokemon.height / 10} m</Text>
      <Text style={styles.dato}>Peso: {pokemon.weight / 10} kg</Text>
      <Text style={styles.subtitulo}>Tipos</Text>
      {pokemon.types.map((tipo) => (
        <Text style={styles.dato} key={tipo.type.name}>{tipo.type.name}</Text>
      ))}
      <Text style={styles.subtitulo}>Habilidades</Text>
      {pokemon.abilities.map((habilidad) => (
        <Text style={styles.dato} key={habilidad.ability.name}>{habilidad.ability.name}</Text>
      ))}
      <Text style={styles.subtitulo}>Estadísticas</Text>
      {pokemon.stats.map((dato) => (
        <Text style={styles.dato} key={dato.stat.name}>{dato.stat.name}: {dato.base_stat}</Text>
      ))}
      <Text style={styles.fuente}>Datos: PokeAPI</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#f3f4f6' },
  estado: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  titulo: { fontSize: 26, fontWeight: 'bold', textTransform: 'capitalize' },
  imagen: { width: 200, height: 200, alignSelf: 'center' },
  subtitulo: { fontSize: 20, fontWeight: 'bold', marginTop: 20, marginBottom: 8 },
  dato: { fontSize: 16, marginBottom: 6 },
  fuente: { marginTop: 24, color: '#555' },
});
