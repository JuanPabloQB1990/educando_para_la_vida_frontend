export interface AnioElectivo {
  id: string;
  anio: number;
  estado: 'activo' | 'cerrado';
}

export interface CreateAnioElectivoDto {
  anio: number;
  estado?: 'activo' | 'cerrado';
}

export interface UpdateAnioElectivoDto {
  anio: number;
  estado: 'activo' | 'cerrado';
}
