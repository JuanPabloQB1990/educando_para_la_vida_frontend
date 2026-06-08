export interface CargaAcademica {
  id: string;
  idUsuario: string;
  idMateria: string;
  idGradoEducacion: string;
  idAnioElectivo: string;
  idBloque?: string | null;
  nombreUsuario?: string;
  nombreMateria?: string;
  nombreGrado?: string;
  nombreBloque?: string | null;
  anio?: number;
}
