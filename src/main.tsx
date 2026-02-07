import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Auth0Provider } from "@auth0/auth0-react";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* According to auth0 engineering team, this is not secret info */}
    <Auth0Provider
      domain="dev-qej8q8mxnj6ayai2.us.auth0.com"
      clientId="YUOtxCEwbYpQdFJoG40bWbbXfy3ZoMsq"
      authorizationParams={{ redirect_uri: window.location.origin }}>
      <App />
    </Auth0Provider>
    
  </StrictMode>,
)
