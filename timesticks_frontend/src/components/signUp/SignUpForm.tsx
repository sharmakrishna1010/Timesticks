import React, { useState } from 'react';
import type { ChangeEvent, SubmitEvent } from 'react';

export default function SignUpForm() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState<boolean>(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
  const isPasswordStrong = formData.password.length >= 6 && /[A-Za-z]/.test(formData.password) && /[0-9]/.test(formData.password);

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isEmailValid && isPasswordStrong) {
      console.log('Form submitted for Timesticks:', formData);
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] w-full max-w-sm">
      <h2 className="text-2xl font-bold font-montserrat text-gray-900 mb-6 text-center">
        Sign Up
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Full Name"
            className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
            required
          />
        </div>

        <div>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            className={`w-full px-4 py-3 rounded-lg border bg-gray-50 text-sm focus:outline-none focus:ring-2 transition-all ${
              formData.email.length > 0 && !isEmailValid
                ? 'border-red-500 focus:border-red-500 focus:ring-red-100'
                : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'
            }`}
            required
          />
          {formData.email.length > 0 && !isEmailValid && (
            <p className="text-xs text-red-500 mt-1 pl-1">Please enter a valid email address.</p>
          )}
        </div>

        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password: 6-64 chars & 1 number"
            className={`w-full px-4 py-3 rounded-lg border bg-gray-50 text-sm focus:outline-none focus:ring-2 transition-all pr-12 ${
              formData.password.length > 0 && !isPasswordStrong
                ? 'border-red-500 focus:border-red-500 focus:ring-red-100'
                : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'
            }`}
            required
            minLength={6}
            maxLength={64}
          />
          
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            {showPassword ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>
                <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path>
                <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path>
                <line x1="2" y1="2" x2="22" y2="22"></line>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            )}
          </button>
          
          {formData.password.length > 0 && !isPasswordStrong && (
            <p className="text-xs text-red-500 mt-1 pl-1">
              Must be 6+ chars with at least one letter and one number.
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={!isEmailValid || !isPasswordStrong}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-medium py-3 rounded-lg transition-colors mt-2 cursor-pointer disabled:cursor-not-allowed"
        >
          Sign Up
        </button>
      </form>

      <p className="text-[11px] text-gray-500 mt-6 text-center leading-relaxed">
        By signing up, you agree to our{' '}
        <a href="#" className="text-gray-700 underline hover:text-gray-900">
          Terms of Service
        </a>{' '}
        and{' '}
        <a href="#" className="text-gray-700 underline hover:text-gray-900">
          Privacy Policy
        </a>.
      </p>
    </div>
  );
}