#!/bin/bash

# Script para parar o Kafka e limpar recursos no WSL

echo "==========================================="
echo "Parando o Kafka no WSL"
echo "==========================================="

# Navegar para o diretório do Kafka no WSL
cd /mnt/c/kafka/kafka_2.13-3.7.0

# Verificar se há processos do Kafka rodando
KAFKA_PROCESSES=$(ps aux | grep kafka | grep -v grep | awk '{print $2}')

if [ -z "$KAFKA_PROCESSES" ]; then
    echo "Nenhum processo do Kafka encontrado rodando."
else
    echo "Parando processos do Kafka..."
    echo "$KAFKA_PROCESSES" | xargs kill
    
    # Aguardar um pouco e forçar se necessário
    sleep 5
    
    # Verificar se ainda há processos rodando e forçar parada
    REMAINING_PROCESSES=$(ps aux | grep kafka | grep -v grep | awk '{print $2}')
    if [ ! -z "$REMAINING_PROCESSES" ]; then
        echo "Forçando parada dos processos restantes..."
        echo "$REMAINING_PROCESSES" | xargs kill -9
    fi
fi

echo "[OK] Kafka parado com sucesso!"

# Limpar logs se solicitado
read -p "Deseja remover os logs do Kafka? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if [ -f "kafka-server.log" ]; then
        rm kafka-server.log
        echo "[OK] Log do servidor removido"
    fi
    
    # Remover logs do diretório de logs do Kafka (se existir)
    if [ -d "logs" ]; then
        rm -rf logs/*
        echo "[OK] Logs do Kafka limpos"
    fi
fi

echo "==========================================="
echo "Kafka parado e recursos limpos!"
echo "==========================================="