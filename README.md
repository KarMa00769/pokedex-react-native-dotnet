# Pokédex: React Native y .NET

Proyecto sencillo basado en `my-app-blackiechan/Moviles/MiApi`.
El frontend consulta nuestra API y el backend obtiene los datos de PokeAPI:

```text
React Native --GET--> ASP.NET Core (.NET 10) --GET--> PokeAPI
```

## Carpetas

```text
Pokedex/
├── frontend/                Aplicación Expo con JavaScript
│   ├── Screens/             Inicio y detalle
│   ├── services/            Consultas a nuestro backend
│   ├── config/axiosConfig.js  Axios y dirección del backend
│   ├── App.js               Navegación
│   ├── index.js             Inicio de Expo
│   ├── app.json             Configuración de Expo
│   ├── .env.example         Ejemplo de dirección para Android físico
│   └── package*.json        Dependencias y comandos
├── backend/
│   ├── Models/              Clases que representan el JSON
│   ├── Properties/          Puerto y perfil de ejecución
│   ├── Program.cs           HttpClient, CORS, Swagger y las dos rutas GET
│   ├── PokedexApi.csproj    Proyecto .NET 10
│   └── PokedexApi.http      Peticiones de ejemplo
├── docs/APUNTES.md          Guía para el cuaderno
└── README.md
```

`node_modules`, `.expo` y `dist` quedan dentro de `frontend`.
`bin` y `obj` los genera .NET dentro de `backend`. Todos están ignorados por Git.
No se utiliza base de datos: el servidor consulta PokeAPI y la app guarda los
resultados temporalmente con `useState`.

## Ejecutar el backend

Se necesita el SDK de .NET 10. En una terminal:

```bash
cd ~/github/university/desarrollo-web-dotnet/Pokedex/backend
dotnet run
```

Escucha en el puerto **5201**, en todas las interfaces para permitir el acceso
por Wi-Fi desde Android. La dirección `0.0.0.0` sirve para escuchar, no para
escribirla en el celular.

Swagger en desarrollo: <http://localhost:5201/swagger>.
Mantén esta terminal abierta mientras usas el frontend.

## Ejecutar el frontend

En otra terminal:

```bash
cd ~/github/university/desarrollo-web-dotnet/Pokedex/frontend
npx expo start
```

Las dependencias ya están instaladas en esta Mac. Solo si copias el proyecto
y no tienes `node_modules`, ejecuta primero `npm ci` para instalarlas.
Para el uso diario basta con `npx expo start`. Expo usa el puerto **8081**.

### Android físico con Expo Go

1. Conecta la Mac y Android a la misma red Wi-Fi.
2. Consulta la IP de la Mac: `ipconfig getifaddr en0` (Wi-Fi).
3. En `frontend`, copia `.env.example` a `.env.local`.
4. Cambia el valor por la IP real. Ejemplo:

   ```env
   EXPO_PUBLIC_API_URL=http://192.168.1.100:5201
   ```

5. Comprueba desde el navegador del celular que abre
   `http://IP_DE_LA_MAC:5201/getPokemones`.
6. Ejecuta `npx expo start` y escanea el QR con Expo Go compatible con el SDK del proyecto.
7. Si cambias `.env.local`, recarga completamente la app. Si no toma la dirección,
   reinicia con `npx expo start --clear`.

El firewall debe permitir la conexión al backend. Un túnel de Expo solo comunica
con Expo; el celular también necesita alcanzar el backend en el puerto 5201.

### Emulador o navegador

Sin `.env.local`, el frontend usa `http://10.0.2.2:5201` en el emulador oficial de
Android y `http://localhost:5201` en navegador. Para navegador: `npx expo start --web`.
Si existe `.env.local`, su dirección tiene prioridad en todas las plataformas.

## Endpoints

| Quién consulta | Método y ruta | Respuesta |
| --- | --- | --- |
| Frontend → .NET | `GET /getPokemones` | Arreglo de 151 objetos con `name` y `url` |
| Frontend → .NET | `GET /pokemon/{id}` | Detalle del Pokémon, ID del 1 al 151 |
| .NET → PokeAPI | `GET https://pokeapi.co/api/v2/pokemon?limit=151&offset=0` | Objeto con `results` |
| .NET → PokeAPI | `GET https://pokeapi.co/api/v2/pokemon/{id}` | Datos del Pokémon |

Las URLs de los sprites se siguen cargando directamente como imágenes desde
PokeAPI/GitHub. Los datos de lista y detalle pasan por nuestro backend.
La búsqueda por nombre o número filtra los 151 resultados en el frontend.

El servidor responde `404` para IDs fuera de 1–151, `502` si no puede consultar
PokeAPI o interpretar sus datos, y `504` si supera el tiempo de espera.
En esos casos devuelve un objeto con `mensaje`. La app muestra un aviso y permite
reintentar. No tiene datos locales de respaldo: necesita internet en el servidor.

## Entrega

Prueba la lista, búsqueda, detalle y regreso en un Android. Escribe a mano los
fragmentos y las explicaciones de `docs/APUNTES.md`, agrega las pantallas y sube
las fotos o el PDF de tu cuaderno. Generar el bundle no equivale a instalar un APK.

Referencias: [PokeAPI](https://pokeapi.co/docs/v2),
[Minimal APIs de .NET](https://learn.microsoft.com/aspnet/core/fundamentals/minimal-apis),
[variables de entorno en Expo](https://docs.expo.dev/guides/environment-variables/).

## Estado de la verificación

- Backend: `dotnet build` completó con 0 errores y 0 advertencias.
- Frontend: se generaron los bundles de Android (Hermes) y web sin errores.
- Con un servidor temporal de prueba se verificaron los 151 registros, la forma
  del detalle de Pikachu y Mew, CORS y respuestas 404 para IDs fuera de rango.
  Se probó también en navegador la lista, búsqueda y detalle a través de .NET.
  Los datos simulados de estas pruebas no se incluyen en la aplicación.
- Swagger publica las dos rutas GET.
- En la red actual se verificaron las respuestas reales de PokeAPI: 151 Pokémon
  y los detalles de Pikachu y Mew. Como esta red tiene problemas de conexión
  IPv6, el backend intenta IPv4 primero. HTTPS mantiene su validación habitual.
- La instalación y prueba en un dispositivo Android sigue pendiente.

En esta Mac se dejó `frontend/.env.local` con la IP local al configurar la app.
Actualiza esa IP si cambias de red. Si el puerto 8081 está ocupado, puedes iniciar
Expo con `npx expo start --port 8083`; no es necesario detener otra aplicación.
