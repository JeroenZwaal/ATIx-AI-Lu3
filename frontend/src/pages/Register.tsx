import { Link } from 'react-router-dom';

export default function Register() {
  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center px-6 py-4">
      <div className="w-full max-w-sm">
        <h1 className="text-white text-4xl font-normal text-center mb-8">Register</h1>
        
        <div className="bg-neutral-800 rounded-3xl p-6 space-y-4">
          <div>
            <label htmlFor="fullname" className="block text-white text-sm mb-2">
              Voledige naam
            </label>
            <input
              type="text"
              id="fullname"
              className="w-full bg-neutral-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-neutral-500"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-white text-sm mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="w-full bg-neutral-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-neutral-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-white text-sm mb-2">
              Wachtwoord
            </label>
            <input
              type="password"
              id="password"
              className="w-full bg-neutral-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-neutral-500"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-white text-sm mb-2">
              Herhaal wachtwoord
            </label>
            <input
              type="password"
              id="confirmPassword"
              className="w-full bg-neutral-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-neutral-500"
            />
          </div>

          <button 
            style={{ backgroundColor: '#c4b5fd' }}
            className="w-full hover:bg-violet-400 text-black font-medium rounded-lg px-4 py-3 mt-4 transition-colors"
          >
            Register
          </button>
        </div>

        <div className="text-center mt-6">
          <p className="text-white text-sm">
            Problemen met Registereren?{' '}
            <br />
            Neem <span className="font-bold">contact</span> op!
          </p>
        </div>
      </div>
      
      <div className="fixed bottom-4 left-4 text-red-600 text-xl font-bold">
        Avans
      </div>
    </div>
  );
}
