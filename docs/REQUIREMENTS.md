# Requisitos

## Sumário

-   [Visão Geral](#visão-geral)
-   [Fluxo do Sistema](#fluxo-do-sistema)
-   [Tópicos Kafka](#tópicos-kafka)
-   [Producers](#producers)
    -   [Criar pedido](#criar-pedido)
-   [Consumers](#consumers)
    -   [Atualizar estoque](#atualizar-estoque)
    -   [Enviar confirmação por e-mail](#enviar-confirmação-por-e-mail)
    -   [Gerar fatura](#gerar-fatura)
-   [Erros comuns](#erros-comuns)
-   [Links úteis](#links-úteis)

## Visão Geral

O sistema é composto por:

-   **Producer API**: responsável por criar pedidos e publicar eventos.
-   **3 Consumers**, cada um cuidando de uma etapa:
    -   Atualização de estoque
    -   Envio de e-mail
    -   Geração de fatura

Cada serviço é independente e se comunica exclusivamente via Kafka.

## Fluxo do Sistema

    [Producer API]
          |
          | POST /orders
          v
    [order.created]
          |
          +--> [estoque-consumer] ---------> publica order.stock-updated
          |
          +--> [email-consumer] -----------> publica order.email-sent
          |
          +--> [billing-consumer] ---------> publica order.invoice-generated


## Tópicos Kafka

| Tópico | Descrição |
|--------|-----------|
| `order.created` | Evento inicial quando um pedido é criado |
| `order.stock-updated` | Estoque atualizado |
| `order.email-sent` | E-mail de confirmação enviado |
| `order.invoice-generated` | Fatura gerada |


## Producers

### Criar pedido

#### Requisição

| Campo | Tipo | Descrição |
|-------|------|----------|
| `order_id` | String | ID único do pedido |
| `user_email` | String | E-mail do comprador |
| `items` | Array | Lista de itens comprados |

#### Exemplo:

``` http
POST /orders
Content-Type: application/json

{
    "order_id": "1234",
    "user_email": "cliente@example.com",
    "items": [
        { "sku": "ABC123", "qty": 2 },
        { "sku": "XYZ999", "qty": 1 }
    ]
}
```

### Publicação no Kafka

``` json
{
    "order_id": "1234",
    "user_email": "cliente@example.com",
    "items": [...]
}
```

Tópico: **order.created**

------------------------------------------------------------------------

# Consumers

## Atualizar estoque

### Entrada

    order.created

### Comportamento

1.  Valida os itens\
2.  Debita do estoque\
3.  Loga o resultado\
4.  Publica: `order.stock-updated`

### Saída

``` json
{
    "order_id": "1234",
    "status": "STOCK_UPDATED"
}
```

------------------------------------------------------------------------

## Enviar confirmação por e-mail

### Entrada

    order.created

### Comportamento

1.  Monta o conteúdo do e-mail\
2.  Simula envio\
3.  Publica: `order.email-sent`

------------------------------------------------------------------------

### Gerar fatura

#### Entrada

    order.created

#### Comportamento

1.  Gera fatura\
2.  Armazena (mock)\
3.  Publica: `order.invoice-generated`

### Erros comuns

`This is not the correct coordinator for this group`

Causas: - Grupo corrompido\
- Offsets inválidos\
- Cluster reiniciado

Soluções: - Mudar `groupId`\
- Apagar grupo:

    kafka-consumer-groups.sh --bootstrap-server localhost:9092 --delete --group nome-do-grupo

------------------------------------------------------------------------

# Links úteis

-   https://kafka.apache.org/documentation/
-   https://kafka.js.org/docs/getting-started
-   https://developer.confluent.io/
