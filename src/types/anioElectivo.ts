export interface AnioElectivo {
  idAnioElectivo: string;
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
