<?php

session_start();
header('Content-Type: application/json; charset=utf-8');

require __DIR__ . '/conexion.php';
require __DIR__ . '/territorio.php';
require __DIR__ . '/persona_repo.php';

function responder(array $data, int $code = 200): void
{
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function entrada(): array
{
    $json = json_decode(file_get_contents('php://input'), true);
    if (is_array($json)) {
        return $json;
    }

    return $_POST;
}

function auditar(PDO $pdo, string $accion, string $tabla, ?int $registroId, ?string $detalle): void
{
    $usuarioId = isset($_SESSION['usuario_id']) ? (int) $_SESSION['usuario_id'] : null;
    $stmt = $pdo->prepare(
        'INSERT INTO auditoria_logs (Usuarios_id, Accion, Tabla_afectada, Registro_id, Detalle)
         VALUES (?, ?, ?, ?, ?)'
    );
    $stmt->execute([$usuarioId, $accion, $tabla, $registroId, $detalle]);
}

try {
    $pdo = conectar();
} catch (PDOException $e) {
    responder([
        'ok' => false,
        'error' => 'No hay conexión con MariaDB. Active MySQL en XAMPP e importe programacion_3.sql y database/ajustes.sql.',
    ], 500);
}

set_exception_handler(function (Throwable $e): void {
    if ($e instanceof InvalidArgumentException) {
        responder(['ok' => false, 'error' => $e->getMessage()], 400);
    }

    responder([
        'ok' => false,
        'error' => 'Error de base de datos. Importe database/ajustes.sql si aún no lo hizo.',
    ], 500);
});
