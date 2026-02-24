#!/usr/bin/env node

/**
 * Script de instalación completa del sistema de notificaciones EmailJS
 * Instala dependencias, configura archivos y prepara el sistema
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Instalador del Sistema de Notificaciones EmailJS');
console.log('==================================================\n');

// Verificar si estamos en un proyecto React
const packagePath = path.join(__dirname, 'package.json');
if (!fs.existsSync(packagePath)) {
  console.log('❌ No se encontró package.json');
  console.log('Ejecuta este script desde la raíz de tu proyecto React.');
  process.exit(1);
}

const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

// Verificar si es un proyecto React
if (!packageJson.dependencies || !packageJson.dependencies.react) {
  console.log('⚠️  Este no parece ser un proyecto React');
  console.log('El script continuará, pero verifica que sea correcto.');
}

console.log(`📦 Proyecto: ${packageJson.name}`);
console.log(`📋 Versión: ${packageJson.version}\n`);

// 1. Verificar/instalar dependencia EmailJS
console.log('1️⃣ Verificando dependencia @emailjs/browser...');
if (!packageJson.dependencies || !packageJson.dependencies['@emailjs/browser']) {
  console.log('📦 Instalando @emailjs/browser...');
  try {
    execSync('npm install @emailjs/browser', { stdio: 'inherit' });
    console.log('✅ @emailjs/browser instalado correctamente');
  } catch (error) {
    console.log('❌ Error instalando @emailjs/browser:', error.message);
    process.exit(1);
  }
} else {
  console.log('✅ @emailjs/browser ya está instalado');
}

// 2. Verificar archivos del sistema
console.log('\n2️⃣ Verificando archivos del sistema...');
const systemFiles = [
  'src/config/emailConfig.js',
  'src/services/emailNotificationService.js', 
  'src/hooks/useEmailNotifications.js',
  'src/components/EmailNotificationSettings.js',
  'src/pages/NotificationAdminPage.js',
  'docs/EMAIL_NOTIFICATIONS_GUIDE.md'
];

let missingFiles = 0;
systemFiles.forEach(filePath => {
  const fullPath = path.join(__dirname, filePath);
  if (fs.existsSync(fullPath)) {
    console.log(`   ✅ ${filePath}`);
  } else {
    console.log(`   ❌ ${filePath} - FALTANTE`);
    missingFiles++;
  }
});

if (missingFiles > 0) {
  console.log(`\n⚠️  ${missingFiles} archivos del sistema están faltantes.`);
  console.log('El sistema puede no funcionar correctamente.');
}

// 3. Configurar archivo .env
console.log('\n3️⃣ Configurando archivo .env...');
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, '.env.example');

if (!fs.existsSync(envPath)) {
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ Archivo .env creado desde .env.example');
  } else {
    // Crear .env básico
    const envContent = `# Configuración de EmailJS
REACT_APP_EMAILJS_SERVICE_ID=
REACT_APP_EMAILJS_TEMPLATE_ID=
REACT_APP_EMAILJS_PUBLIC_KEY=
REACT_APP_SITE_URL=https://costaricacc-planos.web.app
REACT_APP_DEBUG_EMAILS=false
`;
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Archivo .env creado con configuración básica');
  }
} else {
  console.log('✅ Archivo .env ya existe');
}

// 4. Verificar rutas en AppRoutes.js
console.log('\n4️⃣ Verificando configuración de rutas...');
const appRoutesPath = path.join(__dirname, 'src/routes/AppRoutes.js');
if (fs.existsSync(appRoutesPath)) {
  const routesContent = fs.readFileSync(appRoutesPath, 'utf8');
  if (routesContent.includes('/admin/notifications')) {
    console.log('✅ Ruta /admin/notifications configurada');
  } else {
    console.log('⚠️  Ruta /admin/notifications no encontrada en AppRoutes.js');
  }
} else {
  console.log('⚠️  No se encontró src/routes/AppRoutes.js');
}

// 5. Verificar navegación
console.log('\n5️⃣ Verificando navegación...');
const navbarPath = path.join(__dirname, 'src/components/Navbar.js');
const sidebarPath = path.join(__dirname, 'src/components/Sidebar.js');

if (fs.existsSync(navbarPath)) {
  const navbarContent = fs.readFileSync(navbarPath, 'utf8');
  if (navbarContent.includes('Notificaciones')) {
    console.log('✅ Enlaces de navegación en Navbar');
  } else {
    console.log('⚠️  Enlaces de notificaciones no encontrados en Navbar');
  }
} else {
  console.log('⚠️  No se encontró src/components/Navbar.js');
}

if (fs.existsSync(sidebarPath)) {
  const sidebarContent = fs.readFileSync(sidebarPath, 'utf8');
  if (sidebarContent.includes('Notificaciones')) {
    console.log('✅ Enlaces de navegación en Sidebar');
  } else {
    console.log('⚠️  Enlaces de notificaciones no encontrados en Sidebar');
  }
} else {
  console.log('⚠️  No se encontró src/components/Sidebar.js');
}

// Resumen final
console.log('\n📋 Resumen de Instalación');
console.log('========================');
console.log('✅ Dependencia @emailjs/browser instalada');
console.log('✅ Archivo .env configurado');
console.log('✅ Scripts de configuración listos');

console.log('\n🔧 Próximos pasos:');
console.log('1. Ejecuta: node setup-emailjs.js');
console.log('2. Configura tus credenciales de EmailJS');
console.log('3. Ejecuta: node test-emailjs.js');
console.log('4. Reinicia tu aplicación: npm start');
console.log('5. Accede a /admin/notifications');

console.log('\n📖 Documentación: docs/EMAIL_NOTIFICATIONS_GUIDE.md');
console.log('🎉 ¡Sistema de notificaciones listo para configurar!');
