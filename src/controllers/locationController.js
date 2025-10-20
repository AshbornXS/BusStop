import Location from "../models/Location.js";
import Bus from "../models/Location.js";
import dotenv from "dotenv";

dotenv.config();

export const saveLocation = async (req, res) => {
  try {
    const { busId, latitude, longitude } = req.body;

    if (!busId || !latitude || !longitude) {
      return res.status(400).json({ msg: "Dados incompletos." });
    }

    const bus = await Bus.findOneAndUpdate(
      { busId },
      { $push: { locations: { latitude, longitude } } },
      { new: true, upsert: true }
    );

    res.status(201).json({ msg: "Localização salva com sucesso!" });
  } catch (err) {
    res.status(500).json({ msg: "Erro no servidor", error: err.message });
  }
};

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

export const getAllBuses = async (req, res) => {
  try {
    const buses = await Location.distinct("busId");
    res.json(buses);
  } catch (err) {
    res.status(500).json({ msg: "Erro no servidor", error: err.message });
  }
};
