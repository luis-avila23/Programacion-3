# SIVAN

Sistema de Información Nacional de Vacunación. Registro local de personas, dosis y carnet de salud para un proyecto universitario. Corre solo en la máquina, con XAMPP. No se publica.

## Qué hace

Cuatro pantallas, según el rol:

- **Vacunador** (`index.html`): ficha de la persona y dosis aplicadas o pendientes.
- **Subregión** (`subregion.html`): busca por cédula y emite el carnet de salud.
- **Master** (`master.html`): usuarios, catálogo de vacunas y conteo de dosis por municipio.
- **Consulta ciudadana** (`consulta.html`): el ciudadano ve su carnet y sus vacunas. No pide login.

El acceso institucional está en `login.html`. La contraseña de las tres cuentas de prueba es `sivan123`. Un usuario creado desde el panel Master entra con esa misma contraseña.

| Correo | Pantalla |
|---|---|
| master@sivan.gob.ve | master.html |
| subregion@sivan.gob.ve | subregion.html |
| vacunador@sivan.gob.ve | index.html |

Al salir de la cédula, el vacunador y la subregión cargan a la persona si ya existe. La consulta de prueba usa `12345678` (Juan Pérez) y `87654321` (María Rodríguez).

## Tecnologías y lenguajes

| Capa | Tecnología |
|---|---|
| Marcado | HTML5 |
| Estilos | CSS3, partido en `assets/css/` (`variables`, `layout`, `components`, `tables`, `style`) |
| Cliente | JavaScript en un solo archivo, `app.js`. Sin frameworks. |
| Servidor | PHP sobre Apache (XAMPP), con PDO |
| Base de datos | MariaDB, base `programacion_3` |
| Entorno | XAMPP Control Panel en Windows. Apache y MySQL en local. |

No usa Node, React ni un hosting. El navegador habla con `api/*.php` y PHP habla con MariaDB. Las pantallas siguen validando y pintando las tablas; PHP solo lee y guarda.

## Cómo levantarlo

1. Instalar XAMPP y abrir el panel.
2. Start en **Apache** y en **MySQL**.
3. Copiar esta carpeta a `C:\xampp\htdocs\sivan`.
4. En phpMyAdmin (`http://localhost/phpmyadmin`) importar `database/programacion_3.sql`.
5. Importar después `database/ajustes.sql`. Ese archivo se ejecuta una sola vez: completa cédulas, cuentas y claves foráneas.
6. Abrir `http://localhost/sivan/login.html`.

La conexión local es `127.0.0.1`, usuario `root`, sin contraseña, base `programacion_3`.

## Estructura del proyecto

```
sivan/
├── login.html            Acceso institucional
├── index.html            Expediente del vacunador
├── subregion.html        Emisión de carnet
├── master.html           Usuarios, catálogo y auditoría
├── consulta.html         Consulta por cédula
├── app.js                Validaciones y pintado de tablas
├── api/
│   ├── conexion.php      PDO hacia MariaDB
│   ├── bootstrap.php     Sesión, JSON y auditoría
│   ├── territorio.php    Estados, municipios y parroquias de los select
│   ├── persona_repo.php  Altas y consultas de personas y dosis
│   ├── login.php
│   ├── personas.php
│   ├── expediente.php
│   ├── carnet.php
│   ├── usuarios.php
│   ├── vacunas.php
│   ├── consulta.php
│   └── auditoria.php
├── assets/
│   ├── css/
│   └── image/SIVAN-LOGO.png
└── database/
    ├── programacion_3.sql
    └── ajustes.sql
```

Los select de ubicación siguen con las tres opciones de la interfaz. Esas opciones apuntan a filas reales del catálogo:

| Opción en pantalla | Fila en la base |
|---|---|
| Guárico / Roscio / San Juan | Estado 11, municipio 134, parroquia 432 |
| Parapara | Parroquia 433 |
| Cantagallo | Parroquia Cantaclaro (431), en el mismo municipio |
| Infante | Municipio 137, parroquia Valle de la Pascua (439), subregión 2 |
| Miranda | Municipio Sebastián Francisco de Miranda (143) |
| Distrito 1 y Distrito 2 | Subregiones `DS-01` y `DS-02` |

Distrito 3 no tiene fila en `subregiones`. Si se elige, la persona se guarda sin subregión.

## Estructura de la base de datos

Base: `programacion_3`. Motor InnoDB, charset `utf8mb4`.

### Personas y acceso

**personas.** El ciudadano. Nombres, cédula única (`VARCHAR`), edad, correo, fecha de nacimiento, tipo de sangre, y las llaves hacia parroquia, subregión y centro.

**usuarios.** Personal de salud. Nombre, apellido, cédula, centro, cargo, correo único, contraseña con `password_hash` y rol: `Master`, `Subregion` o `Vacunador`.

### Territorio

**estados** → **municipios** → **parroquias**. Catálogo de Venezuela (25 estados). Cada municipio pertenece a un estado y cada parroquia a un municipio.

**subregiones.** Distrito sanitario. Apunta a un estado y a un municipio. Datos de ejemplo: Distrito Sanitario N° 1 Roscio y N° 2 Infante, ambos en Guárico.

**centros.** Centro de vacunación. Apunta a una parroquia y a una subregión. Dato de ejemplo: Aurora, en San Juan de los Morros.

### Vacunación

**vacunas.** Catálogo del biológico y su esquema. Dato de ejemplo: Toxoide Tetánico.

**dosis.** Cada aplicación o pendiente de una persona. Número de dosis, vacuna, persona, fecha, lote, estado (`Aplicado` o `Pendiente`) y observación.

### Carnet de salud

**examenes.** Catálogo: hemograma, orina, radiografía de tórax, coprocultivo. Nombre, tipo, indicaciones y precio.

**carnet_salud.** Un carnet de una persona. Código, condición sanitaria, fecha de emisión, fecha de vencimiento y estatus (`Pendiente`, `Emitido`, `Revocado`). Cada clic en generar carnet crea un registro.

**carnet_examenes.** Tabla intermedia. Une un carnet con varios exámenes, guarda el resultado y la fecha.

### Auditoría

**auditoria_logs.** Quién hizo qué: usuario de la sesión, acción, tabla afectada, id del registro, detalle y fecha. La escribe el PHP en cada alta y cada baja. La tabla del Master no lista ese log: muestra el conteo de dosis por estado y municipio.

### Relaciones

```
estados 1───* municipios 1───* parroquias
estados 1───* subregiones *───1 municipios
parroquias 1───* centros *───1 subregiones

parroquias 1───* personas *───1 subregiones
centros    1───* personas
centros    1───* usuarios

personas 1───* dosis *───1 vacunas
personas 1───* carnet_salud
carnet_salud 1───* carnet_examenes *───1 examenes
usuarios 1───* auditoria_logs
```

`programacion_3.sql` ya declara las claves de auditoría, carnet-exámenes, municipios, parroquias y subregiones. `ajustes.sql` agrega las de dosis, personas, centros, carnet y usuarios.
