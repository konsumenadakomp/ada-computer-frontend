import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ServiceTrackingForm from './components/ServiceTrackingForm';
import ServiceTracking from './components/ServiceTracking';
import AdminPanel from './components/AdminPanel';
import Login from './components/Login';
import Navbar from './components/Navbar';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <div className="min-h-screen bg-gray-100">
          <Navbar />
          
          <main>
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
              <Routes>
                <Route path="/" element={<ServiceTrackingForm />} />
                <Route path="/track" element={<ServiceTracking />} />
                <Route path="/login" element={<Login />} />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute>
                      <AdminPanel />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </div>
          </main>

          <footer className="bg-gray-800 text-white py-8 mt-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <h3 className="text-lg font-semibold mb-4">A.D.A COMPUTER</h3>
                  <p>Dsn. Tambakrejo RT.06/RW.03</p>
                  <p>Tambak Rejo, Gayaman, Kec. Mojoanyar</p>
                  <p>Kabupaten Mojokerto, Jawa Timur 61364</p>
                  <p className="mt-2">Kordinat: -7.4993951,112.4727767</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-4">Layanan</h3>
                  <ul className="space-y-2">
                    <li>Service Laptop</li>
                    <li>Service Komputer</li>
                    <li>Upgrade Hardware</li>
                    <li>Instalasi Software</li>
                    <li>Pembuatan Website</li>
                    <li>Aplikasi Toko</li>
                  </ul>
                </div>

      <div>
                  <h3 className="text-lg font-semibold mb-4">Kontak</h3>
                  <p>Telp: 0321-5281048</p>
                  <p>WA: 085655025603</p>
                  <p>Jam Operasional:</p>
                  <p>Senin - Minggu</p>
                  <p>07.00 - 21.00 WIB</p>
                </div>
              </div>
      </div>
          </footer>
      </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
