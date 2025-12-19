# Kafka

Antes de qualquer coisa, instale as dependencias:

```bash
# Da API:
> cd C:\Users\flavio\Documents\estagio\kafka-nodejs\producer-api
> npm install

# Dos consumers:
> cd C:\Users\flavio\Documents\estagio\kafka-nodejs\consumers
> npm install
```

## Subindo o Kafka

Dentro do **WSL**, entra na pasta do kafka:
 - Pra entrar dentro do WSL é só rodar `wsl` no terminal

Gere o UUID para o Cluster:

```bash
cd /mnt/c/kafka/kafka_2.13-3.7.0
CLUSTER_UUID=$(bin/kafka-storage.sh random-uuid)
echo "UUID gerado: $CLUSTER_UUID"
```

Formate as configurações do server com esse uuid:

```bash
    bin/kafka-storage.sh format -t $CLUSTER_UUID -c config/kraft/server.properties
```

Depois só iniciar o Kafka normalmente:

```bash
# Inicia o kafka, vai estar rodando na porta 9092
$ bin/kafka-server-start.sh config/kraft/server.properties
```


## Topicos

Criar tópico 'teste', lembre de renomear depois:

```bash
# Criar tópico

# Se não estiver na pasta do kafka...
$ cd /mnt/c/kafka/kafka_2.13-3.7.0

# Cria o tópico 'teste'
bin/kafka-topics.sh --create --topic orderError --bootstrap-server localhost:9092 --partitions 1  --replication-factornb  1
```

Topicos necessarios:
- orderLog
- validOrder
- newOrder
- orderError

Listar todos os tópicos criados:

```bash
# Para listar os tópicos existentes:

$ cd /mnt/c/kafka/kafka_2.13-3.7.0

$ bin/kafka-topics.sh --list --bootstrap-server localhost:9092
```

Deletar um tópico

```bash
# Para deletar um tópico:

$ cd /mnt/c/kafka/kafka_2.13-3.7.0

$ bin/kafka-topics.sh --delete --topic newrrder --bootstrap-server localhost:9092
```

Para ver os grupos já criados, pode ser particularmente util em algum debug

```bash
# Listando os grupos existentes:

$ cd /mnt/c/kafka/kafka_2.13-3.7.0

$ bin/kafka-consumer-groups.sh --bootstrap-server localhost:9092 --list
```

Criar um tópico

```bash
# Criar um novo tópico:

$ cd /mnt/c/kafka/kafka_2.13-3.7.0

$ bin/kafka-topics.sh --create --topic newOrder --bootstrap-server localhost:9092 --partitions 1 --replication-factor 1
```


## Subindo a producer-API

```bash
# Dentro de: 
> cd C:\Users\flavio\Documents\estagio\kafka-nodejs\producer-api

# Rode:
> npm run dev
```

A **API** vai estar no ar na porta 3000!

## Subir os consumers

### Opção 1: Rodando todos os consumers juntos!
```bash
> cd C:\Users\flavio\Documents\estagio\kafka-nodejs\consumers

# Roda todos os consumers em um só processo:
> npm run dev
```

### Opção 2: Rodar consumers individualmente
```bash
> cd C:\Users\flavio\Documents\estagio\kafka-nodejs\consumers

# Apenas o order consumer:
> npm run dev:order

# Para adicionar novos consumers, use:
# npm run dev:user
# npm run dev:payment
# etc...
```

### Comandos disponíveis:
- `npm run dev` - Roda todos os consumers com nodemon (desenvolvimento)
- `npm start` - Roda todos os consumers (produção)
- `npm run dev:order` - Roda apenas o order consumer com nodemon
- `npm run start:order` - Roda apenas o order consumer

## Por fim
Se tudo estiver rodando, teste fazendo uma requisição simples:

```json
# POST, http://localhost:3000/send
# Mande o payload para teste:

{ 
    "message": "teste kafka"
}
```
