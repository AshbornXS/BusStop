import mongoose from 'mongoose';

const FileSchema = new mongoose.Schema({
  originalName: {
    type: String,
    required: true,
  },
  path: {
    type: String,
    required: true,
  },
  mimetype: {
    type: String,
    required: true,
  },
  size: {
    type: Number,
    required: true,
  },
  uploadedBy: {
    type: String,
    required: true,
  },
}, { timestamps: true });

export default mongoose.model('File', FileSchema);
