import { useEffect, useState } from 'react';
import { ActivityIndicator, Button, FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { getPokemones } from '../services/pokemonService';

export default function InicioScreen({ navigation }) {
  const [pokemones, setPokemones] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  async function cargarPokemones() {
    setCargando(true);
    setError('');
    try {
      const datos = await getPokemones();
      // La lista trae nombre y URL. Sacamos el número de esa URL.
      const lista = datos.map((pokemon) => ({
        id: pokemon.url.split('/')[6],
        nombre: pokemon.name,
      }));
      setPokemones(lista);
    } catch {
      setError('No se pudieron cargar los Pokémon. Revisa tu conexión y que el backend esté encendido con la dirección correcta.');
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarPokemones();
  }, []);

  const listaFiltrada = pokemones.filter((pokemon) =>
    pokemon.nombre.includes(busqueda.trim().toLowerCase()) || pokemon.id === busqueda.trim()
  );

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Mi Pokédex</Text>
      <Text>Los primeros 151 Pokémon</Text>
      <TextInput
        style={styles.input}
        placeholder="Buscar por nombre o número"
        accessibilityLabel="Buscar Pokémon"
        value={busqueda}
        onChangeText={setBusqueda}
        autoCapitalize="none"
        autoCorrect={false}
      />
      {cargando ? <ActivityIndicator size="large" /> : error ? (
        <View>
          <Text style={styles.mensaje}>{error}</Text>
          <Button title="Reintentar" onPress={cargarPokemones} />
        </View>
      ) : (
        <>
          <Text style={styles.mensaje}>Mostrando {listaFiltrada.length} de {pokemones.length}</Text>
          <FlatList
            data={listaFiltrada}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={<Text>No se encontró ese Pokémon.</Text>}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.card}
                accessibilityRole="button"
                onPress={() => navigation.navigate('Detalle', { id: item.id })}
              >
                <Image
                  source={{ uri: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/' + item.id + '.png' }}
                  style={styles.imagen}
                />
                <Text style={styles.nombre}>#{item.id} {item.nombre}</Text>
              </TouchableOpacity>
            )}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f3f4f6' },
  titulo: { fontSize: 26, fontWeight: 'bold', marginBottom: 8 },
  input: { backgroundColor: 'white', borderWidth: 1, borderColor: '#aaa', padding: 10, marginVertical: 15, borderRadius: 5 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 10, marginBottom: 10, borderRadius: 8 },
  imagen: { width: 70, height: 70, marginRight: 10 },
  nombre: { fontSize: 18, textTransform: 'capitalize', flex: 1 },
  mensaje: { marginBottom: 12 },
});
