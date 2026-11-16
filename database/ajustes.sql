-- Ejecutar una sola vez, después de importar programacion_3.sql.
-- Ajusta tipos, completa los datos de prueba y declara las claves foráneas
-- que usa el expediente. No cambia las tablas ni el flujo de las pantallas.

ALTER TABLE `personas`
  MODIFY `Cedula` varchar(20) DEFAULT NULL;

ALTER TABLE `personas`
  ADD UNIQUE KEY `uk_personas_cedula` (`Cedula`);

ALTER TABLE `usuarios`
  ADD COLUMN `Rol` varchar(50) DEFAULT NULL AFTER `Cargo`;

ALTER TABLE `dosis`
  ADD COLUMN `Observacion` varchar(255) DEFAULT NULL AFTER `Lote`;

ALTER TABLE `dosis`
  MODIFY `Vacunas_id` int(10) UNSIGNED DEFAULT NULL,
  MODIFY `Personas_id` int(10) UNSIGNED DEFAULT NULL;

ALTER TABLE `usuarios`
  MODIFY `Centros_id` int(10) UNSIGNED DEFAULT NULL;

UPDATE `personas`
SET `Tipo_sangre` = 'O+',
    `id_parroquia` = 432,
    `Subregiones_id` = 1,
    `Centros_id` = 1
WHERE `id` = 1;

UPDATE `personas`
SET `Tipo_sangre` = 'A+',
    `id_parroquia` = 439,
    `Subregiones_id` = 2,
    `Centros_id` = 1
WHERE `id` = 2;

UPDATE `centros`
SET `id_parroquia` = 432,
    `Subregiones_id` = 1
WHERE `id` = 1;

UPDATE `carnet_salud`
SET `Personas_id` = 1,
    `Condicion_sanitaria` = 'Apto para Manipulación de Alimentos',
    `Fecha_emision` = '2026-11-16',
    `Fecha_vencimiento` = '2027-11-15',
    `Estatus` = 'Emitido'
WHERE `id` = 1;

INSERT INTO `carnet_salud`
  (`Codigo`, `Personas_id`, `Condicion_sanitaria`, `Fecha_emision`, `Fecha_vencimiento`, `Estatus`)
VALUES
  (1002, 2, 'Apto Laboral', '2026-11-16', '2027-06-30', 'Emitido');

INSERT INTO `usuarios`
  (`Nombre`, `Apellido`, `Cedula`, `Centros_id`, `Cargo`, `Correo`, `Password`, `Rol`)
VALUES
  ('Administrador', 'Nacional', NULL, 1, 'Master', 'master@sivan.gob.ve', '$2y$10$YcHsgr6xXPu1oyYx/Me.GuvTYXtf/6P1Rb1/dLFBU.v6mUdYQRfn2', 'Master'),
  ('Coordinación', 'Subregional', NULL, 1, 'Subregion', 'subregion@sivan.gob.ve', '$2y$10$czc962F7UPcBzLEykuKrZurglhhnf5CXn5k3kBZ2IZGAei7nDvu8u', 'Subregion'),
  ('Personal', 'Vacunador', NULL, 1, 'Vacunador', 'vacunador@sivan.gob.ve', '$2y$10$r7p4kzab6oTtbA/hr/OkWeLPCu2Dl1dPzx7n8yUcEtPdlfNa5ZNae', 'Vacunador');

ALTER TABLE `usuarios`
  ADD UNIQUE KEY `uk_usuarios_correo` (`Correo`);

ALTER TABLE `dosis`
  ADD CONSTRAINT `fk_dosis_vacuna` FOREIGN KEY (`Vacunas_id`) REFERENCES `vacunas` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_dosis_persona` FOREIGN KEY (`Personas_id`) REFERENCES `personas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `personas`
  ADD CONSTRAINT `fk_personas_parroquia` FOREIGN KEY (`id_parroquia`) REFERENCES `parroquias` (`id_parroquia`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_personas_subregion` FOREIGN KEY (`Subregiones_id`) REFERENCES `subregiones` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_personas_centro` FOREIGN KEY (`Centros_id`) REFERENCES `centros` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `centros`
  ADD CONSTRAINT `fk_centros_parroquia` FOREIGN KEY (`id_parroquia`) REFERENCES `parroquias` (`id_parroquia`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_centros_subregion` FOREIGN KEY (`Subregiones_id`) REFERENCES `subregiones` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `carnet_salud`
  ADD CONSTRAINT `fk_carnet_persona` FOREIGN KEY (`Personas_id`) REFERENCES `personas` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `usuarios`
  ADD CONSTRAINT `fk_usuarios_centro` FOREIGN KEY (`Centros_id`) REFERENCES `centros` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
