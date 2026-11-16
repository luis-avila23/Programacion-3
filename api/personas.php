<?php

require __DIR__ . '/bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $cedula = cedulaLimpia((string) ($_GET['cedula'] ?? ''));
    if ($cedula === '') {
        responder(['ok' => false, 'error' => 'Ingrese un número de cédula.'], 400);
    }

    responder([
        'ok' => true,
        'persona' => fichaPersona($pdo, $cedula),
    ]);
}

responder(['ok' => false, 'error' => 'Método no permitido.'], 405);
