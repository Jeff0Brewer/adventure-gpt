import React from 'react'
import { createRoot } from 'react-dom/client'
import 'core-js/stable'
import App from './comp/app'
import './style/globals.css'

const container = document.getElementById('root')
if (container) {
    const root = createRoot(container)
    root.render(<App />)
} else {
    console.error('Element with id \'root\' must exist in index.html')
}
