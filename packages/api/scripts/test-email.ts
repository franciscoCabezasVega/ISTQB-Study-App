#!/usr/bin/env node

/**
 * Script para probar el envío de emails con EmailJS
 * 
 * Uso:
 *   npm run test:email your-email@example.com
 */

import dotenv from 'dotenv';
import emailjs from '@emailjs/nodejs';

dotenv.config();

async function testEmail() {
  const email = process.argv[2];
  
  if (!email) {
    console.error('❌ Error: Debes proporcionar un email');
    console.log('\nUso:');
    console.log('  npm run test:email your-email@example.com\n');
    process.exit(1);
  }

  // Validar formato de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    console.error('❌ Error: Email inválido');
    process.exit(1);
  }

  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║     📧 EmailJS Test                                    ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  console.log(`Enviando email de prueba a: ${email}\n`);

  const serviceId = process.env.EMAILJS_SERVICE_ID;
  const templateId = process.env.EMAILJS_TEMPLATE_ID;
  const publicKey = process.env.EMAILJS_PUBLIC_KEY;
  const privateKey = process.env.EMAILJS_PRIVATE_KEY;

  if (!serviceId || !templateId || !publicKey || !privateKey) {
    console.error('❌ Error: Configuración de EmailJS incompleta');
    console.error('   Asegúrate de configurar en .env:');
    console.error('   - EMAILJS_SERVICE_ID');
    console.error('   - EMAILJS_TEMPLATE_ID');
    console.error('   - EMAILJS_PUBLIC_KEY');
    console.error('   - EMAILJS_PRIVATE_KEY\n');
    process.exit(1);
  }

  try {
    const appUrl = process.env.APP_URL || 'http://localhost:3000';
    
    // Probar en español
    console.log('📤 Enviando email en ESPAÑOL...');
    
    const messagesEs = {
      greeting: '¡Hola Usuario de Prueba!',
      title: '⏰ Es hora de estudiar',
      message: 'Este es tu recordatorio para continuar con tu preparación para la certificación ISTQB Foundation Level.',
      tip: 'Consejo del día',
      tipText: 'La consistencia es clave. Estudiar 15-30 minutos diarios es más efectivo que sesiones largas ocasionales.',
      cta: 'Comenzar sesión de estudio',
      footer: 'Recibiste este email porque configuraste recordatorios de estudio en ISTQB Study App.',
      unsubscribe: 'Gestionar recordatorios',
      closingMessage: '¡Sigue así! Cada sesión te acerca más a tu certificación.',
      subject: '⏰ ¡Es hora de estudiar para tu certificación ISTQB!',
    };

    const templateDataEs = {
      to_email: email,
      user_name: 'Usuario de Prueba',
      language: 'es',
      app_url: appUrl,
      greeting: messagesEs.greeting,
      title: messagesEs.title,
      message: messagesEs.message,
      tip: messagesEs.tip,
      tip_text: messagesEs.tipText, // Conversión de camelCase a snake_case
      cta: messagesEs.cta,
      footer: messagesEs.footer,
      unsubscribe: messagesEs.unsubscribe,
      closing_message: messagesEs.closingMessage,
      subject: messagesEs.subject,
    };

    console.log(`📋 Variables enviadas:`);
    console.log(`   - tip: "${templateDataEs.tip}"`);
    console.log(`   - tip_text: "${templateDataEs.tip_text}"`);

    const responseEs = await emailjs.send(
      serviceId,
      templateId,
      templateDataEs,
      {
        publicKey: publicKey,
        privateKey: privateKey,
      }
    );

    console.log(`✅ Email en español enviado exitosamente`);
    console.log(`   Response: ${responseEs.status} - ${responseEs.text}\n`);

    // Esperar 2 segundos
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Probar en inglés
    console.log('📤 Enviando email en INGLÉS...');
    
    const messagesEn = {
      greeting: 'Hi Test User!',
      title: '⏰ Time to study',
      message: 'This is your reminder to continue preparing for your ISTQB Foundation Level certification.',
      tip: 'Daily tip',
      tipText: 'Consistency is key. Studying 15-30 minutes daily is more effective than occasional long sessions.',
      cta: 'Start study session',
      footer: 'You received this email because you configured study reminders in ISTQB Study App.',
      unsubscribe: 'Manage reminders',
      closingMessage: 'Keep going! Each session brings you closer to your certification.',
      subject: '⏰ Time to study for your ISTQB certification!',
    };

    const templateDataEn = {
      to_email: email,
      user_name: 'Test User',
      language: 'en',
      app_url: appUrl,
      greeting: messagesEn.greeting,
      title: messagesEn.title,
      message: messagesEn.message,
      tip: messagesEn.tip,
      tip_text: messagesEn.tipText,
      cta: messagesEn.cta,
      footer: messagesEn.footer,
      unsubscribe: messagesEn.unsubscribe,
      closing_message: messagesEn.closingMessage,
      subject: messagesEn.subject,
    };

    const responseEn = await emailjs.send(
      serviceId,
      templateId,
      templateDataEn,
      {
        publicKey: publicKey,
        privateKey: privateKey,
      }
    );

    console.log(`✅ Email en inglés enviado exitosamente`);
    console.log(`   Response: ${responseEn.status} - ${responseEn.text}\n`);

    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║     ✅ Test completado                                 ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');
    
    console.log('📬 Revisa tu bandeja de entrada (y spam) para ver los emails.\n');

    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error durante el test:', error);
    process.exit(1);
  }
}

// Ejecutar test
testEmail();
