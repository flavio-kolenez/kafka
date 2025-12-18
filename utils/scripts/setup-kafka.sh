#!/bin/bash

# Script para configurar e inicializar o Kafka dentro do WSL
# Baseado no arquivo docs/kafka.txt

echo "==========================================="
echo "Iniciando configuração do Kafka no WSL"
echo "==========================================="

# Navegar para o diretório do Kafka no WSL
echo "Navegando para o diretório do Kafka..."
cd /mnt/c/kafka/kafka_2.13-3.7.0

# Verificar se o diretório existe
if [ ! -d "$(pwd)" ]; then
    echo "ERRO: Diretório do Kafka não encontrado!"
    echo "Verifique se o Kafka está instalado em /mnt/c/kafka/kafka_2.13-3.7.0"
    exit 1
fi

# Gerar UUID para o cluster
echo "Gerando UUID para o cluster..."
CLUSTER_UUID=$(bin/kafka-storage.sh random-uuid)
echo "UUID gerado: $CLUSTER_UUID"

# Formatar o storage do Kafka
echo "Formatando o storage do Kafka..."
bin/kafka-storage.sh format -t $CLUSTER_UUID -c config/kraft/server.properties

# Iniciar o servidor Kafka em background
echo "Iniciando o servidor Kafka..."
echo "O servidor será iniciado em background. Para parar, use Ctrl+C ou mate o processo."
nohup bin/kafka-server-start.sh config/kraft/server.properties > kafka-server.log 2>&1 &
KAFKA_PID=$!

echo "Servidor Kafka iniciado com PID: $KAFKA_PID"
echo "Log do servidor está sendo salvo em: kafka-server.log"

# Aguardar um pouco para o servidor inicializar
echo "Aguardando 15 segundos para o servidor inicializar..."
sleep 15

# Verificar se o servidor está rodando e mostrar logs
echo ""
echo "==========================================="
echo "VERIFICANDO STATUS DO SERVIDOR KAFKA"
echo "==========================================="

# Verificar se o processo ainda está rodando
if kill -0 $KAFKA_PID 2>/dev/null; then
    echo "[OK] Processo do Kafka está rodando (PID: $KAFKA_PID)"
else
    echo "[ERRO] Processo do Kafka não está rodando!"
    echo "Últimas linhas do log de erro:"
    tail -20 kafka-server.log
    exit 1
fi

# Mostrar últimas linhas do log do servidor
echo ""
echo "Últimas linhas do log do servidor:"
echo "----------------------------------------"
tail -10 kafka-server.log
echo "----------------------------------------"

# Tentar conectar no broker para verificar se está realmente funcionando
echo ""
echo "Testando conexão com o broker Kafka..."
if bin/kafka-broker-api-versions.sh --bootstrap-server localhost:9092 >/dev/null 2>&1; then
    echo "[OK] Broker Kafka está respondendo na porta 9092"
    echo "[OK] Servidor está pronto para receber conexões!"
else
    echo "[AVISO] Broker não está respondendo. Aguardando mais um pouco..."
    sleep 5
    if bin/kafka-broker-api-versions.sh --bootstrap-server localhost:9092 >/dev/null 2>&1; then
        echo "[OK] Broker Kafka agora está respondendo na porta 9092"
        echo "[OK] Servidor está pronto para receber conexões!"
    else
        echo "[ERRO] Broker ainda não está respondendo. Verifique os logs."
    fi
fi

echo ""

# Criar tópicos
echo "Criando tópicos do Kafka..."

topics=("newOrder" "validOrder" "orderError" "orderLog")

for topic in "${topics[@]}"; do
    echo "Criando tópico: $topic"
    bin/kafka-topics.sh --create --topic $topic --bootstrap-server localhost:9092 --partitions 1 --replication-factor 1
    
    # Verificar se o tópico foi criado com sucesso
    if [ $? -eq 0 ]; then
        echo "[OK] Tópico $topic criado com sucesso"
    else
        echo "[ERRO] Erro ao criar tópico $topic"
    fi
done

echo "==========================================="
echo "Configuração do Kafka finalizada!"
echo "==========================================="
echo "Servidor Kafka rodando com PID: $KAFKA_PID"
echo "Para ver os logs do servidor: tail -f kafka-server.log"
echo "Para parar o servidor: kill $KAFKA_PID"
echo ""
echo "STATUS DO SERVIDOR:"
echo "  [OK] Processo ativo: PID $KAFKA_PID"
echo "  [OK] Porta: 9092"
echo "  [OK] Logs salvos em: kafka-server.log"
echo ""
echo "Tópicos criados:"
for topic in "${topics[@]}"; do
    echo "  - $topic"
done
echo ""
echo "Comandos úteis:"
echo "  # Listar tópicos:"
echo "    bin/kafka-topics.sh --list --bootstrap-server localhost:9092"
echo ""
echo "  # Ver logs em tempo real:"
echo "    tail -f kafka-server.log"
echo ""
echo "  # Testar conexão:"
echo "    bin/kafka-broker-api-versions.sh --bootstrap-server localhost:9092"
echo ""
echo "Kafka está pronto para uso!"
echo ""
echo "Pressione Enter para mostrar os logs em tempo real (Ctrl+C para sair):"
read -r
echo "Mostrando logs do Kafka (Ctrl+C para parar)..."
tail -f kafka-server.log