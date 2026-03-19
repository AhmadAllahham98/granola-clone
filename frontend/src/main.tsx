import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.tsx'
import './index.css'

// TanStack Query client — configure global defaults here if needed
// e.g. staleTime, retry count, error boundaries
const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* BrowserRouter: enables client-side routing via react-router-dom */}
    <BrowserRouter>
      {/* QueryClientProvider: makes the query client available to all child components */}
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>,
)
