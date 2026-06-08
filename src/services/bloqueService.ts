import http from './http';
import type { Bloque } from '../types/bloque';

const bloqueService = {
  async getAll(): Promise<Bloque[]> {
    const res = await http.get('/academico/bloque');
    return res.data.data;
  },
};

export default bloqueService;
