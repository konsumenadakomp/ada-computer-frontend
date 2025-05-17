import React, { useState, useEffect } from 'react';
import type { Technician } from '../services/api';
import { getAllTechnicians, createTechnician, updateTechnician, deleteTechnician } from '../services/api';

interface TechnicianManagementProps {
  onTechnicianUpdate?: () => void;
}

const TechnicianManagement: React.FC<TechnicianManagementProps> = ({ onTechnicianUpdate }) => {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [newTechnician, setNewTechnician] = useState({
    name: '',
    specialization: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTechnicians();
  }, []);

  const loadTechnicians = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllTechnicians();
      setTechnicians(data || []);
      onTechnicianUpdate?.(); // Panggil callback setelah memuat data
    } catch (err) {
      console.error('Error loading technicians:', err);
      setError(err instanceof Error ? err.message : 'Gagal memuat data teknisi');
      setTechnicians([]);
    } finally {
      setLoading(false);
    }
  };

  const generateTechnicianId = () => {
    const lastId = technicians.length > 0 
      ? parseInt(technicians[technicians.length - 1].id.replace('TECH', ''))
      : 0;
    return `TECH${String(lastId + 1).padStart(3, '0')}`;
  };

  const handleAddTechnician = async () => {
    if (!newTechnician.name || !newTechnician.specialization) return;

    try {
      setError(null);
      const technicianToAdd: Omit<Technician, '_id'> = {
        id: generateTechnicianId(),
        name: newTechnician.name,
        specialization: newTechnician.specialization.split(',').map(s => s.trim()),
        active: true
      };

      await createTechnician(technicianToAdd);
      await loadTechnicians();
      setNewTechnician({ name: '', specialization: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menambahkan teknisi');
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      setError(null);
      const tech = technicians.find(t => t.id === id);
      if (tech) {
        await updateTechnician(id, { active: !tech.active });
        await loadTechnicians();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengupdate status teknisi');
    }
  };

  const handleDeleteTechnician = async (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus teknisi ini?')) {
      try {
        setError(null);
        await deleteTechnician(id);
        await loadTechnicians();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Gagal menghapus teknisi');
      }
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Manajemen Teknisi</h2>
        <div className="text-center py-4">Memuat data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Manajemen Teknisi</h2>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          <p>{error}</p>
          <button
            onClick={loadTechnicians}
            className="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4">Manajemen Teknisi</h2>

      {/* Form Tambah Teknisi */}
      <div className="mb-6 p-4 border rounded">
        <h3 className="text-lg font-semibold mb-3">Tambah Teknisi Baru</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nama Teknisi</label>
            <input
              type="text"
              value={newTechnician.name}
              onChange={(e) => setNewTechnician({ ...newTechnician, name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Masukkan nama teknisi"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Spesialisasi</label>
            <input
              type="text"
              value={newTechnician.specialization}
              onChange={(e) => setNewTechnician({ ...newTechnician, specialization: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Contoh: Laptop, PC Desktop, Printer (pisahkan dengan koma)"
            />
          </div>
          <button
            onClick={handleAddTechnician}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Tambah Teknisi
          </button>
        </div>
      </div>

      {/* Daftar Teknisi */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nama
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Spesialisasi
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {technicians.map((tech) => (
              <tr key={tech.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {tech.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {tech.name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {tech.specialization.join(', ')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button
                    onClick={() => handleToggleActive(tech.id)}
                    className={`px-3 py-1 rounded-full text-xs ${
                      tech.active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {tech.active ? 'Aktif' : 'Nonaktif'}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button
                    onClick={() => handleDeleteTechnician(tech.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TechnicianManagement; 