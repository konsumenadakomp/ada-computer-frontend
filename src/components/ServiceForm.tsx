import { useState } from 'react';
import { toast } from 'react-hot-toast';

interface ServiceFormData {
  customerName: string;
  phoneNumber: string;
  deviceType: string;
  problem: string;
  serialNumber: string;
}

const ServiceForm = () => {
  const [formData, setFormData] = useState<ServiceFormData>({
    customerName: '',
    phoneNumber: '',
    deviceType: '',
    problem: '',
    serialNumber: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // TODO: Implement Firebase submission
      toast.success('Service berhasil didaftarkan!');
    } catch (error) {
      toast.error('Terjadi kesalahan saat mendaftarkan service.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Daftar Service Baru</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Nama Customer</label>
          <input
            type="text"
            name="customerName"
            value={formData.customerName}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block mb-1">Nomor Telepon</label>
          <input
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block mb-1">Tipe Perangkat</label>
          <input
            type="text"
            name="deviceType"
            value={formData.deviceType}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block mb-1">Serial Number</label>
          <input
            type="text"
            name="serialNumber"
            value={formData.serialNumber}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block mb-1">Keluhan</label>
          <textarea
            name="problem"
            value={formData.problem}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            rows={4}
            required
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          Daftar Service
        </button>
      </form>
    </div>
  );
};

export default ServiceForm; 