const axios = require("axios");
const fs = require("fs");
require("dotenv").config(); // Cargar variables de entorno

const API_KEY = "AIzaSyCIC9ujKLtLUT2dW5XFtieOoQhMhJ6FFog"; // Guarda la API Key en un archivo .env
const PLACE_ID = "ChIJzyN0_iD3tUwRcvrALOdnCpo"; // Guarda el placeId en .env
const CACHE_FILE = "cache_reviews.json"; // Archivo para guardar caché

const obtenerComentarios = async (req, res) => {
  try {
    // Verifica si el archivo de caché existe
    if (fs.existsSync(CACHE_FILE)) {
      const cachedData = JSON.parse(fs.readFileSync(CACHE_FILE, "utf8"));
      const lastUpdated = new Date(cachedData.timestamp);
      const now = new Date();

      // Si la última actualización fue hace menos de 24 horas, usar caché
      if ((now - lastUpdated) / (1000 * 60 * 60) < 24) {
        console.log("Usando datos en caché");
        return res.json({ reviews: cachedData.reviews });
      }
    }

    // Si no hay caché válido, hacer la petición a Google Places API
    const url = `https://places.googleapis.com/v1/places/${PLACE_ID}?fields=reviews&key=${API_KEY}`;
    const response = await axios.get(url);

    if (!response.data.reviews) {
      return res.status(400).json({
        error: "No se encontraron comentarios",
        details: response.data,
      });
    }

    // Guardar los comentarios en caché con la fecha actual
    const reviewsData = {
      timestamp: new Date().toISOString(),
      reviews: response.data.reviews,
    };
    fs.writeFileSync(CACHE_FILE, JSON.stringify(reviewsData, null, 2));

    console.log("Reseñas actualizadas desde la API");
    res.json({ reviews: response.data.reviews });
  } catch (error) {
    console.error("Error al obtener los comentarios:", error.message);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

module.exports = { obtenerComentarios };
