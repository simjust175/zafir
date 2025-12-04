/* eslint-disable no-case-declarations */
/**
 * Real-time Store System with Optimistic Updates
 * Handles instant UI updates with server validation and conflict resolution
 */
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import socket from '@/socket.js'

export const useRealtimeStore = defineStore('realtime', () => {
  // Central state - Use reactive Maps directly (not wrapped in ref)
  const projectsMap = new Map()
  const invoicesMap = new Map()
  const paymentsMap = new Map()

  // Counter to trigger reactivity when Maps change
  const updateCounter = ref(0)

  const pendingOperations = ref(new Map()) // Track optimistic updates
  const lastEventVersion = ref(0)
  const connectionState = ref('connected')
  const conflictQueue = ref([])

  // Helper to access entity maps (handles both singular and plural forms)
  const getEntityMap = (entityType) => {
    const normalizedType = {
      // Plural forms
      'projects': projectsMap,
      'invoices': invoicesMap,
      'payments': paymentsMap,
      // Singular forms (server sends these)
      'project': projectsMap,
      'invoice': invoicesMap,
      'payment': paymentsMap
    }[entityType]

    if (!normalizedType) {
      console.warn(`⚠️ Unknown entity type: ${entityType}`)
      return new Map() // Return empty map to prevent crashes
    }

    return normalizedType
  }

  // Computed getters for reactive data
  const projects = computed(() => {
    updateCounter.value // Trigger reactivity
    return Array.from(projectsMap.values())
  })
  const invoices = computed(() => {
    updateCounter.value // Trigger reactivity
    return Array.from(invoicesMap.values())
  })
  const payments = computed(() => {
    updateCounter.value // Trigger reactivity
    return Array.from(paymentsMap.values())
  })

  /**
   * Generate unique operation ID for optimistic updates
   */
  const generateOpId = () => `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  /**
   * Apply optimistic update to local state
   */
  const applyOptimisticUpdate = (entityType, operation, data, opId) => {
    const entityMap = getEntityMap(entityType)
    const entityId = data.id || data.invoice_id || data.project_id || data.payment_id

    console.log(`🔮 Optimistic ${operation}: ${entityType}#${entityId}`)

    // CRITICAL: Capture original state BEFORE mutation for proper rollback
    const originalData = operation === 'create' ? null : structuredClone(entityMap.get(entityId))

    switch (operation) {
      case 'create':
        entityMap.set(entityId, { ...data, _optimistic: true, _opId: opId })
        break
      case 'update':
        const existing = entityMap.get(entityId)
        if (existing) {
          entityMap.set(entityId, { ...existing, ...data, _optimistic: true, _opId: opId })
        }
        break
      case 'delete':
        const toDelete = entityMap.get(entityId)
        if (toDelete) {
          entityMap.set(entityId, { ...toDelete, deleted_at: data.deleted_at, _optimistic: true, _opId: opId })
        }
        break
    }

    // Trigger reactivity
    updateCounter.value++

    // Store pending operation for rollback capability
    pendingOperations.value.set(opId, {
      opId, // CRITICAL: Include opId for proper rollback
      entityType,
      operation,
      entityId,
      originalData, // Now correctly captured BEFORE mutation
      tempId: operation === 'create' ? entityId : null, // Track temp IDs
      timestamp: Date.now()
    })
  }

  /**
   * Confirm optimistic update with server response
   */
  const confirmUpdate = (opId, serverData) => {
    const pending = pendingOperations.value.get(opId)
    if (!pending) return

    const { entityType, entityId, tempId, operation } = pending
    const entityMap = getEntityMap(entityType)

    // Handle creation confirmation: swap temp ID for real server ID
    if (operation === 'create' && tempId) {
      entityMap.delete(tempId) // Remove temp optimistic entry
      const realId = serverData.id || serverData.invoice_id || serverData.project_id || serverData.payment_id
      delete serverData._optimistic
      delete serverData._opId
      entityMap.set(realId, serverData)
    } else {
      // Handle update/delete confirmation
      const current = entityMap.get(entityId)
      if (current && current._opId === opId) {
        delete serverData._optimistic
        delete serverData._opId
        entityMap.set(entityId, serverData)
      }
    }

    // Trigger reactivity
    updateCounter.value++
    pendingOperations.value.delete(opId)
    console.log(`✅ Confirmed ${pending.operation}: ${entityType}#${entityId}`)
  }

  /**
   * Rollback failed optimistic update
   */
  const rollbackUpdate = (opId, error) => {
    const pending = pendingOperations.value.get(opId)
    if (!pending) return

    const { entityType, entityId, originalData, operation, tempId } = pending
    const entityMap = getEntityMap(entityType)

    console.log(`❌ Rolling back ${operation}: ${entityType}#${entityId}`, error)

    if (operation === 'create') {
      // Remove temp optimistic entry
      entityMap.delete(tempId || entityId)
    } else if (originalData) {
      // Restore exact pre-mutation state
      entityMap.set(entityId, structuredClone(originalData))
    } else {
      // Fallback: remove the corrupted entry
      entityMap.delete(entityId)
    }

    // Trigger reactivity
    updateCounter.value++
    pendingOperations.value.delete(opId)

    // Show user-friendly error notification
    showErrorNotification(`Failed to ${operation} ${entityType}`, error)
  }

  /**
   * Handle incoming real-time events from server
   */
  const handleRealtimeEvent = (event) => {
    const { entityType, operation, data, version, entityId } = event

    lastEventVersion.value = Math.max(lastEventVersion.value, version)

    console.log(`📡 Real-time event: ${operation} ${entityType}#${entityId}`)

    // CRITICAL: Use the entity type directly (server sends singular forms)
    const entityMap = getEntityMap(entityType)

    // Check if this contradicts a pending optimistic update  
    const pendingOp = Array.from(pendingOperations.value.values())
      .find(op => op.entityType === entityType && op.entityId === entityId)

    if (pendingOp) {
      // Potential conflict - queue for resolution
      conflictQueue.value.push({ event, pendingOp })
      return resolveConflict(event, pendingOp)
    }

    // Apply server event directly
    switch (operation) {
      case 'create':
        entityMap.set(entityId, data)
        break
      case 'update':
        const existing = entityMap.get(entityId)
        if (existing) {
          entityMap.set(entityId, { ...existing, ...data })
        }
        break
      case 'delete':
        entityMap.delete(entityId)
        break
    }

    // Trigger reactivity
    updateCounter.value++
  }

  /**
   * Resolve conflicts between optimistic updates and server events
   */
  const resolveConflict = (serverEvent, pendingOp) => {
    // Simple last-write-wins strategy
    // In production, you might want more sophisticated conflict resolution
    console.log(`⚠️ Conflict detected for ${pendingOp.entityType}#${pendingOp.entityId}`)

    // Server wins - confirm the pending operation as failed
    rollbackUpdate(pendingOp.opId, 'Overridden by server update')

    // Apply server event
    handleRealtimeEvent(serverEvent)
  }

  /**
   * Perform optimistic CRUD operations
   */
  const createEntity = async (entityType, data) => {
    const opId = generateOpId()
    const tempId = `temp_${opId}`

    // Apply optimistic update
    applyOptimisticUpdate(entityType, 'create', { ...data, id: tempId }, opId)

    try {
      // Send to server
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/invoice/post/${entityType}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!response.ok) throw new Error(`Server error: ${response.status}`)

      const result = await response.json()
      confirmUpdate(opId, result.newGeneral)

      return result.newGeneral
    } catch (error) {
      rollbackUpdate(opId, error.message)
      throw error
    }
  }

  const updateEntity = async (entityType, entityId, updates) => {
    const opId = generateOpId()

    // Apply optimistic update
    applyOptimisticUpdate(entityType, 'update', { ...updates, id: entityId }, opId)

    try {
      // Send to server
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/invoice/patch/${entityType}?id=${entityId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })

      if (!response.ok) throw new Error(`Server error: ${response.status}`)

      const result = await response.json()
      console.log("resuly in 🏪🏪🏪🏪🏪", result);

      confirmUpdate(opId, result.newGeneral)

      return result.newGeneral
    } catch (error) {
      rollbackUpdate(opId, error.message)
      throw error
    }
  }

  const deleteEntity = async (entityType, entityId) => {
    const opId = generateOpId()
    const deleted_at = new Date().toISOString()

    // Apply optimistic update
    applyOptimisticUpdate(entityType, 'delete', { id: entityId, deleted_at }, opId)

    try {
      // Send to server
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/invoice/patch/${entityType}?id=${entityId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deleted_at })
      })

      if (!response.ok) throw new Error(`Server error: ${response.status}`)

      const result = await response.json()
      confirmUpdate(opId, result.newGeneral)

      return result.newGeneral
    } catch (error) {
      rollbackUpdate(opId, error.message)
      throw error
    }
  }

  /**
   * Initialize data from server and setup real-time listeners
   */
  const initialize = async () => {
    try {
      // Load initial data
      await loadInitialData()

      // Setup socket listeners
      setupSocketListeners()

      // Request sync if we've been offline
      if (lastEventVersion.value > 0) {
        socket.emit('request-sync', lastEventVersion.value)
      }

      connectionState.value = 'connected'
    } catch (error) {
      console.error('Failed to initialize realtime store:', error)
      connectionState.value = 'error'
    }
  }

  const loadInitialData = async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    const response = await fetch(`${import.meta.env.VITE_BASE_URL}/invoice/get`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    })

    const data = await response.json()

    // Populate entity maps
    if (data.amounts) {
      data.amounts.forEach(invoice => {
        invoicesMap.set(invoice.invoice_id || invoice.id, invoice)
      })
      // Trigger reactivity
      updateCounter.value++
    }
  }

  const setupSocketListeners = () => {
    socket.on('data-change', handleRealtimeEvent)

    socket.on('sync-events', (events) => {
      console.log(`🔄 Syncing ${events.length} missed events`)
      events.forEach(handleRealtimeEvent)
    })

    socket.on('connect', () => {
      connectionState.value = 'connected'
      if (lastEventVersion.value > 0) {
        socket.emit('request-sync', lastEventVersion.value)
      }
    })

    socket.on('disconnect', () => {
      connectionState.value = 'disconnected'
    })
  }

  const showErrorNotification = (title, message) => {
    // Emit event for UI notification system
    window.dispatchEvent(new CustomEvent('realtime-error', {
      detail: { title, message }
    }))
  }

  return {
    // State
    projects,
    invoices,
    payments,
    connectionState,
    conflictQueue,

    // Actions
    createEntity,
    updateEntity,
    deleteEntity,
    initialize,
    handleRealtimeEvent,

    // Computed
    isConnected: computed(() => connectionState.value === 'connected'),
    hasPendingOperations: computed(() => pendingOperations.value.size > 0),
    hasConflicts: computed(() => conflictQueue.value.length > 0),

    entities: {
      projects: projectsMap,
      invoices: invoicesMap,
      payments: paymentsMap
    }
  }
})