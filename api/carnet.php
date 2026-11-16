<?php

require __DIR__ . '/bootstrap.php';

try {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $stmt = $pdo->query(
            'SELECT c.id, p.Cedula, p.Primer_nombre, p.Primer_apellido, p.Tipo_sangre,
                    c.Condicion_sanitaria, c.Fecha_vencimiento
             FROM carnet_salud c
             LEFT JOIN personas p ON p.id = c.Personas_id
             ORDER BY c.id DESC'
        );
        $carnets = [];
        foreach ($stmt->fetchAll() as $fila) {
            $carnets[] = [
                'id' => (int) $fila['id'],
                'cedula' => $fila['Cedula'] ?? '—',
                'nombre' => trim(($fila['Primer_nombre'] ?? '') . ' ' . ($fila['Primer_apellido'] ?? '')),
                'bloodType' => $fila['Tipo_sangre'] ?? '',
                'condition' => $fila['Condicion_sanitaria'] ?? '',
                'expiry' => $fila['Fecha_vencimiento'] ?? '',
            ];
        }
        responder(['ok' => true, 'carnets' => $carnets]);
    }

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        responder(['ok' => false, 'error' => 'Método no permitido.'], 405);
    }

    $datos = entrada();

    if (($datos['accion'] ?? '') === 'eliminar') {
        $id = (int) ($datos['id'] ?? 0);
        $pdo->prepare('DELETE FROM carnet_salud WHERE id = ?')->execute([$id]);
        auditar($pdo, 'eliminar', 'carnet_salud', $id, 'Baja de carnet');
        responder(['ok' => true]);
    }

    $cedula = cedulaLimpia((string) ($datos['cedula'] ?? ''));
    $condicion = trim((string) ($datos['condition'] ?? ''));
    $vencimiento = trim((string) ($datos['expiry'] ?? ''));
    if ($cedula === '' || $condicion === '' || $vencimiento === '') {
        responder(['ok' => false, 'error' => 'Por favor complete los campos obligatorios del ciudadano y del carnet.'], 400);
    }

    $pdo->beginTransaction();
    $personaId = guardarPersona($pdo, $datos);
    $stmt = $pdo->prepare(
        'INSERT INTO carnet_salud (Personas_id, Condicion_sanitaria, Fecha_emision, Fecha_vencimiento, Estatus)
         VALUES (?, ?, CURDATE(), ?, ?)'
    );
    $stmt->execute([$personaId, $condicion, $vencimiento, 'Emitido']);
    $carnetId = (int) $pdo->lastInsertId();
    $pdo->prepare('UPDATE carnet_salud SET Codigo = ? WHERE id = ?')->execute([$carnetId, $carnetId]);
    auditar($pdo, 'insertar', 'carnet_salud', $carnetId, 'Cédula ' . $cedula);
    $pdo->commit();

    $nombre = trim((string) ($datos['firstname1'] ?? '') . ' ' . (string) ($datos['lastname1'] ?? ''));
    responder([
        'ok' => true,
        'carnet' => [
            'id' => $carnetId,
            'cedula' => $cedula,
            'nombre' => $nombre,
            'bloodType' => $datos['bloodType'] ?? '',
            'condition' => $condicion,
            'expiry' => $vencimiento,
        ],
    ]);
} catch (InvalidArgumentException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    responder(['ok' => false, 'error' => $e->getMessage()], 400);
} catch (PDOException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    responder(['ok' => false, 'error' => 'No se pudo guardar el carnet.'], 500);
}
