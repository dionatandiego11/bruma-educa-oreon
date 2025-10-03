
import React, { useState, useCallback, createContext, useContext, ReactNode } from 'react';

type NotificationType = 'success' | 'error';

interface NotificationState {
  message: string;
  type: NotificationType;
}

interface NotificationContextType {
  notification: NotificationState | null;
  showNotification: (message: string, type?: NotificationType) => void;
  hideNotification: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notification, setNotification] = useState<NotificationState | null>(null);
  const [timeoutId, setTimeoutId] = useState<ReturnType<typeof setTimeout> | null>(null);

  const hideNotification = useCallback(() => {
    if (timeoutId) {
        clearTimeout(timeoutId);
    }
    setNotification(null);
    setTimeoutId(null);
  }, [timeoutId]);

  const showNotification = useCallback((message: string, type: NotificationType = 'success') => {
    if (timeoutId) {
        clearTimeout(timeoutId);
    }
    setNotification({ message, type });
    const newTimeoutId = setTimeout(() => {
        setNotification(null);
    }, 4000);
    setTimeoutId(newTimeoutId);
  }, [timeoutId]);

  const value = { notification, showNotification, hideNotification };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
