import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

const ForbiddenPage = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-red-100 p-4 rounded-full">
            <ShieldAlert className="h-16 w-16 sm:h-20 sm:w-20 text-red-600" />
          </div>
        </div>
        <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-4">403</h1>
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-4">
          Access Denied
        </h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          You don't have permission to access this page.
        </p>
        <Link
          to="/"
          className="btn btn-primary inline-flex items-center"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Go Back
        </Link>
      </div>
    </div>
  );
};

export default ForbiddenPage;
