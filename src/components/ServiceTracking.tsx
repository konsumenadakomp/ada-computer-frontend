import React, { useState } from 'react';
import { getService } from '../services/api';

interface ServiceData {
  serviceNumber: string;
  customerName: string;
  deviceType: string;
  brand: string;
  model: string;
  status: string;
  technician: string;
  cancelReason: string;
  notes: string[];
  createdAt: string;
}

const ServiceTracking: React.FC = () => {
  const [serviceNumber, setServiceNumber] = useState('');
  const [serviceData, setServiceData] = useState<ServiceData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setServiceData(null);

    try {
      const data = await getService(serviceNumber);
      setServiceData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Service tidak ditemukan');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'Menunggu': 'bg-yellow-100 text-yellow-800',
      'Dalam Pengerjaan': 'bg-blue-100 text-blue-800',
      'Selesai': 'bg-green-100 text-green-800',
      'Dibatalkan Konsumen': 'bg-red-100 text-red-800',
      'Dibatalkan Toko': 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex gap-4">
          <input
            type="text"
            value={serviceNumber}
            onChange={(e) => setServiceNumber(e.target.value)}
            placeholder="Masukkan nomor service"
            className="flex-1 p-2 border rounded"
            required
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? 'Mencari...' : 'Cek Status'}
          </button>
        </div>
      </form>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          {error}
        </div>
      )}

      {serviceData && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="border-b pb-4 mb-4">
            <h2 className="text-xl font-bold mb-2">Detail Service</h2>
            <p className="text-sm text-gray-600">Nomor Service: {serviceData.serviceNumber}</p>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-gray-600">Pelanggan</p>
              <p className="text-lg">{serviceData.customerName}</p>
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-600">Perangkat</p>
              <p className="text-lg">{serviceData.deviceType} {serviceData.brand} {serviceData.model}</p>
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-600">Status</p>
              <span className={`inline-block px-3 py-1 rounded-full text-sm ${getStatusColor(serviceData.status)}`}>
                {serviceData.status}
              </span>
              {serviceData.cancelReason && (
                <p className="mt-1 text-sm text-red-600">
                  Alasan pembatalan: {serviceData.cancelReason}
                </p>
              )}
            </div>

            {serviceData.technician && (
              <div>
                <p className="text-sm font-semibold text-gray-600">Teknisi</p>
                <p className="text-lg">{serviceData.technician}</p>
              </div>
            )}

            <div>
              <p className="text-sm font-semibold text-gray-600 mb-2">Riwayat</p>
              <div className="space-y-2">
                {serviceData.notes.map((note, index) => (
                  <div key={index} className="text-sm bg-gray-50 p-2 rounded">
                    {note}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceTracking; 