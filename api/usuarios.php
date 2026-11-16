<?php

require __DIR__ . '/bootstrap.php';

try {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $stmt = $pdo->query(
            'SELECT id, Nombre, Apellido, Correo, Rol, Cargo
             FROM usuarios
             ORDER BY id'
        );
        $usuarios = [];
        foreach ($stmt->fetchAll() as $fila) {
            $usuarios[] = [
                'id' => (int) $fila['id'],
                'nombre' => trim(($fila['Nombre'] ?? '') . ' ' . ($fila['Apellido'] ?? '')),
                'correo' => $fila['Correo'] ?? '',
                'rol' => $fila['Rol'] ?: ($fila['Cargo'] ?? ''),
            ];
        }
        responder(['ok' => true, 'usuarios' => $usuarios]);
    }

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        responder(['ok' => false, 'error' => 'Método no permitido.'], 405);
    }

    $datos = entrada();

    if (($datos['accion'] ?? '') === 'eliminar') {
        $id = (int) ($datos['id'] ?? 0);
        $pdo->prepare('DELETE FROM usuarios WHERE id = ?')->execute([$id]);
        auditar($pdo, 'eliminar', 'usuarios', $id, 'Baja de usuario');
        responder(['ok' => true]);
    }

    $nombre = trim((string) ($datos['nombre'] ?? ''));
    $correo = strtolower(trim((string) ($datos['correo'] ?? '')));
    $rol = trim((string) ($datos['rol'] ?? ''));
    $roles = ['Master', 'Subregion', 'Vacunador'];

    if ($nombre === '' || $correo === '' || !in_array($rol, $roles, true)) {
        responder(['ok' => false, 'error' => 'Complete todos los campos.'], 400);
    }

    $existe = $pdo->prepare('SELECT id FROM usuarios WHERE LOWER(Correo) = ? LIMIT 1');
    $existe->execute([$correo]);
    if ($existe->fetch()) {
        responder(['ok' => false, 'error' => 'Ese correo ya está registrado.'], 409);
    }

    $stmt = $pdo->prepare(
        'INSERT INTO usuarios (Nombre, Apellido, Centros_id, Cargo, Correo, Password, Rol)
         VALUES (?, ?, 1, ?, ?, ?, ?)'
    );
    $stmt->execute([
        $nombre,
        '',
        $rol,
        $correo,
        password_hash('sivan123', PASSWORD_DEFAULT),
        $rol,
    ]);
    $id = (int) $pdo->lastInsertId();
    auditar($pdo, 'insertar', 'usuarios', $id, $correo);

    responder([
        'ok' => true,
        'usuario' => [
            'id' => $id,
            'nombre' => $nombre,
            'correo' => $correo,
            'rol' => $rol,
        ],
    ]);
} catch (PDOException $e) {
    responder(['ok' => false, 'error' => 'No se pudo guardar el usuario.'], 500);
}
