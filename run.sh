#!/bin/bash
#dos2unix run.sh .env; . run.sh;
# ==============================================================================
# SCRIPT DE PREPARAÇÃO E EXECUÇÃO DO CATÁLOGO DE PNGs (Bash)
# ==============================================================================

# 1. Carregar Variáveis de Configuração do .env
# Exemplo do arquivo .env:
# NODE_VERSION="20"
# GERADOR_NODE_SCRIPT="gerar_catalogo.js"
# PORTA_DO_SERVIDOR=8080
# SHARE_PATH="//Pc-fbi/d/Data1TB/Emul/Nes/Roms"
# MOUNT_POINT="/images_png"
# LINK_NAME="images"
# USERNAME="username"
# DOMAIN="nomedasuarede"
# PASSWORD="suasenhaderede"
# ----------------------------------------------
ENV_FILE="./.env"

if [ -f "$ENV_FILE" ]; then
    echo "Carregando variáveis de $ENV_FILE..."
    # 'source' ou '.' lê o arquivo e define as variáveis no shell atual
    source "$ENV_FILE"
    echo "✅ Variáveis carregadas."
else
    echo "❌ Arquivo $ENV_FILE não encontrado. Verifique se as variáveis foram definidas no script."
    # Se o arquivo .env for crucial, você pode optar por sair aqui
    # exit 1 
fi

# A partir daqui, as variáveis (GERADOR_NODE_SCRIPT, PORTA_DO_SERVIDOR, etc.)
# carregadas do .env já estarão disponíveis para o restante do script.

echo "--- Iniciando o Processo de Deploy e Execução ---"

# Define se o comando 'sudo' é necessário. Corrigimos a sintaxe do 'id -u'.
SUDO_CMD=""
# Se não for root (ID != 0), o 'sudo' é necessário para comandos como 'mount' e 'apt'.
if [ "$(id -u)" != "0" ]; then 
    SUDO_CMD="sudo"
fi

## SEÇÃO 0: CORREÇÃO DE ERROS DE SISTEMA E INSTALAÇÃO DE UTILITÁRIOS
# ------------------------------------------------------------------------------

echo "## 0. Verificando e Instalando Utilidades Essenciais (apt)..."

# Atualiza a lista de pacotes
$SUDO_CMD apt-get update
$SUDO_CMD apt install xsel

# Instala cifs-utils (necessário para o mount -t cifs) e sudo (se não estiver instalado)
$SUDO_CMD apt-get install -y cifs-utils curl sudo

if [ $? -ne 0 ]; then
    echo "❌ Falha ao instalar pacotes essenciais (cifs-utils, curl, sudo)."
    exit 1
fi
echo "✅ Utilidades essenciais instaladas/verificadas."

# Bloco para corrigir o Hashicorp (mantido do script original)
HASHICORP_LIST="/etc/apt/sources.list.d/hashicorp.list"
if [ -f "$HASHICORP_LIST" ]; then
    echo "⚠️ Arquivo de configuração $HASHICORP_LIST encontrado. Removendo..."
    $SUDO_CMD rm "$HASHICORP_LIST"
    echo "✅ Arquivo $HASHICORP_LIST removido."
fi

echo "---"

## SEÇÃO 1: INSTALAÇÃO E VERIFICAÇÃO DE DEPENDÊNCIAS (NODE.JS)
# ------------------------------------------------------------------------------

# ... (Conteúdo original da Seção 1 para instalação do Node.js e NPM, que foi omitido aqui para concisão, mas deve ser mantido no seu arquivo) ...

echo "## 1. Verificando e Instalando Node.js (v${NODE_VERSION})..."

# Bloco de instalação do Node.js (mantido do script original)
if ! command -v node &> /dev/null
then
    echo "❌ Node.js não encontrado. Tentando instalar a versão ${NODE_VERSION}..."
    if command -v apt-get &> /dev/null; then
        echo "Usando APT para instalar o Node.js."
        curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | $SUDO_CMD bash -
        $SUDO_CMD apt-get install -y nodejs
    elif command -v yum &> /dev/null || command -v dnf &> /dev/null; then
        echo "Usando YUM/DNF para instalar o Node.js."
        PKG_MANAGER=$(command -v dnf || echo "yum")
        $SUDO_CMD $PKG_MANAGER install -y "nodejs"
    else
        echo "❌ Não foi possível encontrar um gerenciador de pacotes para instalar o Node.js."
        exit 1
    fi
    
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js não foi instalado com sucesso. Saindo."
        exit 1
    fi
    echo "✅ Node.js v$(node -v) instalado/verificado."
fi

# Inicializa o projeto e instala 'serve'
if [ ! -f "package.json" ]; then
    echo "Criando package.json..."
    npm init -y > /dev/null 2>&1
fi

echo "Instalando a dependência 'serve' para servir a aplicação..."
npm install serve --save-dev

if [ $? -ne 0 ]; then
    echo "❌ Falha na instalação das dependências do npm."
    exit 1
fi

echo "✅ Dependências instaladas/verificadas."
echo "---"


## SEÇÃO 2: MONTAGEM DA REDE E GERAÇÃO DO CATÁLOGO
# ------------------------------------------------------------------------------

### 2.1 Montagem da Pasta de Rede (CIFS)

echo "## 2.1. Montando a pasta de rede CIFS..."

# 1. Cria o ponto de montagem se não existir
if [ ! -d "$MOUNT_POINT" ]; then
    echo "Criando ponto de montagem $MOUNT_POINT..."
    $SUDO_CMD mkdir -p "$MOUNT_POINT"
fi

# 2. Desmonta se já estiver montado para evitar erros
$SUDO_CMD umount -l "$MOUNT_POINT" 2>/dev/null

# 3. Tenta montar a pasta de rede
# Constrói a string de credenciais condicionalmente
CREDENTIALS=""
if [ -n "$USERNAME" ] && [ -n "$PASSWORD" ]; then
    # Se houver usuário e senha, usa-os
    CREDENTIALS="username=$USERNAME,domain=$DOMAIN,password=$PASSWORD,"
else
    # Caso contrário, tenta montar como convidado (guest)
    CREDENTIALS="guest,"
fi

if $SUDO_CMD mount -t cifs "$SHARE_PATH" "$MOUNT_POINT" -o ${CREDENTIALS}iocharset=utf8,users,file_mode=0777,dir_mode=0777,vers=3.0; then
    echo "✅ Pasta de rede montada em $MOUNT_POINT."
else
    echo "❌ Falha ao montar a pasta de rede. Verifique o caminho UNC e as credenciais."
    exit 1
fi
echo "---"

### 2.2 Geração do Catálogo (Node.js)

echo "## 2.2. Executando o script Node.js para gerar o catálogo (catalogo_png.json)..."
node $GERADOR_NODE_SCRIPT

if [ $? -ne 0 ]; then
    echo "❌ Erro ao gerar o catálogo de PNGs."
    # Desmonta a pasta em caso de erro fatal
    $SUDO_CMD umount -l "$MOUNT_POINT" 2>/dev/null 
    exit 1
fi

echo "✅ Catálogo de PNGs gerado com sucesso."
echo "---"

## SEÇÃO 3: EXECUÇÃO DO SERVIDOR WEB E LIMPEZA
# ------------------------------------------------------------------------------

echo "## 3. Subindo o Servidor Web Estático..."

### 3.1 Criação do Link Simbólico (Mapeamento Web)
echo "Criando link simbólico ($LINK_NAME) para o ponto de montagem ($MOUNT_POINT)..."
$SUDO_CMD rm -f "$LINK_NAME" # Remove link/pasta antiga
$SUDO_CMD ln -s "$MOUNT_POINT" "$LINK_NAME" # Cria o link: images -> /images_png

### 3.2 Execução do Servidor
echo "Serviço iniciado em: http://localhost:$PORTA_DO_SERVIDOR"
echo "Pressione CTRL+C para parar o servidor."

npx serve . --listen $PORTA_DO_SERVIDOR

echo "Servidor Parado."

# --- Limpeza Final ---
echo "Desmontando a pasta de rede..."
$SUDO_CMD umount -l "$MOUNT_POINT" 2>/dev/null
if [ $? -eq 0 ]; then
    echo "✅ Pasta de rede desmontada com sucesso."
else
    echo "⚠️ Não foi possível desmontar a pasta $MOUNT_POINT. (Pode estar desmontada ou em uso)."
fi

exit 0