/**
 * Real-time system initialization plugin
 */
import { useRealtimeStore } from '@/stores/realtimeStore.js'

export default {
  install(app) {
    // Initialize real-time store when app starts
    const realtimeStore = useRealtimeStore()
    
    // Initialize connection and sync
    realtimeStore.initialize()
    
    // Global error handler for real-time operations
    window.addEventListener('realtime-error', (event) => {
      const { title, message } = event.detail
      
      // Create a global notification system
      console.error(`Real-time Error: ${title}`, message)
      
      // You can integrate with your notification system here
      // For example, with Vuetify's snackbar or a toast library
      app.config.globalProperties.$notify?.({
        type: 'error',
        title,
        message
      })
    })
    
    // Make realtime store available globally
    app.config.globalProperties.$realtime = realtimeStore
    app.provide('realtime', realtimeStore)
  }
}