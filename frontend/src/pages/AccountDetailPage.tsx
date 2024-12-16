import { useState, useEffect, ChangeEvent } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { debounce } from 'lodash'; 

interface Account {
  id: string;
  name: string;
  balance: string;
}

interface TransferData {
  to_account: string;
  amount: string;
}

interface SearchResult {
  id: string;
  name: string;
}

const AccountDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [account, setAccount] = useState<Account | null>(null);
  const [transferData, setTransferData] = useState<TransferData>({
    to_account: '',
    amount: '',
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState<boolean>(false);

  useEffect(() => {
    fetchAccountDetails();
  }, [id]);

  const fetchAccountDetails = async (): Promise<void> => {
    try {
      const response = await axios.get<Account>(`http://localhost:8000/api/accounts/${id}`);
      setAccount(response.data);
    } catch (error) {
      console.error('Error fetching account details:', error);
    }
  };

// Modify the search function
const searchAccounts = async (query: string): Promise<void> => {
  if (!query.trim()) {
    setSearchResults([]);
    return;
  }

  try {
    const response = await axios.get<{ results: SearchResult[] }>(
      `http://localhost:8000/api/accounts/`,
      {
        params: {
          search: query,  // Use generic search parameter
          ordering: 'name'  // Optional: add ordering
        }
      }
    );
    setSearchResults(response.data.results);
  } catch (error) {
    console.error('Error searching accounts:', error);
    setSearchResults([]);
  }
};

  // Use debounce
  const debouncedSearch = debounce(searchAccounts, 300);

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
    setShowResults(true);
  };

  const handleSelectAccount = (selectedAccount: SearchResult): void => {
    setTransferData(prev => ({
      ...prev,
      to_account: selectedAccount.id
    }));
    setSearchTerm(selectedAccount.name);
    setShowResults(false);
  };

  const handleTransfer = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post('http://localhost:8000/api/accounts/transfer/', {
        from_account: id,
        to_account: transferData.to_account,
        amount: parseFloat(transferData.amount),
      });
      
      alert('Transfer successful!');
      fetchAccountDetails();
      setTransferData({ to_account: '', amount: '' });
      setSearchTerm('');
    } catch (error) {
      console.error('Error making transfer:', error);
      alert('Transfer failed');
    } finally {
      setLoading(false);
    }
  };

  if (!account) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-2xl font-bold mb-4">{account.name}</h1>
          <p className="text-gray-600">Account ID: {account.id}</p>
          <p className="text-2xl font-bold mt-4">
            Balance: ${parseFloat(account.balance).toFixed(2)}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Make a Transfer</h2>
          <form onSubmit={handleTransfer} className="space-y-4">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700">
                Recipient Account
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                onFocus={() => setShowResults(true)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Search by account name..."
                required
              />
              {showResults && searchResults.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                  {searchResults.map((result) => (
                    <div
                      key={result.id}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleSelectAccount(result)}
                    >
                      <div className="font-medium">{result.name}</div>
                      <div className="text-sm text-gray-500">ID: {result.id}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Amount
              </label>
              <input
                type="number"
                step="0.01"
                value={transferData.amount}
                onChange={(e) => setTransferData(prev => ({
                  ...prev,
                  amount: e.target.value
                }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading || !transferData.to_account || !transferData.amount}
              className={`w-full bg-blue-500 text-white py-2 rounded-lg ${
                loading || !transferData.to_account || !transferData.amount
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-blue-600'
              }`}
            >
              {loading ? 'Processing...' : 'Transfer'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AccountDetailPage;