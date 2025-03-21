require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para manejar datos en formato JSON y CORS
app.use(cors());
app.use(express.json());

const googleMapsController = require("./controller/googleMapController");
app.get("/getGoogleReviews", googleMapsController.obtenerComentarios);

// Iniciar el servidor
app.listen(PORT, async () => {
  try {
    //await obtenerTokenAcceso(); // Obtener el token al iniciar la aplicación
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
  } catch (error) {
    console.error("Error al iniciar el servidor:", error.message);
  }
});
