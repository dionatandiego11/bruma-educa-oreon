
import React from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';
import { useNotification } from '../hooks/useNotification';

const Notification: React.FC = () => {
  const { notification, hideNotification } = useNotification();

  if (!notification) {
    return null;
  }

  const isSuccess = notification.type === 'success';
  const bgColor = isSuccess ? 'bg-green-500' : 'bg-red-500';
  const Icon = isSuccess ? CheckCircle : AlertCircle;

  return (
    <div
      className={`fixed top-5 right-5 z-50 p-4 rounded-lg shadow-2xl flex items-center gap-3 text-white transition-transform transform-gpu animate-fade-in-down ${bgColor}`}
    >
      <Icon size={24} />
      <span className="font-medium">{notification.message}</span>
       <button onClick={hideNotification} className="p-1 rounded-full hover:bg-white/20 transition-colors">
        <X size={18} />
      </button>
    </div>
  );
};

export default Notification;
