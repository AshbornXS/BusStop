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

    const location = await Location.findOne({ busId }).sort({ timestamp: -1 });

    if (!location)
      return res.status(404).json({ msg: "Nenhum dado encontrado." });

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
