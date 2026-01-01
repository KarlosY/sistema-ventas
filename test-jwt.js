// Script de diagnóstico para verificar JWT
const fs = require('fs');
const jwt = require('jsonwebtoken');

// Leer .env.local manualmente
const envPath = '.env.local';
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  });
}

console.log('='.repeat(60));
console.log('DIAGNÓSTICO DE JWT');
console.log('='.repeat(60));

// Verificar variables de entorno
console.log('\n1. Variables de entorno:');
console.log('   JWT_SECRET:', process.env.JWT_SECRET || 'NO DEFINIDO');
console.log('   JWT_EXPIRES_IN:', process.env.JWT_EXPIRES_IN || 'NO DEFINIDO');

// Crear un token de prueba
const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret-in-production';
const testPayload = {
  userId: 'test-123',
  email: 'test@test.com',
  role: 'Administrador',
  fullName: 'Test User'
};

console.log('\n2. Creando token de prueba...');
const token = jwt.sign(testPayload, JWT_SECRET, { expiresIn: '7d' });
console.log('   Token creado:', token.substring(0, 50) + '...');

// Intentar verificar el token
console.log('\n3. Verificando token...');
try {
  const decoded = jwt.verify(token, JWT_SECRET);
  console.log('   ✅ Token verificado correctamente');
  console.log('   Payload:', decoded);
} catch (error) {
  console.log('   ❌ Error al verificar token:', error.message);
}

// Verificar con el secreto por defecto
console.log('\n4. Verificando con secreto por defecto...');
try {
  const decoded = jwt.verify(token, 'change-this-secret-in-production');
  console.log('   ✅ Token verificado con secreto por defecto');
} catch (error) {
  console.log('   ❌ Error con secreto por defecto:', error.message);
}

console.log('\n' + '='.repeat(60));
console.log('CONCLUSIÓN:');
if (process.env.JWT_SECRET) {
  console.log('✅ JWT_SECRET está definido en .env.local');
  console.log('   Valor: ' + process.env.JWT_SECRET);
} else {
  console.log('❌ JWT_SECRET NO está definido en .env.local');
  console.log('   Se está usando el valor por defecto');
}
console.log('='.repeat(60));
