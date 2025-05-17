import React, { useState, useEffect } from 'react';
import { getAllServices, updateService, getAllTechnicians, deleteService } from '../services/api';
import TechnicianManagement from './TechnicianManagement';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

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
  status: string;
  technician: string;
  cancelReason: string;
  notes: string[];
  createdAt: string;
  estimatedCost: string;
}

interface Technician {
  id: string;
  name: string;
  specialization: string[];
  active: boolean;
}

const AdminPanel: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'services' | 'technicians'>('services');
  const [serviceList, setServiceList] = useState<ServiceData[]>([]);
  const [selectedService, setSelectedService] = useState<ServiceData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [newNote, setNewNote] = useState('');
  const [estimatedCost, setEstimatedCost] = useState('');
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [warrantyText, setWarrantyText] = useState(localStorage.getItem('warrantyText') || 'Garansi service 1 minggu');

  // Load data from API when component mounts
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [services, techData] = await Promise.all([
          getAllServices(),
          getAllTechnicians()
        ]);
        setServiceList(services);
        setTechnicians(techData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Gagal memuat data');
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

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

  const handleStatusUpdate = async (serviceNumber: string, newStatus: string, cancelReason?: string) => {
    try {
      setError(null);
      
      // Validasi alasan pembatalan
      if ((newStatus === 'Dibatalkan Konsumen' || newStatus === 'Dibatalkan Toko') && !cancelReason?.trim()) {
        alert('Mohon isi alasan pembatalan');
        return;
      }

      const statusNote = `${new Date().toLocaleString('id-ID')} - Status diubah menjadi: ${newStatus}`;
      
      const updateData: Partial<ServiceData> = {
        status: newStatus,
        notes: [...(selectedService?.notes || []), statusNote]
      };

      // Tambahkan alasan pembatalan jika status pembatalan
      if ((newStatus === 'Dibatalkan Konsumen' || newStatus === 'Dibatalkan Toko') && cancelReason) {
        updateData.cancelReason = cancelReason.trim();
        updateData.notes = [
          ...(updateData.notes || []),
          `${new Date().toLocaleString('id-ID')} - Alasan pembatalan: ${cancelReason.trim()}`
        ];
      }

      console.log('Sending update:', updateData);
      const updatedService = await updateService(serviceNumber, updateData);
      console.log('Service updated:', updatedService);

      setServiceList(prevList => 
        prevList.map(service => 
          service.serviceNumber === serviceNumber ? updatedService : service
        )
      );

      if (selectedService?.serviceNumber === serviceNumber) {
        setSelectedService(updatedService);
      }

      setError(null);
    } catch (err) {
      console.error('Error updating service:', err);
      setError(err instanceof Error ? err.message : 'Gagal mengupdate status');
      // Reset status jika update gagal
      setServiceList(prevList =>
        prevList.map(service =>
          service.serviceNumber === serviceNumber ? service : service
        )
      );
    }
  };

  const handleTechnicianUpdate = async (serviceNumber: string, technician: string) => {
    try {
      setError(null);
      const technicianNote = `${new Date().toLocaleString('id-ID')} - Teknisi ditugaskan: ${technician}`;
      
      const updatedService = await updateService(serviceNumber, {
        technician,
        notes: [...(selectedService?.notes || []), technicianNote]
      });

      setServiceList(prevList =>
        prevList.map(service =>
          service.serviceNumber === serviceNumber ? updatedService : service
        )
      );

      if (selectedService?.serviceNumber === serviceNumber) {
        setSelectedService(updatedService);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengupdate teknisi');
    }
  };

  const handleAddNote = async () => {
    if (!selectedService || !newNote.trim()) return;

    try {
      const timestamp = new Date().toLocaleString('id-ID');
      const noteWithTimestamp = `${timestamp} - ${newNote}`;
      
      const updatedService = await updateService(selectedService.serviceNumber, {
        notes: [...selectedService.notes, noteWithTimestamp]
      });

      setServiceList(prevList =>
        prevList.map(service =>
          service.serviceNumber === selectedService.serviceNumber ? updatedService : service
        )
      );
      
      setSelectedService(updatedService);
      setNewNote('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menambahkan catatan');
    }
  };

  const handleUpdateEstimatedCost = async () => {
    if (!selectedService) return;

    try {
      const updatedService = await updateService(selectedService.serviceNumber, {
        estimatedCost
      });

      setServiceList(prevList =>
        prevList.map(service =>
          service.serviceNumber === selectedService.serviceNumber ? updatedService : service
        )
      );
      
      setSelectedService(updatedService);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengupdate estimasi biaya');
    }
  };

  const handleDeleteService = async (serviceNumber: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus service ini?')) {
      try {
        setError(null);
        await deleteService(serviceNumber);
        setServiceList(prevList => prevList.filter(service => service.serviceNumber !== serviceNumber));
        if (selectedService?.serviceNumber === serviceNumber) {
          setSelectedService(null);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Gagal menghapus service');
      }
    }
  };

  const handlePrintThermal = (service: ServiceData) => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [58, 150] // Ukuran kertas thermal 58mm
    });

    // Konfigurasi font dan ukuran
    doc.setFontSize(8);
    
    // Header
    doc.text('A.D.A COMPUTER', doc.internal.pageSize.width/2, 5, { align: 'center' });
    doc.setFontSize(6);
    doc.text('Dsn. Tambakrejo RT.06/RW.03', doc.internal.pageSize.width/2, 8, { align: 'center' });
    doc.text('Tambak Rejo, Gayaman, Kec. Mojoanyar', doc.internal.pageSize.width/2, 11, { align: 'center' });
    doc.text('Mojokerto, Jawa Timur 61364', doc.internal.pageSize.width/2, 14, { align: 'center' });
    doc.text('Telp: 0321-5281048 / WA: 085655025603', doc.internal.pageSize.width/2, 17, { align: 'center' });
    
    // Garis pemisah
    doc.line(5, 19, 53, 19);
    
    // Informasi Service
    doc.setFontSize(7);
    let y = 22;
    const lineHeight = 3;
    const leftMargin = 5;
    const colWidth = 15; // Lebar kolom untuk label
    
    // Format teks dengan alignment yang rapi
    const addRow = (label: string, value: string) => {
      doc.text(`${label}:`, leftMargin, y);
      const valueLines = doc.splitTextToSize(value, 35);
      doc.text(valueLines, leftMargin + colWidth, y);
      y += lineHeight * valueLines.length;
    };
    
    addRow('No. Service', service.serviceNumber);
    addRow('Tanggal', new Date(service.createdAt).toLocaleDateString('id-ID'));
    addRow('Pelanggan', service.customerName);
    addRow('Telepon', service.phoneNumber);
    addRow('Perangkat', service.deviceType);
    addRow('Merk/Model', `${service.brand} ${service.model}`);
    addRow('SN', service.serialNumber);
    addRow('Keluhan', service.problem);
    addRow('Kelengkapan', service.accessories);
    
    if (service.estimatedCost) {
      addRow('Estimasi', `Rp ${service.estimatedCost}`);
    }
    
    addRow('Status', service.status);
    
    if (service.technician) {
      addRow('Teknisi', service.technician);
    }
    
    // Garis pemisah
    y += 2;
    doc.line(5, y, 53, y);
    y += 3;
    
    // Footer
    doc.setFontSize(6);
    doc.text('Terima kasih atas kepercayaan Anda', doc.internal.pageSize.width/2, y, { align: 'center' });
    y += lineHeight;
    doc.text(warrantyText, doc.internal.pageSize.width/2, y, { align: 'center' });
    
    // Simpan PDF dengan nama yang sesuai
    doc.save(`Thermal_${service.serviceNumber}_${service.customerName}.pdf`);
  };

  const handlePrintA4 = (service: ServiceData) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(16);
    doc.text('A.D.A COMPUTER', doc.internal.pageSize.width/2, 15, { align: 'center' });
    doc.setFontSize(10);
    doc.text('Dsn. Tambakrejo RT.06/RW.03', doc.internal.pageSize.width/2, 22, { align: 'center' });
    doc.text('Tambak Rejo, Gayaman, Kec. Mojoanyar', doc.internal.pageSize.width/2, 27, { align: 'center' });
    doc.text('Mojokerto, Jawa Timur 61364', doc.internal.pageSize.width/2, 32, { align: 'center' });
    doc.text('Telp: 0321-5281048 / WA: 085655025603', doc.internal.pageSize.width/2, 37, { align: 'center' });
    
    // Garis pemisah
    doc.line(20, 40, 190, 40);
    
    // Informasi Service
    let y = 50;
    const lineHeight = 7;
    const leftMargin = 20;
    const colWidth = 25; // Lebar kolom untuk label
    const maxWidth = 80; // Lebar maksimum untuk nilai teks panjang
    
    // Format teks dengan alignment yang rapi
    const addRow = (label: string, value: string, x = leftMargin) => {
      doc.text(`${label}:`, x, y);
      const valueLines = doc.splitTextToSize(value, maxWidth);
      doc.text(valueLines, x + colWidth, y);
      y += lineHeight * valueLines.length;
    };

    // Format teks dengan 2 kolom
    const addDoubleRow = (label1: string, value1: string, label2: string, value2: string) => {
      const col2X = 120;
      addRow(label1, value1, leftMargin);
      y -= lineHeight * (doc.splitTextToSize(value1, maxWidth).length); // Reset y position
      addRow(label2, value2, col2X);
    };
    
    // Informasi Service - 2 kolom
    addDoubleRow('No. Service', service.serviceNumber, 'Tanggal', new Date(service.createdAt).toLocaleDateString('id-ID'));
    addDoubleRow('Pelanggan', service.customerName, 'Telepon', service.phoneNumber);
    
    // Informasi Service - 1 kolom
    addRow('Email', service.email || '-');
    addRow('Alamat', service.address);
    y += lineHeight; // Tambah spasi
    
    addRow('Perangkat', service.deviceType);
    addDoubleRow('Merk/Model', `${service.brand} ${service.model}`, 'SN', service.serialNumber);
    
    y += lineHeight/2; // Tambah sedikit spasi
    addRow('Keluhan', service.problem);
    addRow('Kelengkapan', service.accessories);
    
    addDoubleRow('Status', service.status, 'Teknisi', service.technician || '-');
    
    if (service.estimatedCost) {
      addRow('Estimasi Biaya', `Rp ${service.estimatedCost}`);
    }
    
    // Riwayat Service
    y += lineHeight;
    doc.text('Riwayat Service:', leftMargin, y);
    y += lineHeight;
    
    service.notes.forEach(note => {
      const noteLines = doc.splitTextToSize(note, 150);
      doc.text(noteLines, leftMargin, y);
      y += (noteLines.length * 5);
    });
    
    // Footer
    y = doc.internal.pageSize.height - 20;
    doc.setFontSize(10);
    doc.text('Terima kasih atas kepercayaan Anda', doc.internal.pageSize.width/2, y, { align: 'center' });
    y += 5;
    doc.text(warrantyText, doc.internal.pageSize.width/2, y, { align: 'center' });
    
    // Simpan PDF
    doc.save(`Service_${service.serviceNumber}_${service.customerName}.pdf`);
  };

  const filteredAndSortedServices = serviceList
    .filter(service => 
      (statusFilter === 'all' || service.status === statusFilter) &&
      (
        service.serviceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.phoneNumber.includes(searchTerm)
      )
    )
    .sort((a, b) => {
      if (sortBy === 'date') {
        return sortOrder === 'desc' 
          ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else {
        return sortOrder === 'desc'
          ? b.status.localeCompare(a.status)
          : a.status.localeCompare(b.status);
      }
    });

  const loadTechnicians = async () => {
    try {
      const techData = await getAllTechnicians();
      setTechnicians(techData);
    } catch (err) {
      console.error('Error refreshing technicians:', err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow">
        {/* Header with Tabs and Logout */}
        <div className="border-b border-gray-200">
          <div className="flex justify-between items-center px-4">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab('services')}
                className={`py-4 px-6 ${
                  activeTab === 'services'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Daftar Service
              </button>
              <button
                onClick={() => setActiveTab('technicians')}
                className={`py-4 px-6 ${
                  activeTab === 'technicians'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Manajemen Teknisi
              </button>
            </nav>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <label className="text-sm mr-2">Teks Garansi:</label>
                <input
                  type="text"
                  value={warrantyText}
                  onChange={(e) => setWarrantyText(e.target.value)}
                  className="p-1.5 text-sm border rounded w-64"
                  placeholder="Masukkan teks garansi"
                />
                <button
                  onClick={() => {
                    // Simpan ke localStorage untuk persistensi data
                    localStorage.setItem('warrantyText', warrantyText);
                    alert('Teks garansi berhasil diperbarui!');
                  }}
                  className="ml-2 px-3 py-1.5 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                >
                  Update
                </button>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        <div className="p-4">
          {activeTab === 'services' ? (
            <>
              <h2 className="text-xl font-bold mb-4">Daftar Service</h2>

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                  {error}
                </div>
              )}

              {/* Filter and Search Controls */}
              <div className="mb-4 space-y-2">
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Cari nomor service, nama, atau telepon..."
                    className="flex-1 p-1.5 text-sm border rounded"
                  />
                  
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="p-1.5 text-sm border rounded"
                  >
                    <option value="all">Semua Status</option>
                    <option value="Menunggu">Menunggu</option>
                    <option value="Dalam Pengerjaan">Dalam Pengerjaan</option>
                    <option value="Selesai">Selesai</option>
                    <option value="Dibatalkan Konsumen">Dibatalkan Konsumen</option>
                    <option value="Dibatalkan Toko">Dibatalkan Toko</option>
                  </select>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'date' | 'status')}
                    className="p-1.5 text-sm border rounded"
                  >
                    <option value="date">Urutkan berdasarkan Tanggal</option>
                    <option value="status">Urutkan berdasarkan Status</option>
                  </select>

                  <button
                    onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                    className="p-1.5 text-sm border rounded hover:bg-gray-100"
                  >
                    {sortOrder === 'asc' ? '↑' : '↓'}
                  </button>
                </div>
              </div>

              {/* Service List */}
              <div className="overflow-x-auto">
                {loading ? (
                  <div className="text-center py-4">Memuat data...</div>
                ) : filteredAndSortedServices.length === 0 ? (
                  <div className="text-center py-4">Tidak ada data service</div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          No. Service
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tanggal
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Pelanggan
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Perangkat
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Teknisi
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estimasi Biaya
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredAndSortedServices.map((service) => (
                        <tr key={service.serviceNumber} className="text-sm">
                          <td className="px-3 py-2 whitespace-nowrap">
                            {service.serviceNumber}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            {new Date(service.createdAt).toLocaleDateString('id-ID')}
                          </td>
                          <td className="px-3 py-2">
                            <div>{service.customerName}</div>
                            <div className="text-xs text-gray-500">{service.phoneNumber}</div>
                          </td>
                          <td className="px-3 py-2">
                            {`${service.deviceType} ${service.brand} ${service.model}`}
                          </td>
                          <td className="px-3 py-2">
                            <select
                              value={service.technician || ''}
                              onChange={(e) => handleTechnicianUpdate(service.serviceNumber, e.target.value)}
                              className="text-sm border rounded p-1"
                            >
                              <option value="">Pilih Teknisi</option>
                              {technicians
                                .filter(tech => tech.active)
                                .map((tech) => (
                                  <option key={tech.id} value={tech.name}>
                                    {tech.name}
                                  </option>
                                ))}
                            </select>
                          </td>
                          <td className="px-3 py-2">
                            <select
                              value={service.status}
                              onChange={(e) => {
                                const newStatus = e.target.value;
                                if (newStatus === 'Dibatalkan Konsumen' || newStatus === 'Dibatalkan Toko') {
                                  const reason = prompt('Masukkan alasan pembatalan:');
                                  if (reason && reason.trim()) {
                                    handleStatusUpdate(service.serviceNumber, newStatus, reason.trim());
                                  } else {
                                    alert('Mohon isi alasan pembatalan');
                                    // Reset status jika pembatalan dibatalkan
                                    setServiceList(prevList =>
                                      prevList.map(s =>
                                        s.serviceNumber === service.serviceNumber ? service : s
                                      )
                                    );
                                  }
                                } else {
                                  handleStatusUpdate(service.serviceNumber, newStatus);
                                }
                              }}
                              className={`rounded px-2 py-1 text-xs ${getStatusColor(service.status)}`}
                            >
                              <option value="Menunggu">Menunggu</option>
                              <option value="Dalam Pengerjaan">Dalam Pengerjaan</option>
                              <option value="Selesai">Selesai</option>
                              <option value="Dibatalkan Konsumen">Dibatalkan Konsumen</option>
                              <option value="Dibatalkan Toko">Dibatalkan Toko</option>
                            </select>
                            {(service.status === 'Dibatalkan Konsumen' || service.status === 'Dibatalkan Toko') && service.cancelReason && (
                              <div className="mt-1 text-xs text-red-600">
                                Alasan: {service.cancelReason}
                              </div>
                            )}
                          </td>
                          <td className="px-3 py-2">
                            {service.estimatedCost ? `Rp ${service.estimatedCost}` : '-'}
                          </td>
                          <td className="px-3 py-2">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => setSelectedService(service)}
                                className="text-blue-600 hover:text-blue-800 text-sm"
                              >
                                Detail
                              </button>
                              <button
                                onClick={() => handlePrintThermal(service)}
                                className="text-green-600 hover:text-green-800 text-sm"
                              >
                                Print 58mm
                              </button>
                              <button
                                onClick={() => handlePrintA4(service)}
                                className="text-purple-600 hover:text-purple-800 text-sm"
                              >
                                Print A4
                              </button>
                              <button
                                onClick={() => handleDeleteService(service.serviceNumber)}
                                className="text-red-600 hover:text-red-800 text-sm"
                              >
                                Hapus
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Service Detail Modal */}
              {selectedService && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                  <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-bold">Detail Service</h3>
                      <button
                        onClick={() => setSelectedService(null)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-600">No. Service</p>
                        <p>{selectedService.serviceNumber}</p>
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-gray-600">Pelanggan</p>
                        <p>{selectedService.customerName}</p>
                        <p className="text-sm text-gray-500">{selectedService.phoneNumber}</p>
                        <p className="text-sm text-gray-500">{selectedService.email}</p>
                        <p className="text-sm text-gray-500">{selectedService.address}</p>
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-gray-600">Perangkat</p>
                        <p>{`${selectedService.deviceType} ${selectedService.brand} ${selectedService.model}`}</p>
                        <p className="text-sm text-gray-500">SN: {selectedService.serialNumber}</p>
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-gray-600">Keluhan</p>
                        <p>{selectedService.problem}</p>
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-gray-600">Kelengkapan</p>
                        <p>{selectedService.accessories}</p>
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-gray-600">Status</p>
                        <span className={`inline-block px-2 py-1 rounded text-xs ${getStatusColor(selectedService.status)}`}>
                          {selectedService.status}
                        </span>
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-gray-600">Estimasi Biaya</p>
                        <div className="flex gap-2 mt-1">
                          <input
                            type="text"
                            value={estimatedCost}
                            onChange={(e) => setEstimatedCost(e.target.value)}
                            placeholder="Masukkan estimasi biaya"
                            className="flex-1 p-1.5 text-sm border rounded"
                          />
                          <button
                            onClick={handleUpdateEstimatedCost}
                            className="px-3 py-1.5 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                          >
                            Update
                          </button>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-gray-600">Tambah Catatan</p>
                        <div className="flex gap-2 mt-1">
                          <input
                            type="text"
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                            placeholder="Tambahkan catatan baru"
                            className="flex-1 p-1.5 text-sm border rounded"
                          />
                          <button
                            onClick={handleAddNote}
                            className="px-3 py-1.5 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                          >
                            Tambah
                          </button>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-gray-600">Riwayat</p>
                        <div className="space-y-2 mt-2">
                          {selectedService.notes.map((note, index) => (
                            <div key={index} className="text-sm bg-gray-50 p-2 rounded">
                              {note}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <TechnicianManagement onTechnicianUpdate={loadTechnicians} />
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel; 