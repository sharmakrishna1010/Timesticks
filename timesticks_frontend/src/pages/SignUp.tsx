import Navbar from '../components/signUp/Navbar';
import SignUpForm from '../components/signUp/SignUpForm';

export default function SignUp() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col font-sans">

      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4">
        <SignUpForm />
      </main>

    </div>
  );
}