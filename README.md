# Gestión de Proveedores

Aplicación web CRUD para gestionar un catálogo de proveedores: alta, listado,
modificación y baja. Frontend en Angular 21 y API REST en Node.js con Express.

- **Frontend:** este repositorio
- **Backend:** [Angular-NodeJS-Backend](https://github.com/OselkoNico/Angular-NodeJS-Backend)

## Stack

| Capa        | Tecnología                                                               |
| ----------- | ------------------------------------------------------------------------ |
| Frontend    | Angular 21 (standalone components, signals, control flow `@if` / `@for`) |
| Formularios | Reactive Forms                                                           |
| Backend     | Node.js + Express 5 (ESM)                                                |
| Tests       | Vitest                                                                   |
| Lenguaje    | TypeScript 5.9                                                           |

## Puesta en marcha

Requiere Node.js 20 o superior.

**1. Levantar la API** (puerto 3000):

```bash
cd Backend
npm install
npm start
```

**2. Levantar el frontend** (puerto 4200), en otra terminal:

```bash
npm install
npm start
```

Abrir <http://localhost:4200>.

## Funcionalidad

- **Inicio** (`/`) — pantalla de bienvenida con acceso a las dos secciones.
- **Añadir** (`/crear`) — formulario de alta con validación de campos obligatorios.
- **Listado** (`/proveedores`) — tabla de proveedores con acciones de modificar y eliminar.
- **Modificar** (`/modificar/:cif`) — el mismo formulario, precargado con los datos del proveedor.

Los errores devueltos por la API (CIF duplicado, proveedor inexistente, servidor
caído) se muestran en pantalla en lugar de fallar en silencio. Cualquier ruta no
reconocida redirige a Inicio.

## Decisiones de diseño

**Un único componente de formulario para alta y modificación.** Las rutas
`/crear` y `/modificar/:cif` comparten `ProveedorComponent` en lugar de
duplicarlo en dos componentes. El modo se determina por la presencia del
parámetro de ruta `:cif`: si existe, se cargan los datos del proveedor desde
la API y el formulario funciona en modo modificación; si no, funciona como
alta.

Ambos casos usan los mismos siete campos, las mismas validaciones y los
mismos estilos, por lo que separarlos habría duplicado plantilla, CSS y
lógica sin aportar diferencias funcionales.

## API REST

Base: `http://localhost:3000/proveedores`

| Método   | Ruta    | Descripción                  | Respuestas                               |
| -------- | ------- | ---------------------------- | ---------------------------------------- |
| `GET`    | `/`     | Lista todos los proveedores  | `200`                                    |
| `GET`    | `/:cif` | Obtiene un proveedor por CIF | `200`, `404`                             |
| `POST`   | `/`     | Crea un proveedor            | `201`, `400` si falta el CIF o ya existe |
| `PUT`    | `/:cif` | Modifica un proveedor        | `200`, `400`, `404`                      |
| `DELETE` | `/:cif` | Elimina un proveedor         | `200`, `404`                             |

El CIF actúa como identificador y no es modificable: el `PUT` lo descarta del
cuerpo de la petición.

Modelo de proveedor:

```ts
interface Proveedor {
  cif: string;
  name: string;
  activity: string;
  address: string;
  city: string;
  postalCode: string;
  phone: string;
}
```

## Estructura

```
src/app/
├── app.routes.ts          # Rutas + comodín que redirige a Inicio
├── app.config.ts          # Providers (router, HttpClient)
├── proveedores.ts         # Servicio HTTP contra la API
├── models/proveedor.ts    # Interfaces del modelo y de las respuestas
├── inicio/                # Pantalla de bienvenida
├── proveedores/           # Listado con acciones
└── proveedor/             # Formulario de alta y modificación
```

## Nota técnica: detección de cambios sin Zone.js

Angular 21 no incluye `zone.js` por defecto, así que la aplicación se ejecuta en
**modo zoneless**. Esto cambia una regla fundamental: el framework ya no parchea
`setTimeout`, promesas ni observables, y solo repinta cuando algo se lo notifica
explícitamente.

**Notifican:** escribir en un `signal` leído por la plantilla, el pipe `async`,
los eventos de plantilla (`(click)`, `routerLink`) y `ChangeDetectorRef.markForCheck()`.

**No notifican:** asignar a una propiedad normal dentro de un `subscribe`,
un `setTimeout` o un `.then()`.

Por eso el estado que llega de forma asíncrona vive en signals:

```ts
proveedores = signal<Proveedor[]>([]);

ngOnInit(): void {
  this.proveedoresService.getProviders().subscribe({
    next: (respuesta) => this.proveedores.set(respuesta.proveedores),
    error: () => this.error.set('No se pudo conectar con el servidor.')
  });
}
```

Con una propiedad normal (`this.proveedores = respuesta.proveedores`) los datos
llegan del servidor pero la tabla nunca se pinta. El síntoma es
característico: la lista aparece vacía aunque la API devuelva registros, y al
eliminar hay que pulsar el botón dos veces — el primer clic ejecuta el borrado
y el segundo, al ser un evento de plantilla, es el que fuerza el repintado.

### Cómo se detecta en los tests

`src/app/proveedores/proveedores.spec.ts` cubre este caso, con una particularidad:
**un stub síncrono con `of(...)` no reproduce el fallo**, porque el dato llega
antes del primer render y el `fixture` dispara la detección de cambios a mano.
La respuesta tiene que emitirse _después_ del primer render, como haría una
respuesta HTTP real:

```ts
const html = fixture.nativeElement as HTMLElement;
respuesta$.next({ message: 'Ok', proveedores: [PROVEEDOR] });
await fixture.whenStable();

expect(html.querySelectorAll('tbody tr').length).toBe(1);
```

La aserción va contra el **DOM**, no contra las propiedades del componente: un
`expect(component.proveedores)` pasaría igualmente con la aplicación rota,
porque el dato sí llega — lo que no ocurre es el pintado.

## Tests

```bash
npm test
```

## Limitaciones conocidas

- **Los datos se guardan en memoria.** El backend mantiene un array en el
  proceso, así que al reiniciar el servidor se pierde todo. Migrar a una base de
  datos es el siguiente paso natural.
- Sin autenticación ni control de acceso.
- Sin paginación en el listado.
