import { Routes } from '@angular/router';
import { Inicio } from './inicio/inicio';
import { Proveedores } from './proveedores/proveedores';
import { ProveedorComponent } from './proveedor/proveedor';

export const routes: Routes = [

    {
        path: '',
        component: Inicio,
        pathMatch: 'full'
    },

    {
        path: 'crear',
        component: ProveedorComponent
    },

    {
        path: 'proveedores',
        component: Proveedores
    },

    {
        path: 'modificar/:cif',
        component: ProveedorComponent
    },

    {
        path: '**',
        redirectTo: ''
    }

];
