import React, { useState } from 'react';
import { createService } from '../services/api';

interface TrackingResult {
  serviceNumber: string;
  customerName: string;
  deviceInfo: string;
  status: string;
  lastUpdate: string;
  notes: string[];
}

interface ServiceData {
  serviceNumber: string;
  customerName: string;
  phoneNumber: string;
  email: string;
  address: string;
  deviceType: string;
  brand: string;
  model: string;
  serialNumber: string;
  problem: string;
  accessories: string;
  needWebsite: boolean;
  status: string;
  notes: string[];
  createdAt: string;
  estimatedCost: string;
}

const ServiceTrackingForm: React.FC = () => {
  const generateServiceNumber = () => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hour = date.getHours().toString().padStart(2, '0');
    const minute = date.getMinutes().toString().padStart(2, '0');
    const second = date.getSeconds().toString().padStart(2, '0');
    return `SVC${year}${month}${day}${hour}${minute}${second}`;
  };

  const [serviceData, setServiceData] = useState<ServiceData>({
    serviceNumber: generateServiceNumber(),
    customerName: '',
    phoneNumber: '',
    email: '',
    address: '',
    deviceType: 'laptop',
    brand: '',
    model: '',
    serialNumber: '',
    problem: '',
    accessories: '',
    needWebsite: false,
    status: 'Menunggu',
    notes: [],
    createdAt: new Date().toISOString(),
    estimatedCost: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    const colors = {
      menunggu: 'bg-yellow-100 text-yellow-800',
      diagnosa: 'bg-purple-100 text-purple-800',
      pengerjaan: 'bg-blue-100 text-blue-800',
      sparepart: 'bg-orange-100 text-orange-800',
      batal: 'bg-red-100 text-red-800',
      selesai: 'bg-green-100 text-green-800'
    };
    return colors[status as keyof typeof colors] || '';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const finalValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setServiceData(prev => ({
      ...prev,
      [name]: finalValue
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Add initial notes
      const updatedServiceData = {
        ...serviceData,
        notes: [
          `${new Date().toLocaleString('id-ID')} - Unit diterima`,
          `${new Date().toLocaleString('id-ID')} - Menunggu antrian service`
        ]
      };

      // Save to MongoDB through API
      const response = await createService(updatedServiceData);
      
      console.log('Service created:', response);
      alert('Service berhasil didaftarkan! Nomor Service: ' + serviceData.serviceNumber);
      handlePrint();
      
      // Reset form
      setServiceData({
        ...serviceData,
        serviceNumber: generateServiceNumber(),
        customerName: '',
        phoneNumber: '',
        email: '',
        address: '',
        brand: '',
        model: '',
        serialNumber: '',
        problem: '',
        accessories: '',
        needWebsite: false,
        notes: [],
        estimatedCost: ''
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat menyimpan data');
      console.error('Error submitting form:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const currentYear = new Date().getFullYear();
    const cleanCustomerName = serviceData.customerName.replace(/[^a-zA-Z0-9]/g, '_');
    const fileName = `Service_Receipt_${serviceData.serviceNumber}_${cleanCustomerName}`;
    
    const printContent = `
      <html>
        <head>
          <title>${fileName}</title>
          <style>
            body { font-family: Arial, sans-serif; font-size: 12px; }
            .receipt { width: 80mm; padding: 10px; }
            .header { text-align: center; margin-bottom: 10px; }
            .detail-row { display: flex; justify-content: space-between; margin: 5px 0; }
            .status { padding: 3px 6px; border-radius: 4px; }
            .footer { text-align: center; font-size: 10px; margin-top: 20px; }
            @media print {
              @page { 
                size: 80mm 200mm; 
                margin: 0;
              }
              body { margin: 10px; }
            }
          </style>
          <script>
            document.title = "${fileName}";
          </script>
        </head>
        <body>
          <div class="receipt">
            <div class="header">
              <h2>A.D.A COMPUTER</h2>
              <p>Nomor Service: ${serviceData.serviceNumber}</p>
            </div>
            <div class="details">
              <div class="detail-row">
                <span>Tanggal:</span>
                <span>${new Date().toLocaleDateString('id-ID')}</span>
              </div>
              <div class="detail-row">
                <span>Pelanggan:</span>
                <span>${serviceData.customerName}</span>
              </div>
              <div class="detail-row">
                <span>Telepon:</span>
                <span>${serviceData.phoneNumber}</span>
              </div>
              <div class="detail-row">
                <span>Perangkat:</span>
                <span>${serviceData.deviceType} ${serviceData.brand} ${serviceData.model}</span>
              </div>
              <div class="detail-row">
                <span>Serial Number:</span>
                <span>${serviceData.serialNumber}</span>
              </div>
              <div class="detail-row">
                <span>Keluhan:</span>
                <span>${serviceData.problem}</span>
              </div>
              <div class="detail-row">
                <span>Kelengkapan:</span>
                <span>${serviceData.accessories}</span>
              </div>
              <div class="detail-row">
                <span>Estimasi Biaya:</span>
                <span>Rp ${serviceData.estimatedCost}</span>
              </div>
              <div class="detail-row">
                <span>Status:</span>
                <span class="status">${serviceData.status}</span>
              </div>
            </div>
            <div class="footer">
              <p>Cek status service di:</p>
              <p>http://localhost:5173/tracking</p>
              <p>Copyright ©${currentYear} A.D.A COMPUTER</p>
              <p>Dsn. Tambakrejo RT.06/RW.03, Gayaman</p>
              <p>Mojoanyar, Mojokerto 61364</p>
              <p>Telp: 0321-5281048 | WA: 085655025603</p>
            </div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Set filename for the PDF
    const style = document.createElement('style');
    style.textContent = '@media print { @page { size: 80mm 200mm; margin: 0; } }';
    printWindow.document.head.appendChild(style);
    
    // Print with custom filename
    printWindow.document.title = fileName;
    printWindow.print();
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Form Pendaftaran Service</h2>
      
      <form onSubmit={handleSubmit} className="space-y-3">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        <div className="bg-white p-4 rounded-lg shadow mb-3">
          <h3 className="text-md font-semibold mb-3">Data Pelanggan</h3>
          
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm mb-1">No. Service:</label>
                <input
                  type="text"
                  value={serviceData.serviceNumber}
                  className="w-full p-1.5 text-sm border rounded bg-gray-100"
                  disabled
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Nama:</label>
                <input
                  type="text"
                  name="customerName"
                  value={serviceData.customerName}
                  onChange={handleChange}
                  className="w-full p-1.5 text-sm border rounded"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm mb-1">Telepon:</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={serviceData.phoneNumber}
                  onChange={handleChange}
                  className="w-full p-1.5 text-sm border rounded"
                  required
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Email:</label>
                <input
                  type="email"
                  name="email"
                  value={serviceData.email}
                  onChange={handleChange}
                  className="w-full p-1.5 text-sm border rounded"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm mb-1">Alamat:</label>
              <textarea
                name="address"
                value={serviceData.address}
                onChange={handleChange}
                className="w-full p-1.5 text-sm border rounded"
                rows={2}
                required
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow mb-3">
          <h3 className="text-md font-semibold mb-3">Informasi Perangkat</h3>
          
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm mb-1">Jenis:</label>
                <select
                  name="deviceType"
                  value={serviceData.deviceType}
                  onChange={handleChange}
                  className="w-full p-1.5 text-sm border rounded"
                >
                  <option value="laptop">Laptop</option>
                  <option value="computer">Komputer</option>
                  <option value="printer">Printer</option>
                  <option value="all-in-one">All-in-One</option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-1">Merek:</label>
                <input
                  type="text"
                  name="brand"
                  value={serviceData.brand}
                  onChange={handleChange}
                  className="w-full p-1.5 text-sm border rounded"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm mb-1">Model:</label>
                <input
                  type="text"
                  name="model"
                  value={serviceData.model}
                  onChange={handleChange}
                  className="w-full p-1.5 text-sm border rounded"
                  required
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Serial Number:</label>
                <input
                  type="text"
                  name="serialNumber"
                  value={serviceData.serialNumber}
                  onChange={handleChange}
                  className="w-full p-1.5 text-sm border rounded"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow mb-3">
          <h3 className="text-md font-semibold mb-3">Detail Masalah</h3>
          
          <div className="space-y-2">
            <div>
              <label className="block text-sm mb-1">Keluhan:</label>
              <textarea
                name="problem"
                value={serviceData.problem}
                onChange={handleChange}
                className="w-full p-1.5 text-sm border rounded"
                rows={2}
                required
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Kelengkapan:</label>
              <textarea
                name="accessories"
                value={serviceData.accessories}
                onChange={handleChange}
                className="w-full p-1.5 text-sm border rounded"
                placeholder="Contoh: Charger, Mouse, Tas"
                rows={2}
                required
              />
            </div>

            <div className="flex items-center text-sm">
              <input
                type="checkbox"
                name="needWebsite"
                checked={serviceData.needWebsite}
                onChange={handleChange}
                className="mr-2"
              />
              <label>Saya juga memerlukan jasa pembuatan website/aplikasi</label>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="w-1/2 bg-gray-500 text-white py-1.5 px-3 rounded text-sm hover:bg-gray-600"
          >
            Batal
          </button>
          <button
            type="submit"
            className="w-1/2 bg-blue-500 text-white py-1.5 px-3 rounded text-sm hover:bg-blue-600"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Menyimpan...' : 'Kirim Form'}
          </button>
        </div>

        <a
          href="https://wa.me/085655025603"
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full text-center bg-green-500 text-white py-1.5 px-3 rounded text-sm hover:bg-green-600 mt-2"
        >
          Konsultasi via WhatsApp
        </a>
      </form>
    </div>
  );
};

export default ServiceTrackingForm; 