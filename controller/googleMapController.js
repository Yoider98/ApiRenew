const axios = require("axios");
const { Pool } = require("pg");
require("dotenv").config(); // Cargar variables de entorno

const API_KEY = "AIzaSyCIC9ujKLtLUT2dW5XFtieOoQhMhJ6FFog";
const PLACE_ID = "ChIJzyN0_iD3tUwRcvrALOdnCpo";
const DB_URL =
  "postgresql://renew_user:Pkyo5l6wtiTRxZBHzJjBa6fYWDPd71Jx@dpg-cveo0rlds78s73et1ug0-a/renew"; // Agrega esta variable en Render

const pool = new Pool({ connectionString: DB_URL });

const obtenerComentarios = async (req, res) => {
  try {
    // Consultar la última reseña en la base de datos
    const { rows } = await pool.query(
      "SELECT * FROM reviews ORDER BY timestamp DESC LIMIT 1"
    );

    if (rows.length > 0) {
      const lastUpdated = new Date(rows[0].timestamp);
      const now = new Date();

      // Si la última actualización fue hace menos de 24 horas, usar caché
      if ((now - lastUpdated) / (1000 * 60 * 60) < 24) {
        console.log("Usando datos en caché de PostgreSQL");
        return res.json({ reviews: rows[0].reviews });
      }
    }

    // Si no hay caché válido, hacer la petición a Google Places API
    const url = `https://places.googleapis.com/v1/places/${PLACE_ID}?fields=reviews&key=${API_KEY}`;
    const response = await axios.get(url);

    if (!response.data.reviews) {
      return res.status(400).json({ error: "No se encontraron comentarios" });
    }

    // Guardar las reseñas en PostgreSQL
    await pool.query(
      "INSERT INTO reviews (reviews, timestamp) VALUES ($1, NOW())",
      [JSON.stringify(response.data.reviews)]
    );

    console.log("Reseñas actualizadas desde la API");
    res.json({ reviews: response.data.reviews });
  } catch (error) {
    console.error("Error al obtener los comentarios:", error.message);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

module.exports = { obtenerComentarios };
