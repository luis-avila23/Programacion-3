<?php

require __DIR__ . '/bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    responder(['ok' => false, 'error' => 'Método no permitido.'], 405);
}

$datos = entrada();

try {
    if (($datos['accion'] ?? '') === 'eliminar_dosis') {
        $id = (int) ($datos['id'] ?? 0);
        $pdo->prepare('DELETE FROM dosis WHERE id = ?')->execute([$id]);
        auditar($pdo, 'eliminar', 'dosis', $id, 'Baja de dosis');
        responder(['ok' => true]);
    }

    $cedula = cedulaLimpia((string) ($datos['cedula'] ?? ''));
    if ($cedula === '' || trim((string) ($datos['firstname1'] ?? '')) === '' || trim((string) ($datos['lastname1'] ?? '')) === '') {
        responder(['ok' => false, 'error' => 'Complete cédula, primer nombre y primer apellido.'], 400);
    }

    $datos['cedula'] = $cedula;
    $pdo->beginTransaction();
    $personaId = guardarPersona($pdo, $datos);
    auditar($pdo, 'guardar', 'personas', $personaId, 'Cédula ' . $cedula);

    $ids = [];
    foreach ($datos['dosis'] ?? [] as $item) {
        if (!is_array($item)) {
            continue;
        }
        $dosisId = insertarDosis($pdo, $personaId, $item);
        auditar($pdo, 'insertar', 'dosis', $dosisId, (string) ($item['nombre'] ?? ''));
        $ids[] = $dosisId;
    }

    $pdo->commit();
    responder(['ok' => true, 'ids' => $ids]);
} catch (InvalidArgumentException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    responder(['ok' => false, 'error' => $e->getMessage()], 400);
} catch (PDOException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    responder(['ok' => false, 'error' => 'No se pudo guardar el expediente.'], 500);
}
