import React from 'react';
import { useSelector } from 'react-redux';
import { Menu, Bell } from 'lucide-react';
import { RootState } from '../store';

const Header = () => {
  const user = useSelector((state: RootState) => state.auth.user);

  return (
    <header className="bg-white shadow">
      <div className="flex justify-between items-center px-4 py-4 sm:px-6 lg:px-8">
        <button
          type="button"
          className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
        >
          <Menu className="h-6 w-6" />
        </button>

        <div className="flex items-center">
          <button
            type="button"
            className="p-1 rounded-full text-gray-400 hover:text-gray-500"
          >
            <Bell className="h-6 w-6" />
          </button>

          <div className="ml-3 relative flex items-center">
            <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="ml-2 text-sm font-medium text-gray-700">
              {user?.name}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;