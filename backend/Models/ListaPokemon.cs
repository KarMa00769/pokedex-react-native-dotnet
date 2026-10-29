namespace PokedexApi.Models;

// La lista de PokeAPI contiene un arreglo llamado results.
public class ListaPokemon
{
    public List<Recurso> Results { get; set; } = new();
}

public class Recurso
{
    public string Name { get; set; } = "";
    public string Url { get; set; } = "";
}
