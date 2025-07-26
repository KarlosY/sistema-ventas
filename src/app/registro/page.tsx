'use client';

import RegistrationForm from '@/components/RegistrationForm';

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
      <div className="max-w-md w-full mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Registrar Nuevo Usuario</h1>
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <RegistrationForm />
        </div>
      </div>
    </div>
  );
}
