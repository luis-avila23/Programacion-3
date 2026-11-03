SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

--
-- Base de datos: `programacion_3`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `carnet_salud`
--

CREATE TABLE `carnet_salud` (
  `id` int(10) UNSIGNED NOT NULL,
  `Codigo` int(11) DEFAULT NULL,
  `Dosis_id` int(11) DEFAULT NULL,
  `Examenes_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `carnet_salud`
--

INSERT INTO `carnet_salud` (`id`, `Codigo`, `Dosis_id`, `Examenes_id`) VALUES
(1, 1001, 1, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `centros`
--

CREATE TABLE `centros` (
  `id` int(10) UNSIGNED NOT NULL,
  `Nombre` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `centros`
--

INSERT INTO `centros` (`id`, `Nombre`) VALUES
(1, 'Aurora');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `dosis`
--

CREATE TABLE `dosis` (
  `id` int(10) UNSIGNED NOT NULL,
  `Numero` varchar(255) DEFAULT NULL,
  `Vacunas_id` int(11) DEFAULT NULL,
  `Personas_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `dosis`
--

INSERT INTO `dosis` (`id`, `Numero`, `Vacunas_id`, `Personas_id`) VALUES
(1, 'Primera Dosis', 1, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `examenes`
--

CREATE TABLE `examenes` (
  `id` int(10) UNSIGNED NOT NULL,
  `Nombre` varchar(255) DEFAULT NULL,
  `Tipo` varchar(100) DEFAULT NULL,
  `Indicasiones` text DEFAULT NULL,
  `Precio` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `examenes`
--

INSERT INTO `examenes` (`id`, `Nombre`, `Tipo`, `Indicasiones`, `Precio`) VALUES
(1, 'Hemograma', 'Laboratorio', 'Ayuno de 8 horas', 15.00),
(2, 'Orina', 'Laboratorio', 'Muestra en frasco estéril', 8.50),
(3, 'Radiografía de tórax', 'Imagen', 'Sin objetos metálicos', 25.00),
(4, 'Coprocultivo', 'Laboratorio', 'Muestra del día', 12.00);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `personas`
--

CREATE TABLE `personas` (
  `id` int(10) UNSIGNED NOT NULL,
  `Primer_nombre` varchar(255) DEFAULT NULL,
  `Segundo_nombre` varchar(255) DEFAULT NULL,
  `Primer_apellido` varchar(255) DEFAULT NULL,
  `Segundo_apellido` varchar(255) DEFAULT NULL,
  `Cedula` int(11) DEFAULT NULL,
  `Edad` varchar(255) DEFAULT NULL,
  `Correo` varchar(255) DEFAULT NULL,
  `Fecha_nacimiento` date DEFAULT NULL,
  `Examenes_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `personas`
--

INSERT INTO `personas` (`id`, `Primer_nombre`, `Segundo_nombre`, `Primer_apellido`, `Segundo_apellido`, `Cedula`, `Edad`, `Correo`, `Fecha_nacimiento`, `Examenes_id`) VALUES
(1, 'Juan', 'Carlos', 'Pérez', 'Gómez', 12345678, '30', 'juan.perez@email.com', '1996-05-12', NULL),
(2, 'María', 'Alejandra', 'Rodríguez', 'Blanco', 87654321, '25', 'maria.rodriguez@email.com', '2001-08-20', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(10) UNSIGNED NOT NULL,
  `Nombre` varchar(255) DEFAULT NULL,
  `Apellido` varchar(255) DEFAULT NULL,
  `Cedula` int(11) DEFAULT NULL,
  `Centros_id` int(11) DEFAULT NULL,
  `Cargo` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `Nombre`, `Apellido`, `Cedula`, `Centros_id`, `Cargo`) VALUES
(1, 'Luis', 'Avila', 32645097, 1, 'Maestro');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `vacunas`
--

CREATE TABLE `vacunas` (
  `id` int(10) UNSIGNED NOT NULL,
  `Nombre` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `vacunas`
--

INSERT INTO `vacunas` (`id`, `Nombre`) VALUES
(1, 'Toxoide Tetánico');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `carnet_salud`
--
ALTER TABLE `carnet_salud`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `centros`
--
ALTER TABLE `centros`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `dosis`
--
ALTER TABLE `dosis`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `examenes`
--
ALTER TABLE `examenes`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `personas`
--
ALTER TABLE `personas`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `vacunas`
--
ALTER TABLE `vacunas`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `carnet_salud`
--
ALTER TABLE `carnet_salud`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `centros`
--
ALTER TABLE `centros`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `dosis`
--
ALTER TABLE `dosis`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `examenes`
--
ALTER TABLE `examenes`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `personas`
--
ALTER TABLE `personas`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `vacunas`
--
ALTER TABLE `vacunas`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
COMMIT;
