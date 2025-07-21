const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const fetch = require("node-fetch");
require("dotenv").config();

const peliculasRouter = require("./routers/peliculas"); // Ruta de películas

const app = express();
app.use(cors());
app.use(express.json());

// 🔌 Conectar a MongoDB Atlas
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Conectado a MongoDB Atlas"))
  .catch((err) => console.error("❌ Error al conectar a MongoDB:", err));

// 🎬 Ruta de películas
app.use("/api/peliculas", peliculasRouter);

// ✨ Ruta de recomendación con IA (OpenRouter)
app.post("/api/recomendaciones", async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Falta el prompt." });
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo", // o cualquier otro modelo compatible
        messages: [
          { role: "system", content: "Eres un experto en cine." },
          { role: "user", content: prompt }
        ]
      })
    });

    const data = await response.json();
    const recomendacion = data.choices?.[0]?.message?.content || "No se pudo generar la recomendación.";
    res.json({ recomendacion });
  } catch (error) {
    console.error("❌ Error con OpenRouter:", error);
    res.status(500).json({ error: "Error al generar recomendación con IA." });
  }
});

// 🚀 Iniciar servidor
const PORT = process.env.PORT || 4000;
app.listen(PORT, () =>
  console.log(`🚀 Backend corriendo en http://localhost:${PORT}`)
);
