import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnMount: 'stale',
      retry: 1,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <App />
            <Toaster
              position="bottom-right"
              toastOptions={{
                style: {
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '13.5px',
                  borderRadius: '8px',
                  boxShadow: 'var(--shadow-pop)',
                  padding: '10px 12px',
                },
                success: { iconTheme: { primary: 'var(--positive)', secondary: 'var(--surface)' } },
                error:   { iconTheme: { primary: 'var(--negative)', secondary: 'var(--surface)' } },
              }}
            />
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
)
