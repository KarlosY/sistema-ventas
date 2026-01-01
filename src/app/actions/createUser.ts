'use server';

import { register } from '@/infrastructure/auth/jwt';

export async function createUser(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const fullName = formData.get('fullName') as string || email.split('@')[0];

  if (!email || !password) {
    return { error: { message: 'Email y contraseña son requeridos.' } };
  }

  if (password.length < 6) {
    return { error: { message: 'La contraseña debe tener al menos 6 caracteres.' } };
  }

  try {
    const result = await register(email, password, fullName);
    return { data: result };
  } catch (error: any) {
    return { error: { message: error.message } };
  }
}
