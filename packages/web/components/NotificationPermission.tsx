'use client';

import React, { useEffect, useState } from 'react';
import { useNotifications } from '@/lib/hooks/useNotifications';
import { useTranslation } from '@/lib/useTranslation';
import { Card } from './Card';
import { Button } from './Button';

interface NotificationPermissionProps {
  onPermissionGranted?: () => void;
  onPermissionDenied?: () => void;
  autoRequest?: boolean;
  showTestButton?: boolean;
}

/**
 * Componente para solicitar permisos de notificaciones
 * Muestra el estado actual y permite solicitar permisos o probar notificaciones
 */
export function NotificationPermission({
  onPermissionGranted,
  onPermissionDenied,
  autoRequest = false,
  showTestButton = false,
}: NotificationPermissionProps) {
  const { permission, isSupported, requestPermission } = useNotifications();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (autoRequest && permission === 'default' && isSupported) {
      handleRequestPermission();
    }
  }, [autoRequest, permission, isSupported]);

  const handleRequestPermission = async () => {
    setLoading(true);
    try {
      const granted = await requestPermission();
      if (granted && onPermissionGranted) {
        onPermissionGranted();
      } else if (!granted && onPermissionDenied) {
        onPermissionDenied();
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
    } finally {
      setLoading(false);
    }
  };

  // No mostrar nada si no están soportadas
  if (!isSupported) {
    return (
      <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
        <div className="flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
              {t('notifications.notSupported')}
            </h3>
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              {t('notifications.notSupportedDescription')}
            </p>
          </div>
        </div>
      </Card>
    );
  }

  // Permiso denegado
  if (permission === 'denied') {
    return (
      <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
        <div className="flex items-start gap-3">
          <span className="text-2xl">🔕</span>
          <div>
            <h3 className="font-semibold text-red-900 dark:text-red-100 mb-1">
              {t('notifications.blocked')}
            </h3>
            <p className="text-sm text-red-800 dark:text-red-200 mb-3">
              {t('notifications.blockedDescription')}
            </p>
            <div className="text-xs text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/30 p-2 rounded">
              <strong>{t('notifications.instructions')}</strong>
              <ul className="list-disc ml-4 mt-1 space-y-1">
                <li>{t('notifications.instructionChrome')}</li>
                <li>{t('notifications.instructionFirefox')}</li>
                <li>{t('notifications.instructionEdge')}</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Permiso concedido - No mostrar nada, el padre manejará el toast
  if (permission === 'granted') {
    return null;
  }

  // Permiso por defecto (solicitar)
  return (
    <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
      <div className="flex items-start gap-3">
        <span className="text-2xl">🔔</span>
        <div className="flex-1">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
            {t('notifications.enableTitle')}
          </h3>
          <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
            {t('notifications.enableDescription')}
          </p>
          <Button
            onClick={handleRequestPermission}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading ? t('notifications.requesting') : t('notifications.enableButton')}
          </Button>
        </div>
      </div>
    </Card>
  );
}
