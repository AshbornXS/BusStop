import Location from "../models/Location.js";
import Bus from "../models/Location.js";
import dotenv from "dotenv";

dotenv.config();

// Receber localização
export const saveLocation = async (req, res) => {
  try {
    const { busId, latitude, longitude } = req.body;

    if (!busId || !latitude || !longitude) {
      return res.status(400).json({ msg: "Dados incompletos." });
    }

    // Adiciona a nova localização ao array de localizações do ônibus
    const bus = await Bus.findOneAndUpdate(
      { busId },
      { $push: { locations: { latitude, longitude } } },
      { new: true, upsert: true } // Cria o documento se não existir
    );

    res.status(201).json({ msg: "Localização salva com sucesso!" });
  } catch (err) {
    res.status(500).json({ msg: "Erro no servidor", error: err.message });
  }
};

// Consultar última localização de um ônibus
export const getLastLocation = async (req, res) => {
  try {
    const { busId } = req.params;

    const bus = await Bus.findOne({ busId });

    if (!bus || bus.locations.length === 0) {
      return res.status(404).json({ msg: "Nenhum dado encontrado." });
    }

    const lastLocation = bus.locations[bus.locations.length - 1];
    res.json(lastLocation);
  } catch (err) {
    res.status(500).json({ msg: "Erro no servidor", error: err.message });
  }
};

// Consultar todas as localizações de um ônibus
export const getAllLocations = async (req, res) => {
  try {
    const { busId } = req.params;

    const bus = await Bus.findOne({ busId });

    if (!bus || bus.locations.length === 0) {
      return res.status(404).json({ msg: "Nenhum dado encontrado." });
    }

    res.json(bus.locations);
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
