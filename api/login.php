<?php

require __DIR__ . '/bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    responder(['ok' => false, 'error' => 'Método no permitido.'], 405);
}

$datos = entrada();
$correo = strtolower(trim((string) ($datos['username'] ?? '')));
$password = (string) ($datos['password'] ?? '');

if ($correo === '' || $password === '') {
    responder(['ok' => false, 'error' => 'Ingrese usuario y contraseña.'], 400);
}

$stmt = $pdo->prepare(
    'SELECT id, Password, Rol FROM usuarios WHERE LOWER(Correo) = ? LIMIT 1'
);
$stmt->execute([$correo]);
$usuario = $stmt->fetch();
$hash = $usuario ? (string) ($usuario['Password'] ?? '') : '';

if (!$usuario || $hash === '' || !password_verify($password, $hash)) {
    responder(['ok' => false, 'error' => 'Usuario o contraseña incorrectos.'], 401);
}

$_SESSION['usuario_id'] = (int) $usuario['id'];
$_SESSION['rol'] = $usuario['Rol'];

responder([
    'ok' => true,
    'rol' => $usuario['Rol'],
]);
