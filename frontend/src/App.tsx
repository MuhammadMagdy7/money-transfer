import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import UploadPage from './pages/UploadPage';
import AccountsPage from './pages/AccountsPage';
import AccountDetailPage from './pages/AccountDetailPage';

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <main className="pt-4">
          <Routes>
            <Route path="/" element={<UploadPage />} />
            <Route path="/accounts" element={<AccountsPage />} />
            <Route path="/account/:id" element={<AccountDetailPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;