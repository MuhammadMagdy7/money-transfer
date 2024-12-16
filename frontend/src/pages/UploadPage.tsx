import { useState, FormEvent, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import axios, { AxiosError } from 'axios';

const UploadPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleFileUpload = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    setLoading(true);

    try {
      await axios.post('http://localhost:8000/api/accounts/import_csv/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      navigate('/accounts');
    } catch (error) {
      console.error('Error uploading file:', error);
      if (error instanceof AxiosError) {
        alert(`Error uploading file: ${error.message}`);
      } else {
        alert('Error uploading file');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setFile(files[0]);
    }
  };

  return (
<div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Upload CSV File</h1>
        <form onSubmit={handleFileUpload} className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="w-full"
            />
          </div>
          <button
            type="submit"
            disabled={!file || loading}
            className={`w-full bg-blue-500 text-white py-2 rounded-lg ${
              loading ? 'opacity-50' : 'hover:bg-blue-600'
            }`}
          >
            {loading ? 'Uploading...' : 'Upload'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadPage;