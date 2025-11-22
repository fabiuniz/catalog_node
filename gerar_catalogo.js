// gerar_catalogo.js

const fs = require('fs');
const path = require('path');

// --- Configurações CRÍTICAS ---
const PASTA_DE_REDE_A_VARRER = '/images_png';
const PREFIXO_URL_PARA_O_FRONTEND = 'images/';
const ARQUIVO_DE_SAIDA = 'catalogo_png.json';

/**
 * Função recursiva para varrer uma pasta em busca de arquivos PNG.
 */
function varrerDiretorio(dir, relativeDir = '', contadorRef) {
    let catalogo = [];
    
    if (!fs.existsSync(dir)) {
        throw new Error(`O caminho de rede não existe ou está inacessível: ${dir}`);
    }

    const itens = fs.readdirSync(dir);

    for (const item of itens) {
        const itemPath = path.join(dir, item);
        const relativeItemPath = path.join(relativeDir, item);
        const stats = fs.statSync(itemPath);

        if (stats.isDirectory()) {
            catalogo = catalogo.concat(varrerDiretorio(itemPath, relativeItemPath, contadorRef));
        } else if (stats.isFile() && item.toLowerCase().endsWith('.png')) {
            const urlPath = path.join(PREFIXO_URL_PARA_O_FRONTEND, relativeItemPath).replace(/\\/g, '/');
            
            contadorRef.current++; 
            
            catalogo.push({
                id: contadorRef.current,
                nome: item,
                caminho: urlPath,
                caminho_rede: itemPath
            });
        }
    }
    return catalogo;
}

// --- Execução Principal ---
try {
    const contadorGlobal = { current: 0 }; 

    const catalogoFinal = varrerDiretorio(PASTA_DE_REDE_A_VARRER, '', contadorGlobal);

    const jsonOutput = JSON.stringify(catalogoFinal, null, 4);
    fs.writeFileSync(ARQUIVO_DE_SAIDA, jsonOutput);

    console.log(`✅ Catálogo de PNGs criado com sucesso em: ${ARQUIVO_DE_SAIDA}`);
    console.log(`Total de arquivos catalogados: ${catalogoFinal.length}`);
} catch (error) {
    console.error(`❌ Erro ao processar o catálogo: ${error.message}`);
    process.exit(1);
}