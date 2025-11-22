// gerar_catalogo.js

const fs = require('fs');
const path = require('path');

// --- Configurações CRÍTICAS (Ajuste Aqui) ---
// 1. O CAMINHO DA REDE que o Node.js irá varrer.
// O usuário que roda o script DEVE ter permissão de leitura.
// Exemplo (Windows UNC): '\\\\SEU_SERVIDOR\\SUA_PASTA_COMPARTILHADA\\imagens_png';
const PASTA_DE_REDE_A_VARRER = '\\\\Pc-fbi\\d\\Data1TB\\Emul\\Nes\\Roms\\downloaded_images';

// 2. O PREFIXO URL que o navegador usará para acessar a imagem.
// Se seu servidor serve a pasta de imagens em http://localhost:8080/assets/imgs, use 'assets/imgs'.
const PREFIXO_URL_PARA_O_FRONTEND = 'images/'; 
// ---------------------------------------------

const ARQUIVO_DE_SAIDA = 'catalogo_png.json';

/**
 * Função recursiva para varrer uma pasta em busca de arquivos PNG.
 * @param {string} dir O diretório a ser varrido.
 * @param {string} relativeDir O caminho relativo (usado para montar o URL).
 */
function varrerDiretorio(dir, relativeDir = '') {
    let catalogo = [];
    
    // Testa se o diretório existe e é acessível
    if (!fs.existsSync(dir)) {
        throw new Error(`O caminho de rede não existe ou está inacessível: ${dir}`);
    }

    const itens = fs.readdirSync(dir);

    for (const item of itens) {
        const itemPath = path.join(dir, item);
        const relativeItemPath = path.join(relativeDir, item);
        const stats = fs.statSync(itemPath);

        if (stats.isDirectory()) {
            // Se for um diretório, varre recursivamente
            catalogo = catalogo.concat(varrerDiretorio(itemPath, relativeItemPath));
        } else if (stats.isFile() && item.toLowerCase().endsWith('.png')) {
            // Se for um arquivo .png, monta o URL para o frontend
            const urlPath = path.join(PREFIXO_URL_PARA_O_FRONTEND, relativeItemPath).replace(/\\/g, '/');
            catalogo.push({
                nome: item,
                caminho: urlPath, // O navegador usará este URL
                caminho_rede: itemPath // Para referência
            });
        }
    }
    return catalogo;
}

// --- Execução Principal ---
try {
    const catalogoFinal = varrerDiretorio(PASTA_DE_REDE_A_VARRER);

    const jsonOutput = JSON.stringify(catalogoFinal, null, 4);
    fs.writeFileSync(ARQUIVO_DE_SAIDA, jsonOutput);

    console.log(`✅ Catálogo de PNGs criado com sucesso em: ${ARQUIVO_DE_SAIDA}`);
    console.log(`Total de arquivos catalogados: ${catalogoFinal.length}`);
} catch (error) {
    console.error(`❌ Erro ao processar o catálogo: ${error.message}`);
    process.exit(1);
}