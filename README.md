<!--
    Tags: Dev, Fund
    Label: 🖼️ Gerador e Catálogo Web de Arquivos PNG
    Description: Indexa e exibe imagens PNG de um compartilhamento de rede (SMB/CIFS) em uma galeria web estática com busca.
    technical_requirement:  Node.js, npm, cifs-utils, Linux/WSL/macOS, Arquivo .env, Protocolo SMB/CIFS (UNC Path).
    path_hook: hookfigma.hook7, hookfigma.hook8
-->
# 🖼️ Catálogo de PNGs com Servidor Estático e Enriquecimento Gemini

![Texto Alternativo da Imagem](catalog_node.png)

Este projeto é uma solução completa para indexar imagens **PNG** de uma pasta de rede (SMB/CIFS) e exibi-las em uma **galeria web estática** com funcionalidade de busca. Ele automatiza o processo de catalogação de arquivos de um compartilhamento de rede, **enriquecendo os metadados** com descrições e tags geradas por **Inteligência Artificial (Gemini API)**.

## 💡 O Que Este Projeto Faz

1.  **Montagem de Rede:** Monta automaticamente um compartilhamento de rede (UNC Path) usando `cifs-utils` (Linux/WSL).
2.  **Catalogação:** Um script Node.js (`gerar_catalogo.js`) varre recursivamente a pasta montada e gera um arquivo `catalogo_png.json`.
3.  **Enriquecimento AI (NOVO):** Um segundo script (`gemini_riched.js`) usa a **Gemini API** para adicionar **descrições, gêneros e tags** a um conjunto de itens do catálogo.
4.  **Visualização:** Uma interface web (HTML/CSS/JS) carrega o catálogo e exibe as imagens em cards interativos com funcionalidade de busca em tempo real.

---

## 🛠️ Como Configurar e Executar

Para executar o projeto, você só precisa configurar suas credenciais de rede e a **chave de API do Gemini**.

### 1. Pré-requisitos

* Um ambiente baseado em **Unix** (Linux, WSL no Windows, ou macOS).
* **Node.js** e **npm** (O script `run.sh` tentará instalá-los se necessário).

### 2. Configuração do `.env` (Obrigatório)

Crie um arquivo chamado **`.env`** na raiz do projeto com as informações da sua pasta de rede e a **chave do Gemini**.

> ⚠️ **ATENÇÃO:** O `SHARE_PATH` é o caminho UNC da sua pasta compartilhada de imagens.

```bash
# .env - Variáveis de Rede e API
SHARE_PATH="//[IP_ou_NOME_DO_SERVIDOR]/[Caminho/Compartilhamento]"
MOUNT_POINT="/images_png"
USERNAME="seu_usuario_de_rede"
DOMAIN="seu_dominio_de_rede" # Pode ser o nome do seu PC ou WORKGROUP
PASSWORD="sua_senha_de_rede"

# Chave de API para enriquecer o catálogo com descrições e tags.
GEMINI_API_KEY="SUA_CHAVE_AQUI" 👈 NOVO e Obrigatório
```

### 3. Execução.

```bash

# Executa todas as etapas (Montagem, Catalogação, Enriquecimento, e inicia o servidor)
./run.sh

# Para rodar APENAS o servidor web e pular a geração/enriquecimento (usa o JSON existente):
./run.sh --skip-json

# Para rodar APENAS o servidor web sem alterações de catalogo e ajustes do gemini. 
./run.sh --skip-json --skip-generation;
```

## 🚀 Como Funciona (Fluxo de Automação)

| Etapa | Ferramenta/Tecnologia | Resultado/Ação |
| :--- | :--- | :--- |
| 0. Instalação  `npm` | Instala `serve` e a biblioteca `@google/genai`. |
| 1. Conexão | `cifs-utils` (Linux/WSL) | Montagem automática do compartilhamento de rede (UNC Path). |
| 2. Catalogação | Script Node.js (`gerar_catalogo.js`) | Varredura recursiva e geração do índice `catalogo_png.json`. |
| 3. Enriquecimento  Gemini API (`@google/genai`) | Adiciona descrição e tags geradas por IA aos metadados (até 10 chamadas). |
| 4. Visualização | Interface Web Estática (HTML/CSS/JS) | Carrega o JSON e exibe cards de imagens com busca em tempo real. |

---

## ✅ Guia de Início Rápido (Insights Acionáveis)

| Requisito | Ação Essencial | Palavra-Chave |
| :--- | :--- | :--- |
| Ambiente | Deve ser baseado em Unix (Linux, WSL ou macOS). | Unix/WSL |
| Desenvolvimento | Instalar Node.js e npm. (O `run.sh` pode tentar ajudar). | Node.js |
| Configuração | Obrigatório criar o arquivo `.env` na raiz. | Arquivo .env |
| Chave Vital | Configurar o `SHARE_PATH` (o caminho UNC da rede) corretamente no `.env`. | SHARE_PATH |
| Execução  Para rodar use `./run.sh --skip-json`

---

## 📚 Glossário de Jargões (Para Entender o Contexto)

* PNG: Formato de imagem digital (sem perda de qualidade), ideal para gráficos e web.
* SMB/CIFS: (Server Message Block / Common Internet File System) Protocolos de rede usados para compartilhar arquivos entre computadores (ex: pastas de rede).
* UNC Path: O formato de endereço de um recurso compartilhado em uma rede (ex: `\\servidor\recurso`).
* cifs-utils: Utilitários Linux para realizar a montagem de compartilhamentos de rede SMB/CIFS.
* Node.js: Ambiente que permite executar JavaScript no lado do servidor, fora do navegador.
* npm: (Node Package Manager) O gerenciador padrão de pacotes/bibliotecas para projetos Node.js. 
* Gemini API: A interface de programação de aplicações do Google que permite usar os modelos de Inteligência Artificial para tarefas como geração de texto e dados. 