'use server';

import { createClient } from '@supabase/supabase-js';

export async function createUser(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  // Para acciones de admin, usamos el cliente estándar de Supabase con la service_role key
  // Esto nos da privilegios de super-administrador para crear usuarios.
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  if (!email || !password) {
    return { error: { message: 'Email y contraseña son requeridos.' } };
  }

  if (password.length < 6) {
    return { error: { message: 'La contraseña debe tener al menos 6 caracteres.' } };
  }

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Lo creamos como confirmado ya que es un admin
  });

  if (error) {
    return { error: { message: error.message } };
  }

  // El trigger en la base de datos se encargará de crear el perfil con rol 'Vendedor'
  return { data };
}
