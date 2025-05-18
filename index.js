import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ada-computer')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Service Schema
const serviceSchema = new mongoose.Schema({
  serviceNumber: { type: String, required: true, unique: true },
  customerName: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  email: String,
  address: String,
  deviceType: String,
  brand: String,
  model: String,
  serialNumber: String,
  problem: String,
  accessories: String,
  needWebsite: Boolean,
  status: { type: String, default: 'Menunggu' },
  notes: [String],
  createdAt: { type: Date, default: Date.now },
  estimatedCost: String,
  cancelReason: String
});

const Service = mongoose.model('Service', serviceSchema);

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'A.D.A COMPUTER Service API' });
});

// Create new service
app.post('/api/services', async (req, res) => {
  try {
    const service = new Service(req.body);
    await service.save();
    res.status(201).json(service);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get service by number
app.get('/api/services/:serviceNumber', async (req, res) => {
  try {
    const service = await Service.findOne({ serviceNumber: req.params.serviceNumber });
    if (!service) {
      return res.status(404).json({ message: 'Service tidak ditemukan' });
    }
    res.json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all services
app.get('/api/services', async (req, res) => {
  try {
    const services = await Service.find().sort({ createdAt: -1 });
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update service
app.put('/api/services/:serviceNumber', async (req, res) => {
  try {
    const service = await Service.findOneAndUpdate(
      { serviceNumber: req.params.serviceNumber },
      req.body,
      { new: true }
    );
    if (!service) {
      return res.status(404).json({ message: 'Service tidak ditemukan' });
    }
    res.json(service);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete service
app.delete('/api/services/:serviceNumber', async (req, res) => {
  try {
    const service = await Service.findOneAndDelete({ serviceNumber: req.params.serviceNumber });
    if (!service) {
      return res.status(404).json({ message: 'Service tidak ditemukan' });
    }
    res.json({ message: 'Service berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server berjalan di port ${port}`);
}); 