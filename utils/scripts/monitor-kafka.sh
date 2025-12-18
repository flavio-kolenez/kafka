#!/bin/bash

# Script para verificar status do Kafka e mostrar logs
# Executa dentro do WSL

echo "==========================================="
echo "MONITOR DO STATUS DO KAFKA"
echo "==========================================="

# Navegar para o diretório do Kafka
cd /mnt/c/kafka/kafka_2.13-3.7.0

# Verificar se há processos do Kafka rodando
KAFKA_PROCESSES=$(ps aux | grep kafka | grep -v grep)

if [ -z "$KAFKA_PROCESSES" ]; then
    echo "[ERRO] KAFKA NÃO ESTÁ RODANDO"
    echo ""
    echo "Para iniciar o Kafka, execute:"
    echo "  ./setup-kafka.sh"
    exit 1
else
    echo "[OK] KAFKA ESTÁ RODANDO"
    echo ""
    echo "Processos do Kafka:"
    echo "$KAFKA_PROCESSES" | while read line; do
        PID=$(echo $line | awk '{print $2}')
        echo "  - PID: $PID"
    done
fi

echo ""
echo "Testando conexão com o broker..."
if bin/kafka-broker-api-versions.sh --bootstrap-server localhost:9092 >/dev/null 2>&1; then
    echo "[OK] Broker respondendo na porta 9092"
else
    echo "[ERRO] Broker não está respondendo na porta 9092"
fi

echo ""
echo "Tópicos disponíveis:"
topics=$(bin/kafka-topics.sh --list --bootstrap-server localhost:9092 2>/dev/null)
if [ $? -eq 0 ] && [ ! -z "$topics" ]; then
    echo "$topics" | while read topic; do
        echo "  - $topic"
    done
else
    echo "  [ERRO] Não foi possível listar os tópicos"
fi

echo ""
echo "Últimas 10 linhas do log:"
echo "----------------------------------------"
if [ -f "kafka-server.log" ]; then
    tail -10 kafka-server.log
else
    echo "[ERRO] Arquivo de log não encontrado"
fi
echo "----------------------------------------"

echo ""
echo "Opções:"
echo "1. Ver logs em tempo real (tail -f)"
echo "2. Verificar status novamente" 
echo "3. Parar Kafka"
echo "4. Sair"

read -p "Escolha uma opção (1-4): " choice

case $choice in
    1)
        echo ""
        echo "Mostrando logs em tempo real (Ctrl+C para parar)..."
        tail -f kafka-server.log
        ;;
    2)
        echo ""
        exec $0
        ;;
    3)
        echo ""
        echo "Parando Kafka..."
        ./stop-kafka.sh
        ;;
    4)
        echo "Até logo!"
        exit 0
        ;;
    *)
        echo "[ERRO] Opção inválida"
        ;;
esac