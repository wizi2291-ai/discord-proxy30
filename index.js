const express = require("express");
const https = require("https");

const app = express();

app.use(express.json({ limit: "10mb" }));

app.get("/", (req, res) => {
  res.send("Discord proxy is working");
});

app.post("/send", async (req, res) => {

  try {

    const { webhook, payload, method } = req.body;

    if (!webhook || !payload) {
      return res.status(400).json({
        error: "Missing webhook or payload"
      });
    }

    console.log("==== REQUEST ====");
    console.log("METHOD:", method);
    console.log("WEBHOOK:", webhook);

    // ===============================
    // 🔥 ПРАВИЛЬНАЯ ОБРАБОТКА URL
    // ===============================
    const urlObj = new URL(webhook);

    // добавляем wait=true только для POST (создание сообщения)
    if (!method || method.toLowerCase() === "post") {
      urlObj.searchParams.set("wait", "true");
    }

    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: (method || "POST").toUpperCase(),
      headers: {
        "Content-Type": "application/json"
      }
    };

    const discordReq = https.request(options, (discordRes) => {

      let data = "";

      discordRes.on("data", chunk => {
        data += chunk;
      });

      discordRes.on("end", () => {

        console.log("==== DISCORD RESPONSE ====");
        console.log("STATUS:", discordRes.statusCode);
        console.log("BODY:", data);

        res.status(discordRes.statusCode || 200);

        try {
          const json = JSON.parse(data);
          res.json(json);
        } catch {
          res.send(data);
        }
      });
    });

    discordReq.on("error", (err) => {
      console.error("REQUEST ERROR:", err);
      res.status(500).json({ error: err.toString() });
    });

    discordReq.write(JSON.stringify(payload));
    discordReq.end();

  } catch (err) {

    console.error("PROXY ERROR:", err);

    res.status(500).json({
      error: err.toString()
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Proxy started on port ${PORT}`);
});
