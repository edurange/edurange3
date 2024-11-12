import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Editor_Controller from './Editor_Controller.jsx'

createRoot(document.getElementById('editor-root')).render(
  <StrictMode>
    <Editor_Controller />
  </StrictMode>,
)
