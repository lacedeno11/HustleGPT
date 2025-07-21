
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();
const app = express();
const port = 3000;

// Middlewares
app.use(cors()); // Permite peticiones desde el frontend
app.use(express.json()); // Permite recibir JSON en el body de la petición

const GEMINI_API_KEY = process.env.GEMINI_API_KEY; // Carga la clave del .env

// Endpoint que será llamado por la clase TutorIA
app.post('/api/pedir-pista', async (req, res) => {
  try {
    // 1. Recibe los datos del problema enviados desde el frontend
    const { prompt, problema, historial } = req.body;

    // 2. Llama a la API de Gemini (desde el servidor)
    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            // Construye aquí el cuerpo de la petición como lo requiera Gemini API
            contents: [{ parts: [{ text: `${prompt} El problema es: ${problema}` }] }],
            // ...puedes incluir el historial, etc.
        }),
    });

    if (!geminiResponse.ok) {
        throw new Error('Error en la llamada a la API de Gemini');
    }

    const data = await geminiResponse.json();

    // 3. Envía la respuesta de Gemini de vuelta al frontend
    res.json(data);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});