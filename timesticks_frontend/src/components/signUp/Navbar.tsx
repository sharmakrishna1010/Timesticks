import logo from '../../assets/logo_noBG.png';

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-8 py-4 w-full bg-[#f8f9fa]">
      <div className="flex items-center gap-2 cursor-pointer">
        <img src={logo} alt="Timesticks Logo" className="h-15 w-auto" />
        <p 
          className="text-3xl font-bold tracking-tight text-gray-900"
          style={{ fontFamily: "'Montserrat', sans-serif" }}
        >
          T<span className="text-blue-500">i</span>mesticks
        </p>
      </div>

      <div className="flex items-center gap-4 text-sm">
        <span className="text-gray-500  cursor-default">Already have an account?</span>
        <button className="cursor-pointer px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 transition-colors font-medium">
          Sign In
        </button>
      </div>
    </nav>
  );
}