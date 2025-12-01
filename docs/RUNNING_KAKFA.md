# Kafka

Antes de qualquer coisa, instale as dependencias:

```bash
# Da api:
> cd C:\Users\flavio\Documents\estagio\Kafka\producer-api ;  npm run dev

# Dos consumers:
> cd C:\Users\flavio\Documents\estagio\Kafka\consumers ;  npm run dev
```

## Subindo o Kafka

Dentro do **WSL**, entra na pasta do kafka:
 - Pra entrar dentro do WSL é só rodar WSL, lol

```bash
> wsl cd /mnt/c/kafka/kafka_2.13-3.7.0

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
$ .\bin\windows\kafka-topics.bat --create --topic teste --bootstrap-server localhost:9092
```

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

> cd C:\Users\flavio\Documents\estagio\Kafka\producer-api

# Rode:
> npm run dev
```

A **API** vai estar no ar!

## Subir os consumers

```bash
> cd C:\Users\flavio\Documents\estagio\Kafka\consumers

# rode:
> npm run dev
```

## Por fim
Se tudo estiver rodando, teste fazendo uma requisição simples:

```json
# POST, http://localhost:3000/send
# Mande o payload para teste:

{ 
    "message": "teste kafka"
}
```
