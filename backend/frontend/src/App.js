import React, { useState, useEffect } from 'react';
import './App.css';
import peliculas from './data/peliculas.json';

const API_URL = "https://recomendaciones-backend-0cuc.onrender.com/api/peliculas";

function App() {
  const [input, setInput] = useState('');
  const [peliculasFiltradas, setPeliculasFiltradas] = useState(peliculas);
  const [recomendacionIA, setRecomendacionIA] = useState('');
  const [peliculasRecomendadas, setPeliculasRecomendadas] = useState([]);
  const [loading, setLoading] = useState(false);

  // Función para normalizar texto (quita acentos)
  const normalizar = (str) =>
    str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // Buscar por texto simple (título o género)
  const handleBuscarTexto = () => {
    const texto = normalizar(input);
    const filtradas = peliculas.filter((peli) =>
      normalizar(peli.titulo).includes(texto) ||
      normalizar(peli.genero).includes(texto)
    );

    setPeliculasFiltradas(filtradas);
    setPeliculasRecomendadas([]);
    setRecomendacionIA('');
  };

  // Buscar por descripción usando IA
  const handleBuscarDescripcion = async () => {
    if (!input.trim()) {
      setRecomendacionIA('⚠️ Por favor, escribe una descripción.');
      return;
    }

    setLoading(true);
    setRecomendacionIA('Pensando...');
    setPeliculasRecomendadas([]);
    setPeliculasFiltradas([]);

    try {
      const response = await fetch(`https://recomendaciones-backend-0cuc.onrender.com/api/recomendaciones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Tengo una base de datos con estas películas: ${peliculas
            .map((p) => p.titulo).join(', ')}. 
Quiero que me digas solo los títulos de las películas que coincidan con esta descripción: "${input}". 
Devuélveme únicamente los títulos separados por comas.`,
        }),
      });

      if (!response.ok) {
        throw new Error(`Respuesta con error: ${response.status}`);
      }

      const data = await response.json();
      console.log("Respuesta IA:", data);

      const rawText = data.recomendacion || '';
      const textoIA = normalizar(rawText);

      if (!rawText.trim()) {
        setRecomendacionIA('⚠️ La IA no pudo encontrar recomendaciones.');
        return;
      }

      setRecomendacionIA(rawText);

      // Convertir respuesta de IA en lista de títulos normalizados
      const titulosIA = rawText
        .split(',')
        .map(t => normalizar(t.trim()))
        .filter(t => t.length > 0);

      // Buscar coincidencias exactas
      const coincidencias = peliculas.filter((peli) =>
        titulosIA.includes(normalizar(peli.titulo))
      );

      setPeliculasRecomendadas(coincidencias);
    } catch (err) {
      console.error("Error al llamar la API:", err);
      setRecomendacionIA('❌ Error al obtener recomendación IA.');
    } finally {
      setLoading(false);
    }
  };

  // Restaurar películas cuando el input está vacío
  useEffect(() => {
    if (input.trim() === '') {
      setPeliculasFiltradas(peliculas);
      setPeliculasRecomendadas([]);
      setRecomendacionIA('');
    }
  }, [input]);

  return (
    <div className="App">
      <h1 className="titulo">CECYFLIX</h1>

      <div className="buscador">
        <input
          type="text"
          placeholder="¿Qué te gustaría ver hoy?"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button onClick={handleBuscarTexto}>Buscar</button>
        <button onClick={handleBuscarDescripcion} className="btn-ia">
          Buscar por descripción
        </button>
      </div>

      {loading && <p className="pensando">⏳ Cargando recomendación...</p>}

      {recomendacionIA && !loading && (
        <div className="bloque-recomendaciones">
          <h2>✨ Recomendación IA</h2>
          <p>{recomendacionIA}</p>
        </div>
      )}

      {peliculasRecomendadas.length > 0 && (
        <div className="galeria">
          <h2>Películas recomendadas por IA</h2>
          <div className="grid">
            {peliculasRecomendadas.map((peli) => (
              <div className="tarjeta" key={peli.id}>
                <img src={peli.poster} alt={peli.titulo} />
                <div className="info">
                  <h3>{peli.titulo}</h3>
                  <p>{peli.descripcion}</p>
                  <span>{peli.genero}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {peliculasFiltradas.length > 0 && peliculasRecomendadas.length === 0 && (
        <div className="galeria">
          <h2>Todas las películas</h2>
          <div className="grid">
            {peliculasFiltradas.map((peli) => (
              <div className="tarjeta" key={peli.id}>
                <img src={peli.poster} alt={peli.titulo} />
                <div className="info">
                  <h3>{peli.titulo}</h3>
                  <p>{peli.descripcion}</p>
                  <span>{peli.genero}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;


