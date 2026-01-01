// Script para generar hash de contraseña con bcrypt
const bcrypt = require('bcryptjs');

async function generateHash() {
  const password = 'admin123';
  const hash = await bcrypt.hash(password, 12);
  
  console.log('='.repeat(60));
  console.log('Hash generado para la contraseña: admin123');
  console.log('='.repeat(60));
  console.log(hash);
  console.log('='.repeat(60));
  
  // Verificar que el hash funciona
  const isValid = await bcrypt.compare('admin123', hash);
  console.log('Verificación:', isValid ? '✅ CORRECTO' : '❌ ERROR');
  console.log('='.repeat(60));
  
  console.log('\nEjecuta este query en MySQL:');
  console.log(`
UPDATE users 
SET password = '${hash}',
    failed_login_attempts = 0,
    locked_until = NULL
WHERE email = 'admin@sistema.com';
  `);
}

generateHash().catch(console.error);
