export interface DireccionGrado {
  id: string;
  idGradoEducacion: string;
  idUsuario: string;
  idAnioElectivo: string;
  linkClaseVirtual: string | null;
  ultimaActualizacionLink: string | null;
  nombreGrado?: string;
  nombreUsuario?: string;
  anio?: number;
}
