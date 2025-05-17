import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  serviceNumber: {
    type: String,
    required: true,
    unique: true
  },
  customerName: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  email: String,
  address: {
    type: String,
    required: true
  },
  deviceType: {
    type: String,
    required: true
  },
  brand: {
    type: String,
    required: true
  },
  model: {
    type: String,
    required: true
  },
  serialNumber: {
    type: String,
    required: true
  },
  problem: {
    type: String,
    required: true
  },
  accessories: {
    type: String,
    required: true
  },
  needWebsite: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['Menunggu', 'Dalam Pengerjaan', 'Selesai', 'Dibatalkan Konsumen', 'Dibatalkan Toko'],
    default: 'Menunggu'
  },
  technician: {
    type: String,
    required: false
  },
  cancelReason: {
    type: String,
    required: function() {
      return this.status === 'Dibatalkan Konsumen' || this.status === 'Dibatalkan Toko';
    },
    validate: {
      validator: function(v) {
        if (this.status === 'Dibatalkan Konsumen' || this.status === 'Dibatalkan Toko') {
          return v && v.trim().length > 0;
        }
        return true;
      },
      message: 'Alasan pembatalan harus diisi'
    }
  },
  notes: [{
    type: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  estimatedCost: String,
  sparepartDetails: String
}, {
  timestamps: true
});

const Service = mongoose.model('Service', serviceSchema);

export default Service; 