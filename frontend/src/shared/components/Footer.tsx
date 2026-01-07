import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="text-white py-4 px-4 md:px-6">
      <div className="flex justify-between items-center px-6 py-3">
        <span className="text-2xl font-bold text-red-600">Avans</span>
        <Link to="/dashboard" className="text-base !text-white hover:text-gray-300 transition-colors">
          Contact
        </Link>
      </div>
    </footer>
  );
}
