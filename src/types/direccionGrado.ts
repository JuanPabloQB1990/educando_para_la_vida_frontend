export interface DireccionGrado {
  id: string;
  idGradoEducacion: string | null;
  idUsuario: string;
  idAnioElectivo: string;
  idBloque?: string | null;
  linkClaseVirtual: string | null;
  ultimaActualizacionLink: string | null;
  nombreGrado?: string;
  nombreUsuario?: string;
  nombreBloque?: string | null;
  anio?: number;
}
