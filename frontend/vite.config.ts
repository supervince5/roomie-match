import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  if (command === 'build') {
    const endpoint = process.env.VITE_API_URL || env.VITE_API_URL
    if (!endpoint || !URL.canParse(endpoint)) {
      throw new Error('Set VITE_API_URL to the backend URL before building for hosting.')
    }
  }
  return { plugins: [react()] }
})
