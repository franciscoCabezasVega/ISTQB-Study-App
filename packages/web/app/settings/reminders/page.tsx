'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { CardSkeleton } from '@/components/Skeleton';
import { NotificationPermission } from '@/components/NotificationPermission';
import { Toast, ToastType } from '@/components/Toast';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/lib/store/authStore';
import { StudyReminder } from '@istqb-app/shared';
import { useTranslation } from '@/lib/useTranslation';
import { notificationScheduler } from '@/lib/notificationScheduler';
import { useNotifications } from '@/lib/hooks/useNotifications';
import Link from 'next/link';

export default function RemindersSettingsPage() {
  const { user } = useAuthStore();
  const { t } = useTranslation();
  useNotifications(); // Hook para acceder a funcionalidad de notificaciones
  const [reminder, setReminder] = useState<StudyReminder | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'custom'>('custom');
  const [preferredTime, setPreferredTime] = useState('09:00');
  const [enabled, setEnabled] = useState(false);
  const [customDays, setCustomDays] = useState<number[]>([]);

  // Array de días de la semana empezando por lunes (1 = Lunes, ..., 6 = Sábado, 0 = Domingo)
  const daysOfWeek = [
    { value: 1, key: 'monday' },
    { value: 2, key: 'tuesday' },
    { value: 3, key: 'wednesday' },
    { value: 4, key: 'thursday' },
    { value: 5, key: 'friday' },
    { value: 6, key: 'saturday' },
    { value: 0, key: 'sunday' },
  ];

  useEffect(() => {
    loadReminder();
  }, []);

  // Detectar cambios en el formulario
  useEffect(() => {
    if (!reminder || loading) {
      setHasUnsavedChanges(false);
      return;
    }

    const hasChanges = 
      preferredTime !== (reminder.preferred_time || '09:00') ||
      enabled !== reminder.enabled ||
      JSON.stringify([...customDays].sort()) !== JSON.stringify([...(reminder.custom_days || [])].sort());

    setHasUnsavedChanges(hasChanges);
  }, [preferredTime, enabled, customDays, reminder, loading]);

  // Alerta al intentar salir con cambios sin guardar
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  const loadReminder = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getReminder();
      const reminderData = response.data.data;

      if (reminderData) {
        setReminder(reminderData);
        // Siempre usar 'custom' como frecuencia
        setFrequency('custom');
        setPreferredTime(reminderData.preferred_time || '09:00');
        setEnabled(reminderData.enabled);
        setCustomDays(reminderData.custom_days || []);
      } else {
        // Si no hay reminder previo, crear un objeto inicial para comparación
        const initialReminder: StudyReminder = {
          id: '',
          user_id: user?.id || '',
          frequency: 'custom',
          preferred_time: '09:00',
          enabled: false,
          custom_days: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setReminder(initialReminder);
      }
    } catch (error) {
      console.error('Error loading reminder:', error);
      // En caso de error, también crear un objeto inicial
      const initialReminder: StudyReminder = {
        id: '',
        user_id: user?.id || '',
        frequency: 'custom',
        preferred_time: '09:00',
        enabled: false,
        custom_days: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setReminder(initialReminder);
    } finally {
      setLoading(false);
    }
  };

  const handleDayToggle = (day: number) => {
    setCustomDays((prev) => {
      if (prev.includes(day)) {
        return prev.filter((d) => d !== day);
      } else {
        return [...prev, day].sort((a, b) => a - b);
      }
    });
  };

  const handleSave = async () => {
    // Validar que haya al menos un día seleccionado si los recordatorios están habilitados
    if (enabled && customDays.length === 0) {
      alert(t('reminders.selectAtLeastOneDay'));
      return;
    }

    try {
      setSaving(true);
      const response = await apiClient.createOrUpdateReminder({
        frequency: 'custom', // Siempre usar custom
        preferredTime,
        enabled,
        customDays,
      });

      const savedReminder = response.data.data;
      setReminder(savedReminder);
      setHasUnsavedChanges(false);

      // Programar notificaciones locales si están habilitadas
      if (enabled) {
        scheduleLocalNotifications(savedReminder);
      } else {
        // Cancelar todas las notificaciones si se deshabilitan
        notificationScheduler.cancelAllNotifications();
      }

      alert(t('reminders.reminderSaved'));
    } catch (error: unknown) {
      console.error('Error saving reminder:', error);
      alert(t('reminders.errorSaving') + ': ' + ((error as any).response?.data?.error || (error as Error).message));
    } finally {
      setSaving(false);
    }
  };

  const scheduleLocalNotifications = (reminderData: StudyReminder) => {
    // Cancelar notificaciones anteriores
    notificationScheduler.cancelAllNotifications();

    const title = '🎓 ISTQB Study Reminder';
    const body = t('reminders.notificationBody') || '¡Es hora de estudiar! Mantén tu racha activa.';
    const time = reminderData.preferred_time || '09:00';

    // Siempre usar custom con los días seleccionados
    if (reminderData.custom_days && reminderData.custom_days.length > 0) {
      notificationScheduler.scheduleCustomReminder(reminderData.custom_days, time, title, body);
    }
  };

  const handleDiscardChanges = () => {
    if (!reminder) return;

    if (confirm(t('reminders.confirmDiscardChanges'))) {
      // Restaurar valores originales
      setFrequency('custom');
      setPreferredTime(reminder.preferred_time || '09:00');
      setEnabled(reminder.enabled);
      setCustomDays(reminder.custom_days || []);
      setHasUnsavedChanges(false);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <p className="text-center text-gray-600 dark:text-gray-400">
            {t('auth.pleaseSignIn')} <Link href="/auth/signin" className="text-blue-600 dark:text-blue-400 underline">{t('auth.signin')}</Link> {t('reminders.toConfigureReminders')}.
          </p>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">⏰ {t('reminders.title')}</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('reminders.subtitle')}
          </p>
        </div>
        <CardSkeleton />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">⏰ {t('reminders.title')}</h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t('reminders.subtitle')}
        </p>
      </div>

      {/* Toast flotante */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          duration={4000}
          onClose={() => setToast(null)}
        />
      )}

      {/* Componente de permisos de notificaciones */}
      <div className="mb-6">
        <NotificationPermission
          showTestButton={true}
          onPermissionGranted={() => {
            setToast({
              message: t('notifications.enabled') + '! ' + t('notifications.enabledDescription'),
              type: 'success',
            });
            // Si hay un recordatorio guardado, programar notificaciones
            if (reminder && reminder.enabled) {
              scheduleLocalNotifications(reminder);
            }
          }}
          onPermissionDenied={() => {
            setToast({
              message: t('notifications.blocked') + '. ' + t('notifications.blockedDescription'),
              type: 'error',
            });
          }}
        />
      </div>

      <Card>
        <div className="space-y-6">
          {/* Activar/Desactivar */}
          <div>
            <div 
              className="relative group"
              title={customDays.length === 0 ? t('reminders.selectAtLeastOneDay') : ''}
            >
              <label className={`flex items-center gap-3 ${customDays.length === 0 ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}>
                <input
                  type="checkbox"
                  checked={enabled}
                  disabled={customDays.length === 0}
                  onChange={(e) => {
                    setEnabled(e.target.checked);
                  }}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                />
                <span className="text-lg font-medium">{t('reminders.enableReminders')}</span>
              </label>
              {customDays.length === 0 && (
                <div className="absolute left-0 top-full mt-1 hidden group-hover:block z-10 bg-gray-900 text-white text-xs rounded py-1 px-2 max-w-xs">
                  {t('reminders.selectAtLeastOneDay')}
                </div>
              )}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 ml-8">
              {t('reminders.notificationDescription')}
            </p>
          </div>

          {/* Selector de días personalizados (siempre visible) */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <label className="block text-sm font-medium mb-3">
              {t('reminders.selectDays')}
            </label>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              {t('reminders.customDaysDescription')}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {daysOfWeek.map((day) => (
                <label
                  key={day.value}
                  className={`
                    flex items-center justify-center gap-2 px-4 py-3 rounded-lg border cursor-pointer transition-all
                    ${
                      customDays.includes(day.value)
                        ? 'bg-blue-100 dark:bg-blue-900 border-blue-500 dark:border-blue-400'
                        : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500'
                    }
                  `}
                >
                  <input
                    type="checkbox"
                    checked={customDays.includes(day.value)}
                    onChange={() => handleDayToggle(day.value)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm font-medium">
                    {t(`reminders.days.${day.key}`)}
                  </span>
                </label>
              ))}
            </div>
            {customDays.length === 0 && (
              <p className="text-sm text-amber-600 dark:text-amber-400 mt-3 flex items-center gap-2">
                <span>⚠️</span>
                <span>{t('reminders.selectAtLeastOneDay')}</span>
              </p>
            )}
          </div>

          {/* Hora preferida */}
          <div>
            <label htmlFor="time" className="block text-sm font-medium mb-2">
              {t('reminders.preferredTime')}
            </label>
            <input
              type="time"
              id="time"
              value={preferredTime}
              onChange={(e) => setPreferredTime(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {t('reminders.timeDescription')}
            </p>
          </div>

          {/* Alerta de cambios sin guardar */}
          {hasUnsavedChanges && (
            <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
              <div className="flex items-start gap-3">
                <span className="text-xl">⚠️</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                    {t('reminders.unsavedChanges')}
                  </p>
                  <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                    {t('reminders.unsavedChangesDescription')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button 
              onClick={handleSave} 
              disabled={saving || !hasUnsavedChanges} 
              className="flex-1"
            >
              {saving ? t('reminders.saving') : t('reminders.saveChanges')}
            </Button>
            {hasUnsavedChanges && (
              <Button
                onClick={handleDiscardChanges}
                variant="secondary"
                disabled={saving}
              >
                {t('reminders.discardChanges')}
              </Button>
            )}
          </div>

          {/* Nota sobre notificaciones */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>{t('reminders.pushNote')}</strong> {t('reminders.pushNoteText')}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
