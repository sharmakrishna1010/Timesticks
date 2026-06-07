import Navbar from '../components/signUp/Navbar';
import LoginForm from '../components/login/LoginForm';

export default function Login() {
  return (
    <div className="auth-page">
      <Navbar showSignup />
      <main className="auth-main">
        <LoginForm />
      </main>
    </div>
  );
}
