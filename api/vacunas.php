<?php

require __DIR__ . '/bootstrap.php';

try {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $stmt = $pdo->query('SELECT id, Nombre AS nombre, Esquema AS esquema FROM vacunas ORDER BY id');
        $vacunas = [];
        foreach ($stmt->fetchAll() as $fila) {
            $vacunas[] = [
                'id' => (int) $fila['id'],
                'nombre' => $fila['nombre'] ?? '',
                'esquema' => $fila['esquema'] ?? '',
            ];
        }
        responder(['ok' => true, 'vacunas' => $vacunas]);
    }

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        responder(['ok' => false, 'error' => 'Método no permitido.'], 405);
    }

    $datos = entrada();

    if (($datos['accion'] ?? '') === 'eliminar') {
        $id = (int) ($datos['id'] ?? 0);
        $pdo->prepare('DELETE FROM vacunas WHERE id = ?')->execute([$id]);
        auditar($pdo, 'eliminar', 'vacunas', $id, 'Baja de biológico');
        responder(['ok' => true]);
    }

    $nombre = trim((string) ($datos['nombre'] ?? ''));
    $esquema = trim((string) ($datos['esquema'] ?? ''));
    if ($nombre === '' || $esquema === '') {
        responder(['ok' => false, 'error' => 'Complete los datos del biológico.'], 400);
    }

    $stmt = $pdo->prepare('INSERT INTO vacunas (Nombre, Esquema) VALUES (?, ?)');
    $stmt->execute([$nombre, $esquema]);
    $id = (int) $pdo->lastInsertId();
    auditar($pdo, 'insertar', 'vacunas', $id, $nombre);

    responder([
        'ok' => true,
        'vacuna' => [
            'id' => $id,
            'nombre' => $nombre,
            'esquema' => $esquema,
        ],
    ]);
} catch (PDOException $e) {
    if ($e->getCode() === '23000') {
        responder(['ok' => false, 'error' => 'No se puede eliminar: el biológico tiene dosis registradas.'], 409);
    }
    responder(['ok' => false, 'error' => 'No se pudo guardar el biológico.'], 500);
}
