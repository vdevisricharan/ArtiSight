import { Link, useNavigate } from 'react-router-dom';
import { Camera, Home, ArrowLeft, AlertCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <SEO
        title="Page Not Found (404)"
        description="The page you are looking for does not exist on ArtiSight."
        robots="noindex, nofollow"
      />
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-gray-100 text-center">
          <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-blue-100">
            <AlertCircle size={36} className="text-blue-600" />
          </div>

          <span className="text-xs font-bold uppercase tracking-widest text-blue-600 block mb-2">
            Error Code 404
          </span>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mb-3">
            Page Not Found (Out of Focus)
          </h1>

          <p className="text-sm text-gray-600 leading-relaxed mb-8">
            The page you are looking for doesn&apos;t exist, has been moved, or the link may be broken. Let&apos;s get you back on track.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold text-xs transition-all"
            >
              <ArrowLeft size={16} />
              Go Back
            </button>

            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-all shadow-md hover:shadow-lg"
            >
              <Home size={16} />
              Back to Home
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <Link
              to="/upload"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            >
              <Camera size={14} />
              Or start a new photo critique →
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NotFound;
