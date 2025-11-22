#!/bin/bash

# ==============================================================================
# SCRIPT DE PREPARAÇÃO E EXECUÇÃO DO CATÁLOGO DE PNGs (Bash)
# ==============================================================================

# 1. Variáveis de Configuração
GERADOR_NODE_SCRIPT="gerar_catalogo.js"
PORTA_DO_SERVIDOR=8080
# Versão LTS atualizada do Node.js a ser instalada
NODE_VERSION="20"

echo "--- Iniciando o Processo de Deploy e Execução ---"

# Define se o comando 'sudo' é necessário (apenas se não for root)
SUDO_CMD=""
if [ "$(id -u)" != "0" ]; then
   SUDO_CMD="sudo"
fi

## SEÇÃO 0: CORREÇÃO DE ERROS DE SISTEMA (APT)
# ------------------------------------------------------------------------------

echo "## 0. Verificando a integridade do APT..."
HASHICORP_LIST="/etc/apt/sources.list.d/hashicorp.list"

# Verifica se o arquivo problemático existe
if [ -f "$HASHICORP_LIST" ]; then
    echo "⚠️ Arquivo de configuração $HASHICORP_LIST encontrado e pode estar corrompido."
    echo "Tentando renomear/remover para resolver o erro 'Malformed entry'..."
    
    # Usa rm para remover o arquivo, executado com as permissões corretas
    if $SUDO_CMD rm "$HASHICORP_LIST"; then
        echo "✅ Arquivo $HASHICORP_LIST removido com sucesso."
    else
        echo "❌ Falha ao tentar remover $HASHICORP_LIST. Verifique as permissões."
    fi
else
    echo "✅ Arquivo de fontes do Hashicorp não encontrado ou corrigido."
fi

echo "---"

## SEÇÃO 1: INSTALAÇÃO E VERIFICAÇÃO DE DEPENDÊNCIAS (NODE.JS)
# ------------------------------------------------------------------------------

echo "## 1. Verificando e Instalando Node.js (v${NODE_VERSION})..."

# Verifica se o Node.js está instalado.
if ! command -v node &> /dev/null
then
    echo "❌ Node.js não encontrado. Tentando instalar a versão ${NODE_VERSION}..."
    
    # --------------------------------------------------------------------------
    # ESTRATÉGIA DE INSTALAÇÃO DO NODE.JS (Via Gerenciador de Pacotes)
    # --------------------------------------------------------------------------
    
    # 1. Tenta usar 'apt' (Debian/Ubuntu)
    if command -v apt-get &> /dev/null; then
        echo "Usando APT para instalar o Node.js."
        
        $SUDO_CMD apt-get update
        $SUDO_CMD apt-get install -y curl
        
        echo "Adicionando repositório do NodeSource..."
        curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | $SUDO_CMD bash -
        
        $SUDO_CMD apt-get install -y nodejs
        
    # 2. Tenta usar 'yum' ou 'dnf' (RHEL/CentOS/Fedora)
    elif command -v yum &> /dev/null || command -v dnf &> /dev/null; then
        echo "Usando YUM/DNF para instalar o Node.js."
        PKG_MANAGER=$(command -v dnf || echo "yum")
        $SUDO_CMD $PKG_MANAGER install -y "nodejs"

    else
        echo "❌ Não foi possível encontrar um gerenciador de pacotes para instalar o Node.js."
        exit 1
    fi
    
    # Reverifica após a tentativa de instalação
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js não foi instalado com sucesso. Saindo."
        exit 1
    fi
    
    echo "✅ Node.js v$(node -v) instalado/verificado."
fi

# Inicializa o projeto (se package.json não existir)
if [ ! -f "package.json" ]; then
    echo "Criando package.json..."
    npm init -y > /dev/null 2>&1
fi

# Instala o servidor estático 'serve' localmente.
echo "Instalando a dependência 'serve' para servir a aplicação..."
npm install serve --save-dev

if [ $? -ne 0 ]; then
    echo "❌ Falha na instalação das dependências do npm."
    exit 1
fi

echo "✅ Dependências instaladas/verificadas."
echo "---"

## SEÇÃO 2: PREPARAÇÃO DOS DADOS (GERAÇÃO DO CATÁLOGO)
# ------------------------------------------------------------------------------

echo "## 2. Executando o script Node.js para gerar o catálogo (catalogo_png.json)..."
source ~/.bashrc 2>/dev/null || source ~/.zshrc 2>/dev/null
node $GERADOR_NODE_SCRIPT

if [ $? -ne 0 ]; then
    echo "❌ Erro ao gerar o catálogo de PNGs. Verifique o arquivo $GERADOR_NODE_SCRIPT e os caminhos."
    exit 1
fi

if [ ! -f "catalogo_png.json" ]; then
    echo "⚠️ O arquivo catalogo_png.json não foi encontrado após a execução."
    exit 1
fi

echo "✅ Catálogo de PNGs gerado com sucesso."
echo "---"

## SEÇÃO 3: EXECUÇÃO DO SERVIDOR WEB
# ------------------------------------------------------------------------------

echo "## 3. Subindo o Servidor Web Estático..."
echo "Serviço iniciado em: http://localhost:$PORTA_DO_SERVIDOR"
echo "Pressione CTRL+C para parar o servidor."

npx serve . --listen $PORTA_DO_SERVIDOR

echo "Servidor Parado."