<?php

require __DIR__ . '/bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    responder(['ok' => false, 'error' => 'Método no permitido.'], 405);
}

$stmt = $pdo->query(
    'SELECT COALESCE(e.estado, \'Sin jurisdicción\') AS estado,
            COALESCE(m.municipio, \'—\') AS municipio,
            COUNT(d.id) AS total
     FROM dosis d
     JOIN personas p ON p.id = d.Personas_id
     LEFT JOIN parroquias pa ON pa.id_parroquia = p.id_parroquia
     LEFT JOIN municipios m ON m.id_municipio = pa.id_municipio
     LEFT JOIN estados e ON e.id_estado = m.id_estado
     GROUP BY COALESCE(e.estado, \'Sin jurisdicción\'), COALESCE(m.municipio, \'—\')
     ORDER BY total DESC'
);

$filas = [];
foreach ($stmt->fetchAll() as $fila) {
    $filas[] = [
        'estado' => $fila['estado'],
        'municipio' => $fila['municipio'],
        'total' => (int) $fila['total'],
        'sistema' => 'Operativo',
        'accion' => 'Auditado',
    ];
}

responder(['ok' => true, 'filas' => $filas]);
