# Requisitos

## Sumário

-   [Visão Geral](#visão-geral)
-   [Fluxo do Sistema](#fluxo-do-sistema)
-   [Tópicos Kafka](#tópicos-kafka)
-   [Producer API](#producer-api)
-   [Consumers Pipeline](#consumers-pipeline)
-   [Consumers Globais](#consumers-globais)

## Visão Geral

O sistema implementa um **pipeline sequencial** onde cada etapa depende da anterior:

-   **Producer API**: Recebe pedidos e publica no Kafka
-   **Pipeline de 3 Consumers**: Validação → Estoque → Email
-   **2 Consumers Globais**: Log e Erro

## Fluxo do Sistema
[Clique para ver o fluxo!](https://www.canva.com/design/DAG67bM0dOA/O9jAR7gLBn-b5vefPdTw8A/edit)

## Tópicos Kafka

| Tópico | Descrição | Producers | Consumers |
|--------|-----------|-----------|-----------|
| `newOrder` | Pedido criado pela API | Producer API | validation-consumer |
| `validOrder` | Pedido validado com sucesso | validation-consumer | stock-consumer |
| `processedStockOrder` | Estoque atualizado | stock-consumer | email-consumer |
| `emailSent` | Email enviado com sucesso | email-consumer | - |
| `orderError` | Erros em qualquer etapa | todos os consumers | error-consumer |
| `orderLog` | Logs de todas as operações | todos os consumers | log-consumer |

## Producer API

### Criar pedido

```http
POST /messages/order
Content-Type: application/json

{
    "order_id": "1234",
    "user_email": "cliente@example.com",
    "items": [
        { "sku": "ABC123", "qty": 2, "price": 29.99 },
        { "sku": "XYZ999", "qty": 1, "price": 59.99 }
    ]
}
```

**Comportamento:**
1. Valida formato básico
2. Publica no tópico `newOrder`
3. Retorna confirmação

## Consumers Pipeline

### 1. Validation Consumer
- **Escuta**: `newOrder`
- **Comportamento**:
  - Valida estrutura do pedido
  - Verifica se SKUs existem
  - Valida email format
- **Publica**:
  - ✅ Sucesso: `validOrder` + `orderLog`
  - ❌ Erro: `orderError` + `orderLog`

### 2. Stock Consumer
- **Escuta**: `validOrder`
- **Comportamento**:
  - Verifica disponibilidade de estoque
  - Debita do estoque
  - Reserva produtos
- **Publica**:
  - ✅ Sucesso: `processedStockOrder` + `orderLog`
  - ❌ Erro: `orderError` + `orderLog`

### 3. Email Consumer
- **Escuta**: `processedStockOrder`
- **Comportamento**:
  - Gera conteúdo do email
  - Simula envio
  - Confirma entrega
- **Publica**:
  - ✅ Sucesso: `emailSent` + `orderLog`
  - ❌ Erro: `orderError` + `orderLog`

## Consumers Globais

### Log Consumer
- **Escuta**: `orderLog`
- **Comportamento**:
  - Centraliza todos os logs
  - Persiste histórico de operações
  - Monitora performance

### Error Consumer
- **Escuta**: `orderError`
- **Comportamento**:
  - Centraliza tratamento de erros
  - Implementa retry policies
  - Notifica administradores

## Vantagens deste Fluxo

1. **Pipeline Sequencial**: Cada etapa só executa se a anterior foi bem-sucedida
2. **Fail-Fast**: Erros são detectados cedo no processo
3. **Centralização**: Logs e erros em consumers dedicados
4. **Rastreabilidade**: Histórico completo de cada pedido
5. **Escalabilidade**: Cada consumer pode ser escalado independentemente