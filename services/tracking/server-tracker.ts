// Shared server-side tracking state (Isomorphic Option A)
// Enables the server-side AI SDK tools to access the simulated fleet metrics

import { TrackingEngine } from './tracking-engine';
import { generateVehiclePool } from './vehicle-generator';
import { initializeRoutes } from './mock-routes';

// Next.js hot-reloading can re-initialize modules, so we cache on global
const globalWithTracker = global as typeof global & {
  serverTrackingEngine?: TrackingEngine;
  lastTrackerTick?: number;
};

export function getServerTrackingEngine(): TrackingEngine {
  if (!globalWithTracker.serverTrackingEngine) {
    const initialVehicles = generateVehiclePool(15);
    const routes = initializeRoutes();
    globalWithTracker.serverTrackingEngine = new TrackingEngine(initialVehicles, routes);
    globalWithTracker.lastTrackerTick = Date.now();
  } else {
    // Tick the engine based on real elapsed time since last tick
    const now = Date.now();
    const lastTick = globalWithTracker.lastTrackerTick || now;
    const elapsedSeconds = Math.floor((now - lastTick) / 1000);
    
    if (elapsedSeconds > 0) {
      // Limit to max 10 ticks to prevent runaway simulation catching up
      const ticksToRun = Math.min(10, elapsedSeconds);
      for (let i = 0; i < ticksToRun; i++) {
        globalWithTracker.serverTrackingEngine.updateSimulation();
      }
      globalWithTracker.lastTrackerTick = now;
    }
  }

  return globalWithTracker.serverTrackingEngine;
}
