import apiClient from '../config/axiosConfig';

export async function getPokemones() {
  const respuesta = await apiClient.get('/getPokemones');
  return respuesta.data;
}

export async function getPokemon(id) {
  const respuesta = await apiClient.get('/pokemon/' + id);
  return respuesta.data;
}
