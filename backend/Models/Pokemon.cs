using System.Text.Json.Serialization;

namespace PokedexApi.Models;

// Solo leemos los campos de PokeAPI que muestra la aplicación.
public class Pokemon
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public int Height { get; set; }
    public int Weight { get; set; }
    public ImagenPokemon Sprites { get; set; } = new();
    public List<TipoPokemon> Types { get; set; } = new();
    public List<HabilidadPokemon> Abilities { get; set; } = new();
    public List<EstadisticaPokemon> Stats { get; set; } = new();
}

public class ImagenPokemon
{
    [JsonPropertyName("front_default")]
    public string? FrontDefault { get; set; }
}

public class TipoPokemon
{
    public Recurso Type { get; set; } = new();
}

public class HabilidadPokemon
{
    public Recurso Ability { get; set; } = new();
}

public class EstadisticaPokemon
{
    [JsonPropertyName("base_stat")]
    public int BaseStat { get; set; }
    public Recurso Stat { get; set; } = new();
}
