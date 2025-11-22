let dados = [];
const sectionContainer = document.querySelector('main section');
const inputBusca = document.querySelector('input[type="text"]');
// 1. Adicionar referência ao elemento onde o total será exibido
const totalRegistrosElement = document.getElementById('total-registros'); 

/**
 * Função para atualizar o contador de itens no cabeçalho.
 * @param {number} total - O número de itens a ser exibido.
 * @param {boolean} isFiltered - Indica se o total se refere a um filtro ativo.
 */
function atualizarContador(total, isFiltered = false) {
    if (isFiltered) {
        totalRegistrosElement.textContent = `Itens encontrados: ${total}`;
    } else {
        totalRegistrosElement.textContent = `Total de registros: ${total}`;
    }
}

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
        // 2. Chamar o contador após o carregamento inicial (exibe o total geral)
        atualizarContador(dados.length, false);
        // Renderiza todos os arquivos inicialmente
        renderizarArquivos(dados);
    } catch (error) {
        console.error("❌ Falha ao carregar o catálogo:", error);
        sectionContainer.innerHTML = `
            <p class="erro">Não foi possível carregar o catálogo de imagens.
            <br>Detalhes: ${error.message}</p>
        `;
        // Atualiza para uma mensagem de erro no contador
        totalRegistrosElement.textContent = "Total: Erro no carregamento";
    }
}

/**
 * Função para criar o HTML de um card de arquivo PNG.
 * @param {object} arquivo - O objeto do arquivo PNG {nome, caminho}.
 * @returns {string} O HTML do card.
 */
function criarCardHTML(arquivo) {
    // A ESTRUTURA DEVE REFLETIR O NOVO CSS DE CARTÃO    
    arquivo.caminho = arquivo.caminho || arquivo.urlCompleta;
    return `
        <article class="card arquivo-png-card">
            <img src="${arquivo.caminho}" alt="Pré-visualização do arquivo ${arquivo.nome}" class="card-imagem">
            <div class="card-detalhes">
                <h3>${arquivo.nome}</h3>
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
    const termoBusca = inputBusca.value.toLowerCase().trim();
    const isFiltered = termoBusca !== "";
    // 3. Chamar o contador na renderização, usando o tamanho da lista atual
    atualizarContador(listaDeArquivos.length, isFiltered);
    if (listaDeArquivos.length === 0) {
        sectionContainer.innerHTML = '<p class="mensagem-vazio">Nenhum arquivo PNG encontrado com o termo de busca.</p>';
        return;
    }    
    // Limpa o container antes de adicionar os novos cards
    sectionContainer.innerHTML = ''; 
    // Itera sobre a lista, cria o elemento e adiciona o listener de clique
    listaDeArquivos.forEach(arquivo => {
        // Cria o elemento Article DOM diretamente
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = criarCardHTML(arquivo).trim();
        const cardElement = tempDiv.firstChild;
        // Adiciona o evento de clique que abrirá o modal
        adicionarListenerCard(cardElement, arquivo);        
        // Adiciona o card criado ao container
        sectionContainer.appendChild(cardElement);
    });
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


// Referências para os elementos do Modal
const detalheModal = document.getElementById('detalhe-modal');
const modalImagem = document.getElementById('modal-imagem');
const modalTitulo = document.getElementById('modal-titulo');
const modalCaminho = document.getElementById('modal-caminho');
const modalInfoExtra = document.getElementById('modal-info-extra');
const modalDetalhesContainer = document.getElementById('modal-detalhes-dinamicos'); 


/**
 * Abre o modal e preenche com os detalhes do item clicado (DINÂMICO).
 * @param {object} item - O objeto de dados do item (nome, caminho, ano, genero, etc.).
 */
function abrirModal(item) {
    // 1. Preenche o cabeçalho estático (Título e Imagem)
    modalTitulo.textContent = item.nome;
    modalImagem.src = item.caminho || item.urlCompleta; // Usa 'caminho' ou 'urlCompleta'
    modalImagem.alt = `Pré-visualização de ${item.nome}`;
    // 2. Limpa o container dinâmico
    modalDetalhesContainer.innerHTML = ''; 
    // 3. Itera sobre as chaves do objeto item e cria o HTML dinamicamente
    for (const chave in item) {
        // Ignora as chaves que já são tratadas estaticamente (como 'nome' e 'caminho')
        if (chave === 'nome' || chave === 'caminho' || chave === 'urlCompleta') {
            continue;
        }
        const valor = item[chave];
        // Formata a chave para exibição (ex: "ano" -> "Ano", "genero" -> "Gênero")
        const chaveFormatada = chave.charAt(0).toUpperCase() + chave.slice(1).replace(/([A-Z])/g, ' $1');
        // Cria o parágrafo de detalhe
        const pDetalhe = document.createElement('p');
         // Verifica se o valor é uma URL e cria um link, caso contrário exibe o texto simples
        if (chave === 'linkExterno' || chave === 'url') { 
             pDetalhe.innerHTML = `${chaveFormatada}: <a href="${valor}" target="_blank">${valor}</a>`;
        } else {
            pDetalhe.innerHTML = `${chaveFormatada}: ${valor}`;
        }
         modalDetalhesContainer.appendChild(pDetalhe);
    }
     // 4. Torna o modal visível
    detalheModal.style.display = "block";
     // Adiciona o listener para fechar o modal ao clicar fora
    window.onclick = function(event) {
        if (event.target === detalheModal) {
            fecharModal();
        }
    }
}

/**
 * Fecha o modal.
 */
function fecharModal() {
    detalheModal.style.display = "none";
    window.onclick = null; // Remove o listener para evitar fechar a página inteira
}

/**
 * Funções adicionais para manipular o clique no card.
 * @param {HTMLElement} cardElement - O elemento <article> do card.
 * @param {object} arquivo - O objeto de dados do arquivo ({nome, caminho}).
 */
function adicionarListenerCard(cardElement, arquivo) {
    cardElement.addEventListener('click', () => {
        abrirModal(arquivo);
    });
}

// --- Inicialização e Listeners ---

// 1. Inicia a busca pelos dados ao carregar a página
document.addEventListener('DOMContentLoaded', iniciarBusca);

// 2. Adiciona o listener de evento para o campo de input para filtrar dinamicamente
// Isso torna a busca responsiva (em tempo real)
inputBusca.addEventListener('input', filtrarArquivos);