import mongoose from "mongoose";

const locationSchema = new mongoose.Schema({
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
});

const busSchema = new mongoose.Schema({
  busId: { type: String, required: true, unique: true },
  locations: [locationSchema], // Array de subdocumentos
});

export default mongoose.model("Bus", busSchema);
