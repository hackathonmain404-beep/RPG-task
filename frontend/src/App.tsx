import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { QuestsProvider } from './context/QuestsContext';
import { ShopProvider } from './context/ShopContext';
import { ThemeProvider } from './context/ThemeProvider';
import { NotificationProvider } from './context/NotificationContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { AppRoutes } from './app/routes';

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <ThemeProvider>
            <QuestsProvider>
              <ShopProvider>
                <NotificationProvider>
                  <AppRoutes />
                </NotificationProvider>
              </ShopProvider>
            </QuestsProvider>
          </ThemeProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;
