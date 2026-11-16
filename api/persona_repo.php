<?php

function cedulaLimpia(string $cedula): string
{
    return preg_replace('/\D/', '', $cedula) ?? '';
}

function buscarPersona(PDO $pdo, string $cedula): ?array
{
    $stmt = $pdo->prepare(
        'SELECT p.id, p.Primer_nombre, p.Segundo_nombre, p.Primer_apellido, p.Segundo_apellido,
                p.Cedula, p.Edad, p.Correo, p.Tipo_sangre, p.id_parroquia, p.Subregiones_id,
                pa.id_municipio, m.municipio AS municipio_nombre, e.estado AS estado_nombre
         FROM personas p
         LEFT JOIN parroquias pa ON pa.id_parroquia = p.id_parroquia
         LEFT JOIN municipios m ON m.id_municipio = pa.id_municipio
         LEFT JOIN estados e ON e.id_estado = m.id_estado
         WHERE p.Cedula = ?
         LIMIT 1'
    );
    $stmt->execute([$cedula]);
    $fila = $stmt->fetch();

    return $fila ?: null;
}

function listarDosis(PDO $pdo, int $personaId): array
{
    $stmt = $pdo->prepare(
        'SELECT d.id, d.Numero AS numero, d.Fecha_aplicacion AS fecha, d.Lote AS lote,
                d.Estado AS estado, d.Observacion AS observacion, v.Nombre AS nombre
         FROM dosis d
         LEFT JOIN vacunas v ON v.id = d.Vacunas_id
         WHERE d.Personas_id = ?
         ORDER BY d.id'
    );
    $stmt->execute([$personaId]);
    $filas = [];

    foreach ($stmt->fetchAll() as $fila) {
        $filas[] = [
            'id' => (int) $fila['id'],
            'nombre' => $fila['nombre'] ?? '',
            'numero' => $fila['numero'] ?? '',
            'fecha' => $fila['fecha'] ?? '',
            'lote' => $fila['lote'] ?? '',
            'estado' => $fila['estado'] ?? 'Aplicado',
            'observacion' => $fila['observacion'] ?? '',
        ];
    }

    return $filas;
}

function carnetReciente(PDO $pdo, int $personaId): ?array
{
    $stmt = $pdo->prepare(
        'SELECT Condicion_sanitaria, Fecha_vencimiento
         FROM carnet_salud
         WHERE Personas_id = ?
         ORDER BY id DESC
         LIMIT 1'
    );
    $stmt->execute([$personaId]);
    $fila = $stmt->fetch();

    return $fila ?: null;
}

function fichaPersona(PDO $pdo, string $cedula): ?array
{
    $fila = buscarPersona($pdo, $cedula);
    if (!$fila) {
        return null;
    }

    $personaId = (int) $fila['id'];
    $carnet = carnetReciente($pdo, $personaId);
    $municipioId = isset($fila['id_municipio']) ? (int) $fila['id_municipio'] : null;

    return [
        'id' => $personaId,
        'firstname1' => $fila['Primer_nombre'] ?? '',
        'firstname2' => $fila['Segundo_nombre'] ?? '',
        'lastname1' => $fila['Primer_apellido'] ?? '',
        'lastname2' => $fila['Segundo_apellido'] ?? '',
        'municipality' => valorPorId(mapaMunicipios(), $municipioId) ?: ($fila['municipio_nombre'] ?? ''),
        'state' => $fila['estado_nombre'] ?? '',
        'parish' => valorPorId(mapaParroquias(), isset($fila['id_parroquia']) ? (int) $fila['id_parroquia'] : null),
        'subregion' => valorPorId(mapaSubregiones(), isset($fila['Subregiones_id']) ? (int) $fila['Subregiones_id'] : null),
        'bloodType' => $fila['Tipo_sangre'] ?? '',
        'email' => $fila['Correo'] ?? '',
        'age' => $fila['Edad'] ?? '',
        'condition' => $carnet['Condicion_sanitaria'] ?? '',
        'expiry' => $carnet['Fecha_vencimiento'] ?? '',
        'dosis' => listarDosis($pdo, $personaId),
    ];
}

function guardarPersona(PDO $pdo, array $datos): int
{
    $cedula = cedulaLimpia((string) ($datos['cedula'] ?? ''));
    if ($cedula === '') {
        throw new InvalidArgumentException('La cédula es obligatoria.');
    }

    $campos = [];
    $asignar = function (string $clave, string $columna) use (&$campos, $datos): void {
        if (!array_key_exists($clave, $datos)) {
            return;
        }
        $valor = is_string($datos[$clave]) ? trim($datos[$clave]) : $datos[$clave];
        $campos[$columna] = ($valor === '' || $valor === null) ? null : $valor;
    };

    $asignar('firstname1', 'Primer_nombre');
    $asignar('firstname2', 'Segundo_nombre');
    $asignar('lastname1', 'Primer_apellido');
    $asignar('lastname2', 'Segundo_apellido');
    $asignar('age', 'Edad');
    $asignar('email', 'Correo');
    $asignar('bloodType', 'Tipo_sangre');

    $tocaTerritorio = array_key_exists('municipality', $datos)
        || array_key_exists('parish', $datos)
        || array_key_exists('subregion', $datos);

    if ($tocaTerritorio) {
        $territorio = resolverTerritorio(
            (string) ($datos['municipality'] ?? ''),
            (string) ($datos['parish'] ?? ''),
            (string) ($datos['subregion'] ?? '')
        );
        $campos['id_parroquia'] = $territorio['parroquia_id'];
        $campos['Subregiones_id'] = $territorio['subregion_id'];
    }

    $buscar = $pdo->prepare('SELECT id FROM personas WHERE Cedula = ? LIMIT 1');
    $buscar->execute([$cedula]);
    $id = $buscar->fetchColumn();

    if ($id) {
        if ($campos) {
            $set = [];
            $valores = [];
            foreach ($campos as $columna => $valor) {
                $set[] = $columna . ' = ?';
                $valores[] = $valor;
            }
            $valores[] = $id;
            $pdo->prepare('UPDATE personas SET ' . implode(', ', $set) . ' WHERE id = ?')->execute($valores);
        }

        return (int) $id;
    }

    $campos['Cedula'] = $cedula;
    $columnas = array_keys($campos);
    $marcas = implode(', ', array_fill(0, count($columnas), '?'));
    $pdo->prepare(
        'INSERT INTO personas (' . implode(', ', $columnas) . ') VALUES (' . $marcas . ')'
    )->execute(array_values($campos));

    return (int) $pdo->lastInsertId();
}

function idVacuna(PDO $pdo, string $nombre): int
{
    $nombre = trim($nombre);
    if ($nombre === '') {
        throw new InvalidArgumentException('Seleccione la vacuna.');
    }

    $stmt = $pdo->prepare('SELECT id FROM vacunas WHERE Nombre = ? LIMIT 1');
    $stmt->execute([$nombre]);
    $id = $stmt->fetchColumn();
    if ($id) {
        return (int) $id;
    }

    $pdo->prepare('INSERT INTO vacunas (Nombre, Esquema) VALUES (?, ?)')->execute([$nombre, 'Dosis Única']);

    return (int) $pdo->lastInsertId();
}

function insertarDosis(PDO $pdo, int $personaId, array $item): int
{
    $estado = (($item['estado'] ?? '') === 'Pendiente') ? 'Pendiente' : 'Aplicado';
    $fecha = trim((string) ($item['fecha'] ?? ''));
    $lote = trim((string) ($item['lote'] ?? ''));
    $observacion = trim((string) ($item['observacion'] ?? ''));
    $numero = trim((string) ($item['numero'] ?? ''));

    $stmt = $pdo->prepare(
        'INSERT INTO dosis (Numero, Vacunas_id, Personas_id, Fecha_aplicacion, Lote, Estado, Observacion)
         VALUES (?, ?, ?, ?, ?, ?, ?)'
    );
    $stmt->execute([
        $numero !== '' ? $numero : '1ra Dosis',
        idVacuna($pdo, (string) ($item['nombre'] ?? '')),
        $personaId,
        $fecha !== '' ? $fecha : null,
        $lote !== '' ? $lote : null,
        $estado,
        $observacion !== '' ? $observacion : null,
    ]);

    return (int) $pdo->lastInsertId();
}
