import React, { useState } from 'react';

interface ComputerData {
  inventoryNumber: string;
  brand: string;
  model: string;
  cpu: string;
  ram: string;
  storage: string;
  location: string;
  status: 'active' | 'maintenance' | 'retired';
  lastChecked: string;
}

const ComputerTrackingForm: React.FC = () => {
  const [computerData, setComputerData] = useState<ComputerData>({
    inventoryNumber: '',
    brand: '',
    model: '',
    cpu: '',
    ram: '',
    storage: '',
    location: '',
    status: 'active',
    lastChecked: new Date().toISOString().split('T')[0]
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setComputerData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Data Komputer:', computerData);
    // Di sini Anda bisa menambahkan logika untuk menyimpan data
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Form Tracking Komputer</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Nomor Inventaris:</label>
          <input
            type="text"
            name="inventoryNumber"
            value={computerData.inventoryNumber}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block mb-1">Merek:</label>
          <input
            type="text"
            name="brand"
            value={computerData.brand}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block mb-1">Model:</label>
          <input
            type="text"
            name="model"
            value={computerData.model}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block mb-1">CPU:</label>
          <input
            type="text"
            name="cpu"
            value={computerData.cpu}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block mb-1">RAM:</label>
          <input
            type="text"
            name="ram"
            value={computerData.ram}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block mb-1">Storage:</label>
          <input
            type="text"
            name="storage"
            value={computerData.storage}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block mb-1">Lokasi:</label>
          <input
            type="text"
            name="location"
            value={computerData.location}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block mb-1">Status:</label>
          <select
            name="status"
            value={computerData.status}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="active">Aktif</option>
            <option value="maintenance">Maintenance</option>
            <option value="retired">Tidak Aktif</option>
          </select>
        </div>

        <div>
          <label className="block mb-1">Tanggal Pemeriksaan:</label>
          <input
            type="date"
            name="lastChecked"
            value={computerData.lastChecked}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
        >
          Simpan Data
        </button>
      </form>
    </div>
  );
};

export default ComputerTrackingForm; 