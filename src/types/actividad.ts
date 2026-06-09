export interface Actividad {
  id: string;
  idPeriodo: string;
  idGradoEducacion: string;
  nombre: string;
  semana: number;
  descripcion: string | null;
  numeroPeriodo?: number;
  nombreGrado?: string;
}
