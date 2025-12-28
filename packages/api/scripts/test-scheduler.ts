#!/usr/bin/env node

/**
 * Script de prueba para el Reminder Scheduler
 * 
 * Uso:
 *   npm run test:scheduler
 * 
 * Este script simula la ejecución del scheduler y muestra
 * qué recordatorios se enviarían en este momento.
 */

import ReminderSchedulerService from '../src/services/ReminderSchedulerService';
import { ReminderUtils } from '../src/services/ReminderUtils';

async function testScheduler() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║     🧪 Reminder Scheduler Test                         ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  try {
    // 1. Obtener estadísticas
    console.log('📊 Getting scheduler statistics...\n');
    const stats = await ReminderSchedulerService.getReminderStats();
    
    console.log('Statistics:');
    console.log(`  Total active reminders: ${stats.totalActive}`);
    console.log(`  By frequency:`);
    console.log(`    - Daily: ${stats.byFrequency.daily}`);
    console.log(`    - Weekly: ${stats.byFrequency.weekly}`);
    console.log(`    - Custom: ${stats.byFrequency.custom}`);
    console.log(`  Would send now: ${stats.nextBatch}\n`);

    // 2. Ejecutar procesamiento
    console.log('🚀 Processing reminders...\n');
    console.log('─'.repeat(60));
    
    const result = await ReminderSchedulerService.processReminders();
    
    console.log('─'.repeat(60));
    console.log('\n✅ Test completed!\n');

    // 3. Mostrar resultados
    console.log('Results:');
    console.log(`  ✅ Successfully sent: ${result.sent}`);
    console.log(`  ⏭️  Skipped: ${result.skipped}`);
    console.log(`  ❌ Failed: ${result.failed}`);
    console.log(`  📋 Total processed: ${result.processed}\n`);

    if (result.errors.length > 0) {
      console.log('⚠️  Errors:');
      result.errors.forEach(err => console.log(`    - ${err}`));
      console.log();
    }

    // 4. Ejemplos de uso de ReminderUtils
    console.log('📚 Testing ReminderUtils...\n');
    
    const exampleReminder = {
      id: 'test-123',
      user_id: 'user-123',
      frequency: 'custom' as const,
      preferred_time: '09:00',
      enabled: true,
      custom_days: [1, 3, 5], // Lun, Mie, Vie
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const timezone = 'America/Mexico_City';
    const today = new Date();
    const dayOfWeek = today.getDay();
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];

    console.log('Example Reminder:');
    console.log(`  Frequency: ${exampleReminder.frequency}`);
    console.log(`  Custom days: ${ReminderUtils.formatCustomDays(exampleReminder.custom_days!, 'es')}`);
    console.log(`  Preferred time: ${exampleReminder.preferred_time}`);
    console.log(`  Timezone: ${timezone}`);
    console.log(`  Today: ${dayNames[dayOfWeek]} (${dayOfWeek})\n`);

    const shouldSend = ReminderUtils.shouldSendToday(exampleReminder, timezone);
    const isTime = ReminderUtils.isTimeToSend(exampleReminder, timezone);
    const nextDate = ReminderUtils.getNextSendDate(exampleReminder, timezone);

    console.log('Evaluation:');
    console.log(`  Should send today? ${shouldSend ? '✅ Yes' : '❌ No'}`);
    console.log(`  Is it time now? ${isTime ? '✅ Yes' : '❌ No'}`);
    console.log(`  Next send date: ${nextDate?.toLocaleString('es-MX', { timeZone: timezone })}\n`);

    // Validación
    const validation = ReminderUtils.validateReminderConfig(exampleReminder);
    console.log('Validation:');
    console.log(`  Valid? ${validation.valid ? '✅ Yes' : '❌ No'}`);
    if (!validation.valid) {
      console.log(`  Errors:`, validation.errors);
    }

    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║     ✅ All tests completed successfully!               ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');

    process.exit(0);

  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

// Ejecutar test
testScheduler();
