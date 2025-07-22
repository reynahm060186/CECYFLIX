const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.post('/api/recomendaciones', (req, res) => {
  const { prompt } = req.body;

  if (!prompt || prompt.trim() === "") {
    return res.json({ recomendacion: "⚠️ Descripción vacía. Escribe algo por favor." });
  }

  const promptLower = prompt.toLowerCase();

  let recomendacion = "No se pudo generar la recomendación.";

  if (promptLower.includes("acción") || promptLower.includes("accion")) {
    recomendacion = "Matrix, Inception, John Wick";
  } else if (promptLower.includes("romántica") || promptLower.includes("romantica")) {
    recomendacion = "The Notebook, La La Land, Notting Hill";
  } else if (promptLower.includes("terror")) {
    recomendacion = "El Conjuro, It, Hereditary";
  }

  res.json({ recomendacion });
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});
