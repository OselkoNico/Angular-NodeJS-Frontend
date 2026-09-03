import { Component, OnInit, signal } from '@angular/core';
import { ProveedoresService } from '../proveedores';
import { Proveedor } from '../models/proveedor';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-proveedores',
  imports: [RouterLink],
  templateUrl: './proveedores.html',
  styleUrl: './proveedores.css',
})
export class Proveedores implements OnInit{

proveedores = signal<Proveedor[]>([]);
error = signal('');

constructor(private proveedoresService: ProveedoresService, private router: Router) {}

modificarProveedor(cif: string) {
  this.router.navigate(['modificar', cif])
}

eliminarProveedor(cif: string) {
  this.proveedoresService.deleteProvider(cif).subscribe({
    next: () => {
      this.proveedores.update(
        proveedores => proveedores.filter(proveedor => proveedor.cif !== cif)
      );
    },
    error: () => this.error.set('No se pudo eliminar el proveedor.')
  });
}

ngOnInit(): void {
  this.proveedoresService.getProviders().subscribe({
    next: (respuesta) => this.proveedores.set(respuesta.proveedores),
    error: () => this.error.set('No se pudo conectar con el servidor.')
  });
}

}
