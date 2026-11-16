<?php

function mapaMunicipios(): array
{
    return [
        'Roscio' => ['municipio_id' => 134, 'parroquia_id' => 432, 'subregion_id' => 1, 'estado' => 'Guárico'],
        'Infante' => ['municipio_id' => 137, 'parroquia_id' => 439, 'subregion_id' => 2, 'estado' => 'Guárico'],
        'Miranda' => ['municipio_id' => 143, 'parroquia_id' => 453, 'subregion_id' => null, 'estado' => 'Guárico'],
    ];
}

function mapaParroquias(): array
{
    return [
        'SanJuan' => 432,
        'Parapara' => 433,
        'Cantagallo' => 431,
    ];
}

function mapaSubregiones(): array
{
    return [
        'Distrito 1' => 1,
        'Distrito 2' => 2,
    ];
}

function valorPorId(array $mapa, ?int $id): string
{
    if (!$id) {
        return '';
    }

    foreach ($mapa as $valor => $apunta) {
        $comparar = is_array($apunta) ? $apunta['municipio_id'] : $apunta;
        if ((int) $comparar === $id) {
            return $valor;
        }
    }

    return '';
}

function resolverTerritorio(?string $municipality, ?string $parish, ?string $subregion): array
{
    $base = mapaMunicipios()[$municipality] ?? null;
    $parroquiaId = $base['parroquia_id'] ?? null;
    $subregionId = $base['subregion_id'] ?? null;

    if ($parish !== null && $parish !== '') {
        $parroquiaId = mapaParroquias()[$parish] ?? null;
    }

    if ($subregion !== null && $subregion !== '') {
        $subregionId = mapaSubregiones()[$subregion] ?? null;
    }

    return [
        'parroquia_id' => $parroquiaId,
        'subregion_id' => $subregionId,
    ];
}
