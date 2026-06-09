export enum PeriodoEstado {
  ACTIVO = 'activo',
  CERRADO = 'cerrado',
}

export interface Periodo {
  id: string;
  idAnioElectivo: string;
  numeroPeriodo: number;
  estado: PeriodoEstado;
}
