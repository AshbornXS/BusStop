import Location from "../models/Location.js";
import dotenv from "dotenv";

dotenv.config();

// Receber localização
export const saveLocation = async (req, res) => {
  try {
    const { busId, latitude, longitude } = req.body;

    if (!busId || !latitude || !longitude) {
      return res.status(400).json({ msg: "Dados incompletos." });
    }

    const location = new Location({ busId, latitude, longitude });
    await location.save();

    res.status(201).json({ msg: "Localização salva com sucesso!" });
  } catch (err) {
    res.status(500).json({ msg: "Erro no servidor", error: err.message });
  }
};

// Consultar última localização de um ônibus
export const getLastLocation = async (req, res) => {
  try {
    const { busId } = req.params;

    const location = await Location.findOne({ busId })
      .sort({ timestamp: -1 });

    if (!location) return res.status(404).json({ msg: "Nenhum dado encontrado." });

    res.json(location);
  } catch (err) {
    res.status(500).json({ msg: "Erro no servidor", error: err.message });
  }
};

// Consultar todas as localizações de um ônibus
export const getAllLocations = async (req, res) => {
  try {
    const { busId } = req.params;

    const locations = await Location.find({ busId }).sort({ timestamp: -1 });

    if (locations.length === 0) {
      return res.status(404).json({ msg: "Nenhum dado encontrado." });
    }

    res.json(locations);
  } catch (err) {
    res.status(500).json({ msg: "Erro no servidor", error: err.message });
  }
};

// Listar todos os onibus
export const getAllBuses = async (req, res) => {
  try {
    const buses = await Location.distinct("busId");
    res.json(buses);
  } catch (err) {
    res.status(500).json({ msg: "Erro no servidor", error: err.message });
  }
};

// Alinha rotas para a rua
export const getAlignedLocations = async (req, res) => {
  try {
    const { busId } = req.params;

    // 1️⃣ busca dados já salvos (latitude e longitude)
    const response = await fetch(`https://busstop-b9ov.onrender.com/api/locations/all/${busId}`);
    const data = await response.json();

    if (!data || data.length === 0) {
      return res.status(404).json({ error: "Nenhum dado encontrado" });
    }

    // 2️⃣ transforma os dados em formato aceito pelo OpenRouteService
    const coordinates = data.map(p => [p.longitude, p.latitude]);

    // 3️⃣ envia requisição ao OpenRouteService
    const orsResponse = await fetch("https://api.openrouteservice.org/v2/match/driving-car/json", {
      method: "POST",
      headers: {
        "Authorization": `${process.env.ORS_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ coordinates })
    });

    if (!orsResponse.ok) {
      const text = await orsResponse.text();
      console.error("Erro ORS:", text);
      return res.status(orsResponse.status).send(text);
    }

    const orsData = await orsResponse.json();

    // 4️⃣ retorna os pontos alinhados ao frontend
    res.json(orsData);

  } catch (error) {
    console.error("Erro ao alinhar rota:", error);
    res.status(500).json({ error: "Erro interno ao alinhar rota" });
  }
};
