
const express = require("express");

const app = express();

app.use(express.json({ limit: "10mb" }));

app.get("/", (req, res) => {
  res.send("Discord proxy is working");
});

app.post("/send", async (req, res) => {

  try {

    const {
      webhook,
      payload,
      method
    } = req.body;

    if (!webhook || !payload) {

      return res.status(400).json({
        error: "Missing webhook or payload"
      });
    }

    console.log("==== REQUEST ====");
    console.log("METHOD:", method);
    console.log("WEBHOOK:", webhook);

    const response = await fetch(webhook, {
      method: method || "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const text = await response.text();

    console.log("==== DISCORD RESPONSE ====");
    console.log("STATUS:", response.status);
    console.log("BODY:", text);

    // Возвращаем оригинальный ответ Discord
    res.status(response.status);

    try {

      const json = JSON.parse(text);

      return res.json(json);

    } catch {

      return res.send(text);
    }

  } catch (err) {

    console.error("PROXY ERROR:", err);

    return res.status(500).json({
      error: err.toString()
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Proxy started on port ${PORT}`);
});

