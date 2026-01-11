/**
 * Unit Tests - Production Workflow
 * Tests pentru logica de producție
 */

import { describe, it, expect } from 'vitest';

enum ProductionStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  PAUSED = 'PAUSED',
  QUALITY_CHECK = 'QUALITY_CHECK',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

type ProductionJob = {
  id: string;
  status: ProductionStatus;
  startTime?: Date;
  pauseTime?: Date;
  endTime?: Date;
  totalPauseTime: number; // milliseconds
  estimatedDuration: number; // milliseconds
};

class ProductionWorkflow {
  /**
   * Calculează durata efectivă de lucru (exclude pauzele)
   */
  static calculateWorkingDuration(job: ProductionJob): number {
    if (!job.startTime) return 0;

    const endTime = job.endTime || new Date();
    const totalTime = endTime.getTime() - job.startTime.getTime();
    const workingTime = totalTime - job.totalPauseTime;

    return Math.max(0, workingTime);
  }

  /**
   * Calculează progresul estimat (%)
   */
  static calculateProgress(job: ProductionJob): number {
    if (job.status === ProductionStatus.COMPLETED) return 100;
    if (job.status === ProductionStatus.FAILED) return 0;
    if (!job.startTime) return 0;

    const workingDuration = this.calculateWorkingDuration(job);
    const progress = (workingDuration / job.estimatedDuration) * 100;

    return Math.min(100, Math.max(0, progress));
  }

  /**
   * Estimează timpul rămas
   */
  static estimateRemainingTime(job: ProductionJob): number {
    if (job.status === ProductionStatus.COMPLETED) return 0;
    if (job.status === ProductionStatus.PAUSED) {
      // Timpul rămas = estimat - deja lucrat
      return job.estimatedDuration - this.calculateWorkingDuration(job);
    }

    const workingDuration = this.calculateWorkingDuration(job);
    const remaining = job.estimatedDuration - workingDuration;

    return Math.max(0, remaining);
  }

  /**
   * Verifică dacă job-ul întârzie
   */
  static isDelayed(job: ProductionJob): boolean {
    if (job.status === ProductionStatus.COMPLETED) return false;
    if (!job.startTime) return false;

    const workingDuration = this.calculateWorkingDuration(job);
    return workingDuration > job.estimatedDuration;
  }

  /**
   * Calculează delay-ul (milliseconds)
   */
  static calculateDelay(job: ProductionJob): number {
    if (!this.isDelayed(job)) return 0;

    const workingDuration = this.calculateWorkingDuration(job);
    return workingDuration - job.estimatedDuration;
  }

  /**
   * Verifică dacă tranziția de status este validă
   */
  static canTransition(
    currentStatus: ProductionStatus,
    newStatus: ProductionStatus
  ): boolean {
    const validTransitions: Record<ProductionStatus, ProductionStatus[]> = {
      [ProductionStatus.PENDING]: [ProductionStatus.IN_PROGRESS],
      [ProductionStatus.IN_PROGRESS]: [
        ProductionStatus.PAUSED,
        ProductionStatus.QUALITY_CHECK,
        ProductionStatus.FAILED,
      ],
      [ProductionStatus.PAUSED]: [
        ProductionStatus.IN_PROGRESS,
        ProductionStatus.FAILED,
      ],
      [ProductionStatus.QUALITY_CHECK]: [
        ProductionStatus.COMPLETED,
        ProductionStatus.IN_PROGRESS, // Dacă nu trece QC
        ProductionStatus.FAILED,
      ],
      [ProductionStatus.COMPLETED]: [],
      [ProductionStatus.FAILED]: [ProductionStatus.PENDING], // Retry
    };

    return validTransitions[currentStatus]?.includes(newStatus) || false;
  }

  /**
   * Calculează timpul estimat per bucată
   */
  static calculateTimePerPiece(
    totalDuration: number,
    quantity: number
  ): number {
    if (quantity <= 0) return 0;
    return totalDuration / quantity;
  }

  /**
   * Estimează durata pentru o nouă comandă bazat pe istoric
   */
  static estimateDuration(
    baseTimePerPiece: number,
    quantity: number,
    complexity: 'simple' | 'medium' | 'complex' = 'medium'
  ): number {
    const complexityMultiplier = {
      simple: 0.8,
      medium: 1.0,
      complex: 1.5,
    };

    const setupTime = 30 * 60 * 1000; // 30 min setup
    const productionTime =
      baseTimePerPiece * quantity * complexityMultiplier[complexity];

    return setupTime + productionTime;
  }
}

describe('ProductionWorkflow - Duration Calculations', () => {
  it('calculează durata de lucru fără pauze', () => {
    const job: ProductionJob = {
      id: '1',
      status: ProductionStatus.IN_PROGRESS,
      startTime: new Date('2024-01-01T10:00:00'),
      endTime: new Date('2024-01-01T12:00:00'),
      totalPauseTime: 0,
      estimatedDuration: 2 * 60 * 60 * 1000,
    };

    const duration = ProductionWorkflow.calculateWorkingDuration(job);
    expect(duration).toBe(2 * 60 * 60 * 1000); // 2 ore
  });

  it('calculează durata de lucru cu pauze', () => {
    const job: ProductionJob = {
      id: '1',
      status: ProductionStatus.IN_PROGRESS,
      startTime: new Date('2024-01-01T10:00:00'),
      endTime: new Date('2024-01-01T13:00:00'),
      totalPauseTime: 30 * 60 * 1000, // 30 min pauză
      estimatedDuration: 2 * 60 * 60 * 1000,
    };

    const duration = ProductionWorkflow.calculateWorkingDuration(job);
    expect(duration).toBe(2.5 * 60 * 60 * 1000); // 2.5 ore total - 0.5 pauză = 2 ore lucru
  });

  it('returnează 0 pentru job fără start time', () => {
    const job: ProductionJob = {
      id: '1',
      status: ProductionStatus.PENDING,
      totalPauseTime: 0,
      estimatedDuration: 2 * 60 * 60 * 1000,
    };

    const duration = ProductionWorkflow.calculateWorkingDuration(job);
    expect(duration).toBe(0);
  });
});

describe('ProductionWorkflow - Progress Tracking', () => {
  it('calculează progres 0% pentru PENDING', () => {
    const job: ProductionJob = {
      id: '1',
      status: ProductionStatus.PENDING,
      totalPauseTime: 0,
      estimatedDuration: 2 * 60 * 60 * 1000,
    };

    expect(ProductionWorkflow.calculateProgress(job)).toBe(0);
  });

  it('calculează progres 100% pentru COMPLETED', () => {
    const job: ProductionJob = {
      id: '1',
      status: ProductionStatus.COMPLETED,
      startTime: new Date('2024-01-01T10:00:00'),
      endTime: new Date('2024-01-01T12:00:00'),
      totalPauseTime: 0,
      estimatedDuration: 2 * 60 * 60 * 1000,
    };

    expect(ProductionWorkflow.calculateProgress(job)).toBe(100);
  });

  it('calculează progres corect în timpul lucrului', () => {
    const job: ProductionJob = {
      id: '1',
      status: ProductionStatus.IN_PROGRESS,
      startTime: new Date('2024-01-01T10:00:00'),
      endTime: new Date('2024-01-01T11:00:00'),
      totalPauseTime: 0,
      estimatedDuration: 2 * 60 * 60 * 1000, // 2 ore
    };

    expect(ProductionWorkflow.calculateProgress(job)).toBe(50); // 1h din 2h = 50%
  });

  it('nu depășește 100% chiar dacă întârzie', () => {
    const job: ProductionJob = {
      id: '1',
      status: ProductionStatus.IN_PROGRESS,
      startTime: new Date('2024-01-01T10:00:00'),
      endTime: new Date('2024-01-01T14:00:00'), // 4 ore în loc de 2
      totalPauseTime: 0,
      estimatedDuration: 2 * 60 * 60 * 1000,
    };

    expect(ProductionWorkflow.calculateProgress(job)).toBe(100);
  });
});

describe('ProductionWorkflow - Time Estimation', () => {
  it('estimează timpul rămas corect', () => {
    const job: ProductionJob = {
      id: '1',
      status: ProductionStatus.IN_PROGRESS,
      startTime: new Date('2024-01-01T10:00:00'),
      endTime: new Date('2024-01-01T11:00:00'),
      totalPauseTime: 0,
      estimatedDuration: 2 * 60 * 60 * 1000, // 2 ore
    };

    const remaining = ProductionWorkflow.estimateRemainingTime(job);
    expect(remaining).toBe(1 * 60 * 60 * 1000); // 1 oră rămasă
  });

  it('returnează 0 pentru job-uri complete', () => {
    const job: ProductionJob = {
      id: '1',
      status: ProductionStatus.COMPLETED,
      startTime: new Date('2024-01-01T10:00:00'),
      endTime: new Date('2024-01-01T12:00:00'),
      totalPauseTime: 0,
      estimatedDuration: 2 * 60 * 60 * 1000,
    };

    expect(ProductionWorkflow.estimateRemainingTime(job)).toBe(0);
  });

  it('detectează întârzierea corect', () => {
    const job: ProductionJob = {
      id: '1',
      status: ProductionStatus.IN_PROGRESS,
      startTime: new Date('2024-01-01T10:00:00'),
      endTime: new Date('2024-01-01T13:00:00'), // 3 ore în loc de 2
      totalPauseTime: 0,
      estimatedDuration: 2 * 60 * 60 * 1000,
    };

    expect(ProductionWorkflow.isDelayed(job)).toBe(true);
    expect(ProductionWorkflow.calculateDelay(job)).toBe(1 * 60 * 60 * 1000); // 1 oră delay
  });

  it('nu detectează întârziere pentru job-uri la timp', () => {
    const job: ProductionJob = {
      id: '1',
      status: ProductionStatus.IN_PROGRESS,
      startTime: new Date('2024-01-01T10:00:00'),
      endTime: new Date('2024-01-01T11:00:00'),
      totalPauseTime: 0,
      estimatedDuration: 2 * 60 * 60 * 1000,
    };

    expect(ProductionWorkflow.isDelayed(job)).toBe(false);
    expect(ProductionWorkflow.calculateDelay(job)).toBe(0);
  });
});

describe('ProductionWorkflow - Status Transitions', () => {
  it('permite PENDING → IN_PROGRESS', () => {
    expect(
      ProductionWorkflow.canTransition(
        ProductionStatus.PENDING,
        ProductionStatus.IN_PROGRESS
      )
    ).toBe(true);
  });

  it('permite IN_PROGRESS → PAUSED', () => {
    expect(
      ProductionWorkflow.canTransition(
        ProductionStatus.IN_PROGRESS,
        ProductionStatus.PAUSED
      )
    ).toBe(true);
  });

  it('permite PAUSED → IN_PROGRESS', () => {
    expect(
      ProductionWorkflow.canTransition(
        ProductionStatus.PAUSED,
        ProductionStatus.IN_PROGRESS
      )
    ).toBe(true);
  });

  it('permite IN_PROGRESS → QUALITY_CHECK', () => {
    expect(
      ProductionWorkflow.canTransition(
        ProductionStatus.IN_PROGRESS,
        ProductionStatus.QUALITY_CHECK
      )
    ).toBe(true);
  });

  it('permite QUALITY_CHECK → COMPLETED', () => {
    expect(
      ProductionWorkflow.canTransition(
        ProductionStatus.QUALITY_CHECK,
        ProductionStatus.COMPLETED
      )
    ).toBe(true);
  });

  it('permite FAILED → PENDING (retry)', () => {
    expect(
      ProductionWorkflow.canTransition(
        ProductionStatus.FAILED,
        ProductionStatus.PENDING
      )
    ).toBe(true);
  });

  it('nu permite COMPLETED → orice', () => {
    expect(
      ProductionWorkflow.canTransition(
        ProductionStatus.COMPLETED,
        ProductionStatus.IN_PROGRESS
      )
    ).toBe(false);
  });

  it('nu permite PENDING → COMPLETED (skip steps)', () => {
    expect(
      ProductionWorkflow.canTransition(
        ProductionStatus.PENDING,
        ProductionStatus.COMPLETED
      )
    ).toBe(false);
  });
});

describe('ProductionWorkflow - Time per Piece', () => {
  it('calculează timpul per bucată', () => {
    const timePerPiece = ProductionWorkflow.calculateTimePerPiece(
      2 * 60 * 60 * 1000, // 2 ore
      10 // 10 bucăți
    );

    expect(timePerPiece).toBe(12 * 60 * 1000); // 12 min per bucată
  });

  it('returnează 0 pentru cantitate 0', () => {
    expect(ProductionWorkflow.calculateTimePerPiece(1000, 0)).toBe(0);
  });
});

describe('ProductionWorkflow - Duration Estimation', () => {
  it('estimează durata pentru comandă simplă', () => {
    const duration = ProductionWorkflow.estimateDuration(
      10 * 60 * 1000, // 10 min per bucată
      5, // 5 bucăți
      'simple'
    );

    // Setup (30 min) + Production (5 * 10 min * 0.8) = 30 + 40 = 70 min
    expect(duration).toBe(70 * 60 * 1000);
  });

  it('estimează durata pentru comandă medie', () => {
    const duration = ProductionWorkflow.estimateDuration(
      10 * 60 * 1000,
      5,
      'medium'
    );

    // Setup (30 min) + Production (5 * 10 min * 1.0) = 30 + 50 = 80 min
    expect(duration).toBe(80 * 60 * 1000);
  });

  it('estimează durata pentru comandă complexă', () => {
    const duration = ProductionWorkflow.estimateDuration(
      10 * 60 * 1000,
      5,
      'complex'
    );

    // Setup (30 min) + Production (5 * 10 min * 1.5) = 30 + 75 = 105 min
    expect(duration).toBe(105 * 60 * 1000);
  });
});
