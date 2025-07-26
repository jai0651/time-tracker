import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Theme } from '@radix-ui/themes'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Theme appearance="light" accentColor="indigo">
      <App />
    </Theme>
  </StrictMode>,
)
