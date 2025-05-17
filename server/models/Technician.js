import mongoose from 'mongoose';

const technicianSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  specialization: [{
    type: String,
    required: true
  }],
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const Technician = mongoose.model('Technician', technicianSchema);

export default Technician; 