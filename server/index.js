import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import connectDB from './config/db.js';
import Service from './models/Service.js';
import User from './models/User.js';
import auth from './middleware/auth.js';
import Technician from './models/Technician.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5002;

// Middleware
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow all localhost origins
    if (origin.startsWith('http://localhost:')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

app.use(express.json());

// Connect to MongoDB
connectDB();

// Auth Routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ message: 'Username atau password salah' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Username atau password salah' });
    }

    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat login' });
  }
});

// Protected Routes
app.use('/api/services', auth);

// Routes
app.post('/api/services', async (req, res) => {
  try {
    console.log('Received service data:', req.body);
    const service = new Service(req.body);
    const savedService = await service.save();
    console.log('Service saved:', savedService);
    res.status(201).json(savedService);
  } catch (error) {
    console.error('Error saving service:', error);
    res.status(400).json({ message: error.message });
  }
});

app.get('/api/services/:serviceNumber', async (req, res) => {
  try {
    const service = await Service.findOne({ serviceNumber: req.params.serviceNumber });
    if (!service) {
      return res.status(404).json({ message: 'Service tidak ditemukan' });
    }
    res.json(service);
  } catch (error) {
    console.error('Error finding service:', error);
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/services', async (req, res) => {
  try {
    const services = await Service.find().sort({ createdAt: -1 });
    res.json(services);
  } catch (error) {
    console.error('Error getting services:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update service
app.patch('/api/services/:serviceNumber', async (req, res) => {
  try {
    const service = await Service.findOne({ serviceNumber: req.params.serviceNumber });
    if (!service) {
      return res.status(404).json({ message: 'Service tidak ditemukan' });
    }

    // Validasi status
    if (req.body.status) {
      const validStatuses = ['Menunggu', 'Dalam Pengerjaan', 'Selesai', 'Dibatalkan Konsumen', 'Dibatalkan Toko'];
      if (!validStatuses.includes(req.body.status)) {
        return res.status(400).json({ message: 'Status tidak valid' });
      }

      // Validasi alasan pembatalan
      if ((req.body.status === 'Dibatalkan Konsumen' || req.body.status === 'Dibatalkan Toko') && !req.body.cancelReason?.trim()) {
        return res.status(400).json({ message: 'Alasan pembatalan harus diisi' });
      }
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      if (key === 'notes' && Array.isArray(req.body.notes)) {
        service.notes = req.body.notes;
      } else {
        service[key] = req.body[key];
      }
    });

    service.updatedAt = new Date();
    const updatedService = await service.save();
    res.json(updatedService);
  } catch (error) {
    console.error('Error updating service:', error);
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
    console.error('Error deleting service:', error);
    res.status(500).json({ message: error.message });
  }
});

// Technician Endpoints
app.get('/api/technicians', async (req, res) => {
  try {
    const technicians = await Technician.find();
    res.json(technicians);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/technicians', async (req, res) => {
  try {
    const technician = new Technician(req.body);
    const savedTechnician = await technician.save();
    res.status(201).json(savedTechnician);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.patch('/api/technicians/:id', async (req, res) => {
  try {
    const technician = await Technician.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true }
    );
    if (!technician) {
      return res.status(404).json({ message: 'Teknisi tidak ditemukan' });
    }
    res.json(technician);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/technicians/:id', async (req, res) => {
  try {
    const technician = await Technician.findOneAndDelete({ id: req.params.id });
    if (!technician) {
      return res.status(404).json({ message: 'Teknisi tidak ditemukan' });
    }
    res.json({ message: 'Teknisi berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Terjadi kesalahan pada server' });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please use a different port.`);
    process.exit(1);
  } else {
    console.error('Server error:', error);
  }
}); 