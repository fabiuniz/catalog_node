let dados = [];
const sectionContainer = document.querySelector('main section');
const inputBusca = document.querySelector('input[type="text"]');

/**
 * Função para buscar o arquivo JSON de catálogo e iniciar a renderização.
 * Assume que 'catalogo_png.json' foi gerado pelo script Node.js.
 */
async function iniciarBusca() {
    console.log("Iniciando busca do catálogo de PNGs...");
    try {
        // --- CHAVE: Buscar o novo arquivo JSON gerado pelo backend ---
        let resposta = await fetch("catalogo_png.json");
        
        if (!resposta.ok) {
            // Se o arquivo não for encontrado, significa que o Node.js não o criou ou o caminho está errado.
            throw new Error(`Erro HTTP! Status: ${resposta.status}. Certifique-se de ter rodado o script Node.js.`);
        }
        
        // Os dados agora são um array de objetos {nome: string, caminho: string}
        dados = await resposta.json();
        console.log(`Catálogo carregado: ${dados.length} arquivos.`);
        
        // Renderiza todos os arquivos inicialmente
        renderizarArquivos(dados);
    } catch (error) {
        console.error("❌ Falha ao carregar o catálogo:", error);
        sectionContainer.innerHTML = `
            <p class="erro">Não foi possível carregar o catálogo de imagens.
            <br>Detalhes: ${error.message}</p>
        `;
    }
}

/**
 * Função para criar o HTML de um card de arquivo PNG.
 * @param {object} arquivo - O objeto do arquivo PNG {nome, caminho}.
 * @returns {string} O HTML do card.
 */
function criarCardHTML(arquivo) {
    // Usamos 'caminho' para a URL da imagem e 'nome' para o título e alt.
    return `
        <article class="card arquivo-png-card">
            <div class="card-header">
                <img src="${arquivo.caminho}" alt="Pré-visualização do arquivo ${arquivo.nome}" class="card-imagem">
                <h3>${arquivo.nome}</h3>
            </div>
            <div class="card-detalhes">
                <span class="caminho-relativo">Caminho: ${arquivo.caminho}</span>
            </div>
        </article>
    `;
}

/**
 * Função para renderizar um array de arquivos na seção principal.
 * @param {Array<object>} listaDeArquivos - O array de arquivos PNG a ser exibido.
 */
function renderizarArquivos(listaDeArquivos) {
    if (listaDeArquivos.length === 0) {
        sectionContainer.innerHTML = '<p class="mensagem-vazio">Nenhum arquivo PNG encontrado com o termo de busca.</p>';
        return;
    }
    
    // Mapeia o array para strings HTML e junta-as.
    const htmlCards = listaDeArquivos.map(criarCardHTML).join('');
    sectionContainer.innerHTML = htmlCards;
}

/**
 * Função principal para filtrar os arquivos com base no texto digitado.
 * O filtro é "responsivo", pois é acionado a cada digitação (input).
 */
function filtrarArquivos() {
    const termoBusca = inputBusca.value.toLowerCase().trim();
    
    if (termoBusca === "") {
        // Se a busca estiver vazia, renderiza todos os dados originais
        renderizarArquivos(dados);
        return;
    }

    const resultadosFiltrados = dados.filter(arquivo => {
        // Filtra pelo nome do arquivo (sem case sensitive)
        return arquivo.nome.toLowerCase().includes(termoBusca);
    });

    renderizarArquivos(resultadosFiltrados);
}


// --- Inicialização e Listeners ---

// 1. Inicia a busca pelos dados ao carregar a página
document.addEventListener('DOMContentLoaded', iniciarBusca);

// 2. Adiciona o listener de evento para o campo de input para filtrar dinamicamente
// Isso torna a busca responsiva (em tempo real)
inputBusca.addEventListener('input', filtrarArquivos);