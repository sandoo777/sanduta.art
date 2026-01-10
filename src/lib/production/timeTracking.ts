/**
 * Time Tracking Utility for Production Operations
 * Tracks start, pause, resume, and end times with high precision
 */

export interface TimeEntry {
  type: 'start' | 'pause' | 'resume' | 'end';
  timestamp: Date;
  note?: string;
}

export interface TimeTrackingData {
  entries: TimeEntry[];
  startTime?: Date;
  endTime?: Date;
  totalActiveTime: number; // milliseconds
  totalPausedTime: number; // milliseconds
  totalElapsedTime: number; // milliseconds
  isRunning: boolean;
  isPaused: boolean;
}

export class TimeTracker {
  private entries: TimeEntry[] = [];
  private startTime?: Date;
  private currentPauseStart?: Date;
  private totalPausedTime: number = 0;

  constructor(initialEntries?: TimeEntry[]) {
    if (initialEntries) {
      this.entries = initialEntries;
      this.recalculate();
    }
  }

  /**
   * Start tracking time
   */
  start(note?: string): TimeEntry {
    const entry: TimeEntry = {
      type: 'start',
      timestamp: new Date(),
      note,
    };
    
    this.entries.push(entry);
    this.startTime = entry.timestamp;
    
    return entry;
  }

  /**
   * Pause tracking
   */
  pause(note?: string): TimeEntry {
    if (!this.startTime) {
      throw new Error('Cannot pause: tracking not started');
    }
    
    const entry: TimeEntry = {
      type: 'pause',
      timestamp: new Date(),
      note,
    };
    
    this.entries.push(entry);
    this.currentPauseStart = entry.timestamp;
    
    return entry;
  }

  /**
   * Resume tracking after pause
   */
  resume(note?: string): TimeEntry {
    if (!this.currentPauseStart) {
      throw new Error('Cannot resume: not paused');
    }
    
    const entry: TimeEntry = {
      type: 'resume',
      timestamp: new Date(),
      note,
    };
    
    this.entries.push(entry);
    
    // Add paused duration to total
    this.totalPausedTime += entry.timestamp.getTime() - this.currentPauseStart.getTime();
    this.currentPauseStart = undefined;
    
    return entry;
  }

  /**
   * End tracking
   */
  end(note?: string): TimeEntry {
    if (!this.startTime) {
      throw new Error('Cannot end: tracking not started');
    }
    
    const entry: TimeEntry = {
      type: 'end',
      timestamp: new Date(),
      note,
    };
    
    this.entries.push(entry);
    
    // If still paused when ending, add final pause time
    if (this.currentPauseStart) {
      this.totalPausedTime += entry.timestamp.getTime() - this.currentPauseStart.getTime();
      this.currentPauseStart = undefined;
    }
    
    return entry;
  }

  /**
   * Get current tracking data
   */
  getData(): TimeTrackingData {
    const endTime = this.getEndTime();
    const totalElapsedTime = this.getTotalElapsedTime();
    const totalActiveTime = totalElapsedTime - this.totalPausedTime;
    
    return {
      entries: this.entries,
      startTime: this.startTime,
      endTime,
      totalActiveTime,
      totalPausedTime: this.totalPausedTime,
      totalElapsedTime,
      isRunning: this.isRunning(),
      isPaused: this.isPaused(),
    };
  }

  /**
   * Check if tracking is currently running
   */
  isRunning(): boolean {
    if (!this.startTime) return false;
    if (this.getEndTime()) return false;
    if (this.currentPauseStart) return false;
    return true;
  }

  /**
   * Check if tracking is currently paused
   */
  isPaused(): boolean {
    return !!this.currentPauseStart;
  }

  /**
   * Get end time (last 'end' entry)
   */
  private getEndTime(): Date | undefined {
    const endEntry = this.entries.findLast(e => e.type === 'end');
    return endEntry?.timestamp;
  }

  /**
   * Get total elapsed time (including pauses)
   */
  private getTotalElapsedTime(): number {
    if (!this.startTime) return 0;
    
    const endTime = this.getEndTime() || new Date();
    return endTime.getTime() - this.startTime.getTime();
  }

  /**
   * Recalculate times from entries (used when loading from storage)
   */
  private recalculate(): void {
    this.startTime = undefined;
    this.currentPauseStart = undefined;
    this.totalPausedTime = 0;
    
    let tempPauseStart: Date | undefined;
    
    for (const entry of this.entries) {
      switch (entry.type) {
        case 'start':
          this.startTime = entry.timestamp;
          break;
          
        case 'pause':
          tempPauseStart = entry.timestamp;
          break;
          
        case 'resume':
          if (tempPauseStart) {
            this.totalPausedTime += entry.timestamp.getTime() - tempPauseStart.getTime();
            tempPauseStart = undefined;
          }
          break;
          
        case 'end':
          if (tempPauseStart) {
            this.totalPausedTime += entry.timestamp.getTime() - tempPauseStart.getTime();
            tempPauseStart = undefined;
          }
          break;
      }
    }
    
    // If last action was pause and no end, track current pause
    if (tempPauseStart && !this.getEndTime()) {
      this.currentPauseStart = tempPauseStart;
    }
  }

  /**
   * Export entries as JSON
   */
  toJSON(): string {
    return JSON.stringify(this.entries);
  }

  /**
   * Create tracker from JSON
   */
  static fromJSON(json: string): TimeTracker {
    const entries = JSON.parse(json);
    return new TimeTracker(entries.map((e: any) => ({
      ...e,
      timestamp: new Date(e.timestamp),
    })));
  }
}

/**
 * Format duration in human-readable format
 */
export function formatDuration(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
}

/**
 * Compare estimated vs actual time
 */
export function compareTime(estimatedMinutes: number, actualMilliseconds: number): {
  variance: number; // percentage
  isDelayed: boolean;
  message: string;
} {
  const estimatedMs = estimatedMinutes * 60 * 1000;
  const variance = ((actualMilliseconds - estimatedMs) / estimatedMs) * 100;
  const isDelayed = variance > 10; // More than 10% over estimate
  
  let message = '';
  if (variance < -10) {
    message = `Completed ${Math.abs(Math.round(variance))}% faster than estimated`;
  } else if (variance > 10) {
    message = `Delayed by ${Math.round(variance)}% compared to estimate`;
  } else {
    message = 'On time';
  }
  
  return { variance, isDelayed, message };
}
