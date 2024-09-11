import mongoose from 'mongoose';

const FileSchema = new mongoose.Schema({
  originalname: { type: String, required: true },
  filename: { type: String, required: true },
  mimetype: { type: String, required: true },
  size: { type: Number, required: true },
  path: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Reference to the User
  uploadDate: { type: Date, default: Date.now }
});

export const File = mongoose.model('File', FileSchema);
