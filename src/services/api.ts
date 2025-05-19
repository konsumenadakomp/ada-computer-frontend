const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Debug logging untuk membantu troubleshooting
console.log('API URL:', API_URL);

export interface ServiceData {
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
  technician: string;
  cancelReason: string;
  notes: string[];
  createdAt: string;
  estimatedCost: string;
}

export interface Technician {
  id: string;
  name: string;
  specialization: string[];
  active: boolean;
  _id?: string;
  createdAt?: string;
  updatedAt?: string;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Origin': window.location.origin,
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

// Fungsi helper untuk request options
const getRequestOptions = (method: string = 'GET', body?: any) => ({
  method,
  headers: getAuthHeaders(),
  credentials: 'include' as RequestCredentials,
  ...(body ? { body: JSON.stringify(body) } : {})
});

export const createService = async (serviceData: Partial<ServiceData>): Promise<ServiceData> => {
  try {
    console.log('Sending service data:', serviceData);
    const response = await fetch(`${API_URL}/services`, getRequestOptions('POST', serviceData));
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Network response was not ok');
    }
    
    const result = await response.json();
    console.log('Service created:', result);
    return result;
  } catch (error) {
    console.error('Error creating service:', error);
    throw error;
  }
};

export const getService = async (serviceNumber: string): Promise<ServiceData> => {
  try {
    const response = await fetch(`${API_URL}/services/${serviceNumber}`, getRequestOptions());
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Service tidak ditemukan');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error getting service:', error);
    throw error;
  }
};

export const getAllServices = async (): Promise<ServiceData[]> => {
  try {
    const response = await fetch(`${API_URL}/services`, getRequestOptions());
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Network response was not ok');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error getting services:', error);
    throw error;
  }
};

export const updateService = async (serviceNumber: string, updateData: Partial<ServiceData>): Promise<ServiceData> => {
  try {
    console.log('Updating service:', serviceNumber, 'with data:', updateData);
    const response = await fetch(
      `${API_URL}/services/${serviceNumber}`, 
      getRequestOptions('PATCH', updateData)
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Gagal mengupdate service');
    }

    const result = await response.json();
    console.log('Service updated successfully:', result);
    return result;
  } catch (error) {
    console.error('Error updating service:', error);
    throw error;
  }
};

export const deleteService = async (serviceNumber: string): Promise<void> => {
  const response = await fetch(
    `${API_URL}/services/${serviceNumber}`, 
    getRequestOptions('DELETE')
  );
  if (!response.ok) {
    throw new Error('Gagal menghapus service');
  }
};

export const getAllTechnicians = async (): Promise<Technician[]> => {
  const response = await fetch(`${API_URL}/technicians`, getRequestOptions());
  if (!response.ok) {
    throw new Error('Gagal mengambil data teknisi');
  }
  return response.json();
};

export const createTechnician = async (technicianData: Omit<Technician, '_id'>): Promise<Technician> => {
  const response = await fetch(
    `${API_URL}/technicians`, 
    getRequestOptions('POST', technicianData)
  );
  if (!response.ok) {
    throw new Error('Gagal menambahkan teknisi');
  }
  return response.json();
};

export const updateTechnician = async (id: string, updateData: Partial<Technician>): Promise<Technician> => {
  const response = await fetch(
    `${API_URL}/technicians/${id}`, 
    getRequestOptions('PATCH', updateData)
  );
  if (!response.ok) {
    throw new Error('Gagal mengupdate teknisi');
  }
  return response.json();
};

export const deleteTechnician = async (id: string): Promise<void> => {
  const response = await fetch(
    `${API_URL}/technicians/${id}`, 
    getRequestOptions('DELETE')
  );
  if (!response.ok) {
    throw new Error('Gagal menghapus teknisi');
  }
};
