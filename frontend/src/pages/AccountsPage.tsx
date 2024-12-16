import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface Account {
  id: string;
  name: string;
  balance: string;
}

interface PaginationState {
  totalPages: number;
  currentPage: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

interface ApiResponse {
  results: Account[];
  total_pages: number;
  current_page: number;
  links: {
    next: string | null;
    previous: string | null;
  };
}

const AccountsPage: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [pagination, setPagination] = useState<PaginationState>({
    totalPages: 1,
    currentPage: 1,
    hasNext: false,
    hasPrevious: false,
  });
  const [currentPage, setCurrentPage] = useState<number>(1);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAccounts(currentPage);
  }, [currentPage]);

  const fetchAccounts = async (page: number): Promise<void> => {
    setIsLoading(true); 
    try {
      const response = await axios.get<ApiResponse>(
        `http://localhost:8000/api/accounts/?page=${page}`
      );
      
      setAccounts(response.data.results);
      setPagination({
        totalPages: response.data.total_pages,
        currentPage: response.data.current_page,
        hasNext: !!response.data.links.next,
        hasPrevious: !!response.data.links.previous,
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Error fetching accounts:', error.response?.data || error.message);
      } else {
        console.error('An unexpected error occurred:', error);
      }
    } finally {
      setIsLoading(false); 
    }
  };

  const handleAccountClick = (accountId: string): void => {
    navigate(`/account/${accountId}`);
  };

  const handlePageChange = (newPage: number): void => {
    setCurrentPage(newPage);
  };

  const formatBalance = (balance: string): string => {
    return parseFloat(balance).toFixed(2);
  };

  const handleDeleteAllAccounts = async (): Promise<void> => {
    if (window.confirm('Are you sure you want to delete all accounts?')) {
      try {
        await axios.delete('http://localhost:8000/api/accounts/delete_all/');
        fetchAccounts(currentPage);
        alert('All accounts have been deleted successfully.');
      } catch (error) {
        console.error('Error deleting accounts:', error);
        alert('Failed to delete accounts. Please try again.');
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6">Accounts List</h1>
        {isLoading ? (
          <div className="text-center py-4">Loading...</div>
        ) : (
          <div className="bg-white rounded-lg shadow">
            {accounts.map((account) => (
              <div
                key={account.id}
                onClick={() => handleAccountClick(account.id)}
                className="p-4 border-b hover:bg-gray-50 cursor-pointer"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="font-semibold">{account.name}</h2>
                    <p className="text-gray-600">ID: {account.id}</p>
                  </div>
                  <div className="text-lg font-bold">
                    ${formatBalance(account.balance)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="mt-4 flex justify-between items-center">
          <div className="flex space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!pagination.hasPrevious}
              className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
              aria-label="Previous page"
            >
              Previous
            </button>
            <span className="px-4 py-2">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!pagination.hasNext}
              className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
              aria-label="Next page"
            >
              Next
            </button>
          </div>
          <button
            onClick={handleDeleteAllAccounts}
            className="px-4 py-2 bg-red-500 text-white rounded"
            aria-label="Delete all accounts"
          >
            Delete All Accounts
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountsPage;