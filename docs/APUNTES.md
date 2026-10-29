# Guía para el cuaderno: Pokédex

Escribe a mano las explicaciones y los fragmentos de lógica. No es necesario
copiar los estilos ni todo el código. Agrega dibujos o fotos de las dos pantallas.

## 1. Qué hace la aplicación

La aplicación consulta nuestro backend .NET usando GET. El backend consulta
PokeAPI también con GET. Muestra los primeros 151 Pokémon,
permite buscarlos por nombre o número y consultar su detalle. GET sirve para
pedir información al servidor. No se usa POST, PUT ni DELETE.

## 2. Archivos y pantallas

Los archivos de React Native están dentro de `frontend/`.
`index.js` inicia la app. `App.js` contiene un Stack de React Navigation con
`InicioScreen` y `DetalleScreen`. `config/axiosConfig.js` configura Axios.
`services/pokemonService.js` contiene las consultas. `package.json` declara las
librerías y `app.json` contiene la configuración de Expo.

En `backend/Program.cs` se crean las rutas GET con `MapGet`, se configura
`HttpClient`, CORS y Swagger. `backend/Models/ListaPokemon.cs` representa
la respuesta de la lista; `backend/Models/Pokemon.cs` representa el detalle.
`backend/PokedexApi.csproj` indica .NET 10 y la dependencia de Swagger.
`backend/Properties/launchSettings.json` configura el puerto 5201.
`backend/PokedexApi.http` contiene ejemplos para probar las rutas.

La pantalla inicial tiene el título, buscador y lista. El detalle contiene imagen,
nombre, altura, peso, tipos, habilidades y estadísticas. La flecha superior regresa.

## 3. Endpoints usados

El frontend llama a nuestro backend:

- `GET http://IP_DE_LA_MAC:5201/getPokemones`: devuelve un arreglo de 151 registros.
- `GET http://IP_DE_LA_MAC:5201/pokemon/{id}`: devuelve el detalle, por ejemplo `/pokemon/25`.

El backend llama a los servicios externos:

- `GET https://pokeapi.co/api/v2/pokemon?limit=151&offset=0`.
- `GET https://pokeapi.co/api/v2/pokemon/{id}`.

La app usa Axios y la dirección de `EXPO_PUBLIC_API_URL` en `.env.local`.
En un celular físico se usa la IP local de la Mac, no `localhost`, porque
`localhost` en Android se refiere al propio celular.

Las imágenes de la lista se cargan desde los sprites oficiales de PokeAPI:
`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/{id}.png`.
La imagen del detalle se obtiene del campo `sprites.front_default`.

## 4. Modelo de la respuesta

Modelo reducido de lo que recibe .NET desde PokeAPI:

```js
{
  count: 1350, // Total ilustrativo; puede cambiar.
  next: "...",
  previous: null,
  results: [
    { name: "bulbasaur", url: "https://pokeapi.co/api/v2/pokemon/1/" }
  ]
}
```

El modelo `ListaPokemon` solo lee `results`; los demás campos no se utilizan.
Nuestro backend devuelve directamente ese arreglo. El frontend recibe:

```js
[
  { name: "bulbasaur", url: "https://pokeapi.co/api/v2/pokemon/1/" }
]
```

El arreglo real contiene 151 elementos. El detalle también se reduce a los
campos definidos en las clases de `Models/Pokemon.cs`.

Detalle, solamente los campos usados y un elemento por arreglo:

```js
{
  id: 1,
  name: "bulbasaur",
  height: 7,
  weight: 69,
  sprites: { front_default: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png" },
  types: [{ type: { name: "grass", url: "..." } }],
  abilities: [{ ability: { name: "overgrow", url: "..." } }],
  stats: [{ base_stat: 45, stat: { name: "hp", url: "..." } }]
}
```

`height` está en decímetros y `weight` en hectogramos. Se divide entre 10 para
mostrar metros y kilogramos. Los puntos suspensivos representan URLs omitidas.
Los campos adicionales de PokeAPI se omiten al convertirlos al modelo de .NET.

## 5. Consulta asíncrona

En `frontend/services/pokemonService.js`:

```js
export async function getPokemones() {
  const respuesta = await apiClient.get('/getPokemones');
  return respuesta.data;
}
```

`async` indica que la función devuelve una promesa. `await` espera la respuesta
sin bloquear la interfaz. Axios hace GET, interpreta el JSON y lo guarda en
`respuesta.data`. Se devuelve el arreglo que envía nuestro backend .NET.

## 6. Guardar y mapear información

En `frontend/Screens/InicioScreen.js`, estos fragmentos pertenecen al componente:

```js
const [pokemones, setPokemones] = useState([]);

const datos = await getPokemones();
const lista = datos.map((pokemon) => ({
  id: pokemon.url.split('/')[6],
  nombre: pokemon.name,
}));
setPokemones(lista);
```

`useState` guarda información en memoria mientras se usa la pantalla. No se
guarda en archivos ni en una base de datos. `map` transforma cada respuesta
en un objeto sencillo. `split('/')` separa la URL; la posición 6 contiene el ID.
Por ejemplo, Bulbasaur queda como `{ id: '1', nombre: 'bulbasaur' }`.
`setPokemones` actualiza el estado y React vuelve a dibujar la lista.

## 7. Carga, errores y useEffect

```js
useEffect(() => {
  cargarPokemones();
}, []);
```

El arreglo vacío indica que se carga al montar la pantalla. `cargarPokemones`
usa `try` para hacer la petición, `catch` para mostrar un error y `finally`
para quitar el indicador de carga, haya funcionado o no. Reintentar llama de
nuevo a la misma función. La consulta de detalle se hace al abrir la pantalla
y se repite si cambia el ID, por eso su efecto usa `[id]`.

## 8. Búsqueda y visualización

```js
const listaFiltrada = pokemones.filter((pokemon) =>
  pokemon.nombre.includes(busqueda.trim().toLowerCase()) ||
  pokemon.id === busqueda.trim()
);
```

`filter` conserva las coincidencias. `trim` quita espacios de los extremos,
`toLowerCase` convierte a minúsculas e `includes` encuentra parte del nombre.
También se compara el número. Esta búsqueda es local y no hace otro GET.
`FlatList` muestra los elementos con `renderItem`; `keyExtractor` usa el ID.
En el detalle se usa `map` para convertir tipos, habilidades y estadísticas
en componentes `Text`, cada uno con una clave `key`.

## 9. Navegación

```js
navigation.navigate('Detalle', { id: item.id });
const { id } = route.params;
const datos = await getPokemon(id);
setPokemon(datos);
```

Las líneas pertenecen a dos pantallas: la primera abre el detalle desde Inicio;
las otras reciben el ID y guardan su respuesta en Detalle. El Stack administra
el regreso. `TouchableOpacity` recibe el toque, `Image` muestra una URL y
`ScrollView` permite desplazar los datos del detalle.

Referencia: [documentación oficial de PokeAPI](https://pokeapi.co/docs/v2).

## 10. GET y async/await en el backend

Fragmento del endpoint de lista en `backend/Program.cs`:

```csharp
app.MapGet("/getPokemones", async (IHttpClientFactory factory) =>
{
    var client = factory.CreateClient("PokeAPI");
    var datos = await client.GetFromJsonAsync<ListaPokemon>(
        "pokemon?limit=151&offset=0");
    return Results.Ok(datos!.Results);
});
```

Es un fragmento reducido para explicar la lógica; el archivo real comprueba
nulos y maneja errores. `MapGet` registra una ruta GET. `CreateClient` obtiene
el cliente configurado con la URL base de PokeAPI y un tiempo de espera de
10 segundos. `await` espera la consulta sin bloquear el hilo. `GetFromJsonAsync`
hace GET y convierte el JSON a una clase. `Results.Ok` responde con código 200
y convierte el arreglo a JSON para React Native.

Para el detalle se hace lo mismo usando `GetFromJsonAsync<Pokemon>("pokemon/" + id)`.
Se valida que el ID esté entre 1 y 151. Si no existe se responde 404. Un problema
al consultar PokeAPI devuelve 502; un tiempo de espera agotado devuelve 504.
`try` contiene la consulta y `catch` maneja cada error.

## 11. Clases del modelo y configuración

En `backend/Models/ListaPokemon.cs`:

```csharp
public class ListaPokemon
{
    public List<Recurso> Results { get; set; } = new();
}

public class Recurso
{
    public string Name { get; set; } = "";
    public string Url { get; set; } = "";
}
```

Cada propiedad representa un campo del JSON. `List<Recurso>` es un arreglo de
recursos con nombre y URL. Se reutiliza `Recurso` dentro de tipos, habilidades
y estadísticas. No es una tabla ni una base de datos.

En el modelo de detalle:

```csharp
[JsonPropertyName("front_default")]
public string? FrontDefault { get; set; }
```

`JsonPropertyName` relaciona el nombre de C# con el nombre exacto del campo JSON.
Se hace lo mismo con `base_stat`. El signo `?` permite que la imagen sea nula.
El resto de las propiedades se serializa en camelCase: `Name` se envía como `name`.

`AddHttpClient` registra el cliente HTTP. CORS permite que el frontend web
consuma nuestra API desde otro origen; se habilita una política abierta para
esta práctica. Swagger permite probar las rutas desde `/swagger` en desarrollo.

La conexión intenta primero las direcciones IPv4 de PokeAPI, porque algunas
redes anuncian IPv6 sin tener salida a internet. El certificado HTTPS se valida
normalmente. Si una dirección falla, se intenta con las otras disponibles.

El backend no almacena Pokémon permanentemente: consulta PokeAPI en cada
petición. React Native guarda los resultados temporalmente con `useState`.
Por eso deben estar encendidos ambos procesos, Expo y .NET.
