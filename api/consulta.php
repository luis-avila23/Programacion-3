<?php

require __DIR__ . '/bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    responder(['ok' => false, 'error' => 'Método no permitido.'], 405);
}

$cedula = cedulaLimpia((string) ($_GET['cedula'] ?? ''));
if ($cedula === '') {
    responder(['ok' => false, 'error' => 'Ingrese un número de cédula.'], 400);
}

$persona = fichaPersona($pdo, $cedula);
if (!$persona) {
    responder(['ok' => true, 'registro' => null]);
}

$vacunas = array_map(function (array $dosis) {
    return [
        'nombre' => $dosis['nombre'],
        'dosis' => $dosis['numero'],
        'estado' => $dosis['estado'],
    ];
}, $persona['dosis']);

responder([
    'ok' => true,
    'registro' => [
        'firstname1' => $persona['firstname1'],
        'firstname2' => $persona['firstname2'],
        'lastname1' => $persona['lastname1'],
        'lastname2' => $persona['lastname2'],
        'municipality' => $persona['municipality'],
        'bloodType' => $persona['bloodType'],
        'condition' => $persona['condition'],
        'expiry' => $persona['expiry'],
        'vacunas' => $vacunas,
    ],
]);
