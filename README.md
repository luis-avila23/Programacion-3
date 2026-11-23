# SIVAN

Sistema de Información Nacional de Vacunación. Sirve para registrar personas, las dosis que se les aplican y el carnet de salud que emite la subregión. Es un proyecto universitario y corre solo en la computadora. No se publica en internet.

La forma de programarlo es la del proyecto base de Node y MySQL: Express recibe el formulario, un modelo consulta MariaDB y una vista EJS pinta la página.

## Qué hace cada pantalla

Hay cuatro pantallas. Tres piden usuario y una es pública.

| Rol | Correo | Contraseña | Al entrar abre |
|---|---|---|---|
| Master | master@sivan.gob.ve | sivan123 | `/master` |
| Subregión | subregion@sivan.gob.ve | sivan123 | `/subregion` |
| Vacunador | vacunador@sivan.gob.ve | sivan123 | `/expediente` |
| Ciudadano | no usa cuenta | — | `/consulta` |

Un usuario creado desde el panel Master también entra con la contraseña `sivan123`.

**Vacunador** (`/expediente`). Busca a la persona por cédula. Si no existe, se completa la ficha y se guarda. Desde la misma pantalla se agrega una dosis aplicada o una pendiente, y se puede eliminar.

**Subregión** (`/subregion`). Busca la cédula, completa tipo de sangre, condición sanitaria y vencimiento, y genera el carnet. Cada clic crea un carnet nuevo. La tabla de abajo lista los que ya están guardados.

**Master** (`/master`). Crea y elimina usuarios, agrega biológicos al catálogo y ve cuántas dosis hay por estado y municipio.

**Consulta** (`/consulta`). Cualquiera escribe una cédula y ve el nombre, el municipio, la sangre, la condición del carnet, el vencimiento y las vacunas. No pide login.

Para probar la consulta ya hay dos personas:

| Cédula | Persona | Qué tiene |
|---|---|---|
| 12345678 | Juan Carlos Pérez Gómez | Sangre O+, carnet vigente, Toxoide Tetánico aplicado |
| 87654321 | María Alejandra Rodríguez Blanco | Sangre A+, carnet laboral, sin vacunas |

Si entras con un rol y abres la dirección de otro, el sistema te devuelve a tu propia pantalla.

## Tecnologías

| Pieza | Qué se usa |
|---|---|
| Servidor | Node.js y Express |
| Pantallas | EJS. El HTML está en `views/` y el servidor lo rellena |
| Estilos | CSS en `assets/css/` |
| Base de datos | MariaDB, la que trae XAMPP. El paquete de Node se llama `mysql` |
| Sesión | `express-session`. Guarda el correo, el rol y el id del usuario mientras la ventana sigue abierta |

XAMPP solo enciende MySQL. La aplicación no es PHP y no se abre con Apache. Node la sirve en el puerto 3000.

## Cómo levantarlo

1. Abre XAMPP y pulsa **Start** en **MySQL**.
2. Entra a `http://localhost/phpmyadmin`.
3. Ve a **Importar** y elige `database/xampp.sql`.

Ese archivo crea la base `programacion_3`, las tablas, el catálogo de Venezuela y los usuarios de prueba. Si lo importas otra vez, borra esas tablas y las vuelve a crear: lo que hayas guardado desde la aplicación se pierde.

4. En la carpeta del proyecto, en la terminal:

```
npm install
npm start
```

`npm install` hace falta la primera vez, o cuando cambie `package.json`. Después basta con `npm start`.

5. Abre `http://localhost:3000/login`.

La conexión está en `conexion.js`: host `localhost`, usuario `root`, sin contraseña, base `programacion_3`. Si en tu XAMPP el usuario `root` tiene contraseña, cámbiala ahí.

Para detener el servidor, en la terminal donde corre `npm start` pulsa `Ctrl + C`.

## Cómo viaja un clic

1. El botón del formulario envía los datos a una dirección, por ejemplo `POST /expediente/guardar`.
2. `app.js` entrega esa dirección al archivo de `routes/` que le corresponde.
3. La ruta revisa que los campos no vengan vacíos y llama a un archivo de `models/`.
4. El modelo arma el `INSERT` o el `SELECT` y lo manda por `conexion.js`. Los valores van con `?`, no pegados dentro del texto SQL.
5. La ruta redirige a la misma pantalla (`res.redirect`) o la vuelve a dibujar (`res.render`).

Ejemplo: **Guardar** en el expediente llega a `routes/expediente.js`, que llama a `models/personas.js`, y al terminar abre otra vez `/expediente` con la cédula que se acaba de guardar.

## Estructura del proyecto

```
Programacion-3/
├── app.js
├── conexion.js
├── package.json
├── bin/
├── routes/
├── models/
├── views/
├── assets/
└── database/
```

Los archivos sueltos de la raíz no son carpetas, pero arman el resto: `app.js` crea Express, la sesión y reparte cada dirección; `conexion.js` abre el pool hacia `programacion_3`; `package.json` lista las dependencias y el comando `npm start`.

### `bin/`

Arranca el proceso. `npm start` ejecuta `bin/www`, que carga `app.js`, crea el servidor HTTP y lo deja escuchando en el puerto 3000. Aquí no hay pantallas ni consultas: solo el encendido.

### `routes/`

Recibe lo que llega del navegador. Cada archivo escucha una parte de la dirección. Revisa que la sesión corresponda al rol, que los campos no vengan vacíos, llama al modelo y después redirige o vuelve a dibujar la página.

| Archivo | Dirección | Qué hace |
|---|---|---|
| `routes/index.js` | `/` | Si no hay sesión, manda a `/login`. Si la hay, manda a la pantalla del rol |
| `routes/login.js` | `/login` y `/login/envio` | Muestra el formulario y compara correo y contraseña |
| `routes/expediente.js` | `/expediente` | Busca, guarda la ficha y agrega o borra dosis |
| `routes/subregion.js` | `/subregion` | Busca y genera o elimina carnets |
| `routes/master.js` | `/master` | Usuarios, vacunas y el conteo de dosis |
| `routes/consulta.js` | `/consulta` | Consulta pública |
| `routes/sesion.js` | — | No es una página. Impide entrar a una pantalla de otro rol |

Cerrar sesión está en `/logout`, definido en `app.js`. Los avisos cortos (“Expediente guardado”, “Complete la cédula”, “Usuario o contraseña incorrectos”) también están en el archivo de `routes/` de esa pantalla, no en la vista. El título que va al lado de **SIVAN** en la barra lo escribe la ruta al abrir la página.

### `models/`

Habla con MariaDB. Cada archivo arma los `SELECT`, `INSERT` y `DELETE` de una parte del sistema. Los valores van con `?`, no escritos dentro del texto SQL.

| Archivo | Tabla que toca |
|---|---|
| `models/login.js` | `usuarios`, solo para entrar |
| `models/personas.js` | `personas`, y arma la ficha con sus dosis y su último carnet |
| `models/dosis.js` | `dosis` |
| `models/carnet.js` | `Carnet` |
| `models/usuarios.js` | `usuarios` |
| `models/vacunas.js` | `vacunas` |
| `models/auditoria.js` | `Registro`, `Auditoria` y el conteo que ve el Master |
| `models/territorio.js` | No inserta filas. Traduce las opciones del formulario (Roscio, San Juan, Distrito 1) a los id de la base |
| `models/consultar.js` | Función que usan los demás para ejecutar `conexion.query` |

### `views/`

El HTML que ve el usuario, escrito en EJS. El servidor rellena esos archivos con los datos que trajo el modelo: formularios, tablas y avisos. `header.ejs` y `footer.ejs` se repiten en las pantallas. Con `npm start` ya corriendo, un cambio de texto se ve al recargar el navegador, sin reiniciar Node.

| Si quieres cambiar… | Archivo |
|---|---|
| Login, cuentas de prueba y el enlace a la consulta | `views/login.ejs` |
| Ficha del vacunador, vacunas y botones | `views/expediente.ejs` |
| Carnet de la subregión | `views/subregion.ejs` |
| Panel master | `views/master.ejs` |
| Consulta del ciudadano | `views/consulta.ejs` |
| Barra de arriba y “Cerrar Sesión” | `views/header.ejs` |
| Pie de las pantallas | `views/footer.ejs` |
| Página de error | `views/error.ejs` |

### `assets/`

Archivos estáticos que Express publica en `/assets`. No hay lógica ni consultas.

`assets/css/` tiene los estilos: `variables.css` (colores), `layout.css` (barra y página), `components.css` (formularios y botones), `tables.css` (tablas) y `style.css`, que los junta. `assets/image/` tiene el logo `SIVAN-LOGO.png`.

### `database/`

El script para crear la base en phpMyAdmin: `database/xampp.sql`. Crea `programacion_3`, las tablas, el catálogo de Venezuela y los usuarios de prueba. No lo lee Node al arrancar; se importa a mano desde XAMPP. Importarlo otra vez borra esas tablas y las vuelve a crear.

## Dónde se guardan las opciones del formulario

Los select de estado, municipio, parroquia y subregión tienen pocas opciones. Cada una apunta a una fila real del catálogo:

| Opción en pantalla | Fila en la base |
|---|---|
| Guárico / Roscio / San Juan | Estado 11, municipio Juan Germán Roscio (134), parroquia San Juan de los Morros (432) |
| Parapara | Parroquia 433 |
| Cantagallo | Parroquia Cantaclaro (431), en el mismo municipio |
| Infante | Municipio Leonardo Infante (137), parroquia Valle de la Pascua (439), subregión 2 |
| Miranda | Municipio Sebastián Francisco de Miranda (143), parroquia El Calvario (453) |
| Distrito 1 | Subregión `DS-01`, Roscio |
| Distrito 2 | Subregión `DS-02`, Infante |

Distrito 3 no tiene fila. Si se elige, la persona se guarda sin subregión.

El centro de ejemplo es **Aurora**, en San Juan de los Morros. Los usuarios nuevos quedan asociados a ese centro.

## Base de datos

Nombre: `programacion_3`. Motor InnoDB, caracteres `utf8mb4`. Todo sale de `database/xampp.sql`.

### Personas y acceso

**Personas.** El ciudadano: nombres, cédula única, edad, correo, fecha de nacimiento, tipo de sangre, parroquia (`Parroquias_id`), subregión y centro. La cédula es texto (`VARCHAR`) para no perder ceros a la izquierda.

**Usuarios.** El personal: nombre, apellido, cédula, centro, cargo, correo, contraseña y rol (`Master`, `Subregion` o `Vacunador`). El login busca una fila con ese correo y esa contraseña. El correo no se puede repetir. Correo, contraseña y rol no salen dibujados en el diagrama; hacen falta para entrar al sistema.

### Territorio

**Estados**, **Municipios** y **Parroquias** traen el catálogo de Venezuela: 25 estados y sus municipios y parroquias. La clave de cada una es `id`. Un municipio pertenece a un estado (`Estados_id`) y una parroquia a un municipio (`id_Municipios`).

**Subregiones.** El distrito sanitario. Tiene estado (`Estados_id`) y municipio (`Municipios_id`). De ejemplo están el Distrito Sanitario N° 1 (Roscio) y el N° 2 (Infante), los dos en Guárico.

**Centros.** El lugar donde se vacuna. Tiene parroquia (`id_Parroquias`) y subregión (`id_Subregiones`). El ejemplo es Aurora.

### Vacunación

**Vacunas.** El catálogo del biológico, el centro donde se aplica (`Centros_id`) y su esquema. De ejemplo está Toxoide Tetánico, en el centro Aurora.

**dosis.** Una aplicación, o una que todavía falta, de una persona. Guarda el número de dosis, la vacuna, la persona, la fecha, el lote, el estado (`Aplicado` o `Pendiente`) y una observación.

### Carnet de salud

**examenes.** Hemograma, orina, radiografía de tórax y coprocultivo. Cada uno tiene tipo, indicaciones y precio.

**Carnet.** Un carnet de una persona: código, dosis, examen, condición sanitaria, fecha de emisión, fecha de vencimiento y estatus (`Pendiente`, `Emitido` o `Revocado`). Generar carnet inserta una fila nueva. La condición sanitaria es la que elige la subregión; el diagrama no la nombra, pero la pantalla sí.

**Carnet_examenes.** Une un carnet con varios exámenes. Guarda el resultado y la fecha del examen.

### Auditoría

**Registro.** Una solicitud que modifica datos. Solo guarda el usuario que la hizo (`Usuarios_id`). Cada guardado, alta o baja crea una fila.

**Auditoria.** El detalle de esa solicitud: acción, tabla, el `Registro_id`, un detalle con el id afectado, la fecha y la hora. No apunta al usuario directo: llega a él por `Registro`. La tabla del Master no lista ese historial: muestra cuántas dosis hay agrupadas por estado y municipio.

### Relaciones

```
Estados 1───* Municipios 1───* Parroquias
Estados 1───* Subregiones *───1 Municipios
Parroquias 1───* Centros *───1 Subregiones

Parroquias 1───* Personas *───1 Subregiones
Centros    1───* Personas
Centros    1───* Usuarios
Centros    1───* Vacunas
Examenes   1───* Personas

Personas 1───* Dosis *───1 Vacunas
Personas 1───* Carnet *───1 Dosis
Carnet   1───* Carnet_examenes *───1 Examenes
Usuarios 1───* Registro 1───* Auditoria
```

Esas flechas están declaradas como claves foráneas. Una dosis no puede quedar apuntando a una persona o a una vacuna que no existe. Si se borra una persona, se borran sus dosis. Si se intenta borrar una vacuna que ya tiene dosis, la base no deja.
