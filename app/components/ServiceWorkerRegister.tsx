'use client';

import { useEffect } from 'react';
import { registerServiceWorker } from '../serviceWorkerRegistration';

export default function ServiceWorkerRegister() {
  useEffect(() => {
    registerServiceWorker();
  }, []);

  return null;
} 