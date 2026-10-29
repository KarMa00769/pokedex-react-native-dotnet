using System.Net;
using System.Net.Sockets;
using System.Text.Json;
using PokedexApi.Models;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Igual que en MiApi: permitir las consultas del frontend durante la práctica.
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

// HttpClient hace las peticiones GET desde .NET hacia PokeAPI.
builder.Services.AddHttpClient("PokeAPI", client =>
{
    client.BaseAddress = new Uri("https://pokeapi.co/api/v2/");
    client.Timeout = TimeSpan.FromSeconds(10);
}).ConfigurePrimaryHttpMessageHandler(() => new SocketsHttpHandler
{
    // En algunas redes IPv6 aparece disponible, pero no tiene salida a internet.
    // Intentar IPv4 primero evita esperar hasta que se agote el tiempo de conexión.
    ConnectCallback = async (context, cancellationToken) =>
    {
        var direcciones = await Dns.GetHostAddressesAsync(context.DnsEndPoint.Host, cancellationToken);
        foreach (var direccion in direcciones.OrderBy(ip => ip.AddressFamily == AddressFamily.InterNetwork ? 0 : 1))
        {
            var socket = new Socket(direccion.AddressFamily, SocketType.Stream, ProtocolType.Tcp);
            try
            {
                await socket.ConnectAsync(direccion, context.DnsEndPoint.Port, cancellationToken);
                return new NetworkStream(socket, ownsSocket: true);
            }
            catch (SocketException)
            {
                socket.Dispose();
            }
            catch
            {
                socket.Dispose();
                throw;
            }
        }
        throw new HttpRequestException("No se pudo conectar con PokeAPI.");
    }
});

var app = builder.Build();
app.UseCors("AllowAll");

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.MapGet("/getPokemones", async (IHttpClientFactory factory) =>
{
    try
    {
        var client = factory.CreateClient("PokeAPI");
        var datos = await client.GetFromJsonAsync<ListaPokemon>("pokemon?limit=151&offset=0");
        if (datos == null || datos.Results.Count == 0)
            return Results.Json(new { mensaje = "PokeAPI no devolvió la lista." }, statusCode: 502);

        // React Native recibe directamente el arreglo, sin el objeto results.
        return Results.Ok(datos.Results);
    }
    catch (HttpRequestException)
    {
        return Results.Json(new { mensaje = "No se pudo consultar PokeAPI." }, statusCode: 502);
    }
    catch (TaskCanceledException)
    {
        return Results.Json(new { mensaje = "PokeAPI tardó demasiado en responder." }, statusCode: 504);
    }
    catch (JsonException)
    {
        return Results.Json(new { mensaje = "PokeAPI devolvió datos no válidos." }, statusCode: 502);
    }
});

app.MapGet("/pokemon/{id:int}", async (int id, IHttpClientFactory factory) =>
{
    if (id < 1 || id > 151)
        return Results.NotFound(new { mensaje = "Esta Pokédex solo incluye los números del 1 al 151." });

    try
    {
        var client = factory.CreateClient("PokeAPI");
        var pokemon = await client.GetFromJsonAsync<Pokemon>("pokemon/" + id);
        if (pokemon == null)
            return Results.NotFound(new { mensaje = "Pokémon no encontrado." });

        return Results.Ok(pokemon);
    }
    catch (HttpRequestException error) when (error.StatusCode == HttpStatusCode.NotFound)
    {
        return Results.NotFound(new { mensaje = "Pokémon no encontrado." });
    }
    catch (HttpRequestException)
    {
        return Results.Json(new { mensaje = "No se pudo consultar PokeAPI." }, statusCode: 502);
    }
    catch (TaskCanceledException)
    {
        return Results.Json(new { mensaje = "PokeAPI tardó demasiado en responder." }, statusCode: 504);
    }
    catch (JsonException)
    {
        return Results.Json(new { mensaje = "PokeAPI devolvió datos no válidos." }, statusCode: 502);
    }
});

app.Run();
