import express from "express";
import { Kafka } from "kafkajs";

const app = express();
app.use(express.json());

const kafka = new Kafka({
  clientId: "producer-api",
  brokers: [process.env.KAFKA_BROKER || "localhost:9092"],
});

const producer = kafka.producer();

app.get("/", (req, res) => {
  res.send("Producer API on!");
});

app.post("/send", async (req, res) => {
  const { message } = req.body;

  try {
    await producer.send({
      topic: "test-topic",
      messages: [{ value: message }],
    });

    return res.json({
      ok: true,
      message: "Mensagem enviada!"
    });

  } catch (err) {
    console.error("Erro ao enviar:", err);
    return res.status(500).json({ error: "Erro ao enviar mensagem" });
  }
});

async function start() {
  await producer.connect();
  console.log("Producer conectado ao Kafka!");
  app.listen(3000, () =>
    console.log("Producer API rodando na porta 3000")
  );
}

start().catch(console.error);
