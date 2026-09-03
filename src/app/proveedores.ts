import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { 
  Proveedor, 
  Respuesta,
  RespuestaProveedor,
  RespuestaCreacion,
  RespuestaEliminacion
} from './models/proveedor';

@Injectable({
  providedIn: 'root',
})

export class ProveedoresService {

  private apiUrl = 'http://localhost:3000/proveedores';

  constructor(private http: HttpClient) {}

  getProviders() {
    return this.http.get<Respuesta>(this.apiUrl);
  }

  getProviderByCif(cif: string) {
    return this.http.get<RespuestaProveedor>(`${this.apiUrl}/${cif}`);
  }

  createProvider(proveedor: Proveedor) {
    return this.http.post<RespuestaCreacion>(this.apiUrl, proveedor);
  }

  updateProvider(cif: string, proveedor: Proveedor) {
    return this.http.put<RespuestaCreacion>(`${this.apiUrl}/${cif}`, proveedor);
  }

  deleteProvider(cif: string) {
    return this.http.delete<RespuestaEliminacion>(`${this.apiUrl}/${cif}`);
  }
}
