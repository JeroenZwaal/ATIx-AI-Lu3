import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-neutral-950 text-white px-6 py-4">
      <div className="flex justify-between items-center">
        <span className="text-base font-bold text-red-600">Avans</span>
        <Link to="/dashboard" className="text-base !text-white hover:text-gray-300 transition-opacity">
          Contact
        </Link>
      </div>
    </footer>
  );
}
