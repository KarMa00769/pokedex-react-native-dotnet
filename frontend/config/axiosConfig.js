import axios from 'axios';
import { Platform } from 'react-native';

// En un Android físico, coloca la IP de la Mac en .env.local.
const direccion = process.env.EXPO_PUBLIC_API_URL ||
  (Platform.OS === 'android' ? 'http://10.0.2.2:5201' : 'http://localhost:5201');

const apiClient = axios.create({
  baseURL: direccion,
  timeout: 15000,
});

export default apiClient;
