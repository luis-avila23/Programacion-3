const municipios = {
    Roscio: { municipioId: 134, parroquiaId: 432, subregionId: 1 },
    Infante: { municipioId: 137, parroquiaId: 439, subregionId: 2 },
    Miranda: { municipioId: 143, parroquiaId: 453, subregionId: null }
};

const parroquias = {
    SanJuan: 432,
    Parapara: 433,
    Cantagallo: 431
};

const subregiones = {
    "Distrito 1": 1,
    "Distrito 2": 2
};

function valorPorId(mapa, id) {
    if (!id) {
        return "";
    }

    const claves = Object.keys(mapa);
    for (let i = 0; i < claves.length; i++) {
        const apunta = mapa[claves[i]];
        const comparar = typeof apunta === "object" ? apunta.municipioId : apunta;
        if (Number(comparar) === Number(id)) {
            return claves[i];
        }
    }

    return "";
}

function resolver(municipality, parish, subregion) {
    const base = municipios[municipality] || null;
    let parroquiaId = base ? base.parroquiaId : null;
    let subregionId = base ? base.subregionId : null;

    if (parish) {
        parroquiaId = Object.prototype.hasOwnProperty.call(parroquias, parish) ? parroquias[parish] : null;
    }

    if (subregion) {
        subregionId = Object.prototype.hasOwnProperty.call(subregiones, subregion) ? subregiones[subregion] : null;
    }

    return {
        parroquiaId: parroquiaId,
        subregionId: subregionId
    };
}

module.exports = {
    municipios: municipios,
    parroquias: parroquias,
    subregiones: subregiones,
    valorPorId: valorPorId,
    resolver: resolver
};
