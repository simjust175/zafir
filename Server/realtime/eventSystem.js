/**
 * Real-time Event System for Invoice Management
 * Handles versioned events, conflict resolution, and reliable delivery
 */

class EventSystem {
  constructor(io) {
    this.io = io;
    this.eventHistory = new Map(); // Store complete event logs per entity
    this.globalEventLog = []; // Store all events for complete sync
    this.versionCounter = 0;
    this.maxHistorySize = 1000; // Prevent unbounded growth
  }

  /**
   * Generate next version number for event ordering
   */
  getNextVersion() {
    return ++this.versionCounter;
  }

  /**
   * Emit a CRUD event to all connected clients
   * @param {string} entityType - 'project', 'invoice', 'payment'
   * @param {string} operation - 'create', 'update', 'delete'
   * @param {object} data - The changed data
   * @param {string} userId - User who made the change
   * @param {string} entityId - Unique identifier for the entity
   */
  emit(entityType, operation, data, userId = null, entityId = null) {
    const version = this.getNextVersion();
    const timestamp = new Date().toISOString();
    
    const event = {
      entityType,
      operation,
      data,
      version,
      timestamp,
      userId,
      entityId,
      id: `${entityType}_${operation}_${version}`
    };

    // Store in complete event history for conflict resolution and sync
    if (entityId) {
      if (!this.eventHistory.has(entityId)) {
        this.eventHistory.set(entityId, []);
      }
      const entityEvents = this.eventHistory.get(entityId);
      entityEvents.push(event);
      
      // Prevent unbounded growth - keep last N events per entity
      if (entityEvents.length > this.maxHistorySize) {
        entityEvents.shift();
      }
    }

    // Store in global event log for comprehensive sync
    this.globalEventLog.push(event);
    if (this.globalEventLog.length > this.maxHistorySize * 10) {
      this.globalEventLog.shift();
    }

    // Emit to all clients
    this.io.emit('data-change', event);
    
    // Also emit specific channel for targeted listening
    this.io.emit(`${entityType}-${operation}`, event);
    
    console.log(`📡 Real-time event emitted: ${event.id}`, { entityType, operation, entityId });
    
    return event;
  }

  /**
   * Emit project-related events
   */
  emitProject(operation, data, userId = null) {
    return this.emit('project', operation, data, userId, data.project_id || data.id);
  }

  /**
   * Emit invoice-related events
   */
  emitInvoice(operation, data, userId = null) {
    return this.emit('invoice', operation, data, userId, data.invoice_id || data.id);
  }

  /**
   * Emit payment-related events
   */
  emitPayment(operation, data, userId = null) {
    return this.emit('payment', operation, data, userId, data.payment_id || data.id);
  }

  /**
   * Get complete event history for an entity
   */
  getEntityEventHistory(entityId) {
    return this.eventHistory.get(entityId) || [];
  }

  /**
   * Handle client reconnection sync request with complete event replay
   */
  handleSyncRequest(socket, lastVersion) {
    // Get all missed events from global log
    const missedEvents = this.globalEventLog.filter(event => event.version > lastVersion);
    
    // Sort by version to ensure proper order
    missedEvents.sort((a, b) => a.version - b.version);
    
    socket.emit('sync-events', missedEvents);
    console.log(`🔄 Synced ${missedEvents.length} events for client ${socket.id} from version ${lastVersion}`);
  }

  /**
   * Setup socket handlers for the event system
   */
  setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`🔌 Client connected: ${socket.id}`);
      
      // Handle sync requests from reconnecting clients
      socket.on('request-sync', (lastVersion) => {
        this.handleSyncRequest(socket, lastVersion || 0);
      });
      
      // Handle client acknowledgments
      socket.on('event-ack', (eventId) => {
        console.log(`✅ Client ${socket.id} acknowledged event: ${eventId}`);
      });
      
      socket.on('disconnect', () => {
        console.log(`❎ Client disconnected: ${socket.id}`);
      });
    });
  }
}

export default EventSystem;