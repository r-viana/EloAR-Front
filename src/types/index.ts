// ============================================================================
// Types for EloAR Frontend
// Sistema de Enturmação Inteligente
// ============================================================================

// ============================================================================
// Core Entities
// ============================================================================

export interface Student {
  id: number;
  schoolYearId: number;
  gradeLevelId: number;
  externalId?: string;
  fullName: string;
  birthdate?: string;
  gender?: 'M' | 'F' | 'O';
  academicAverage?: number;
  behavioralScore?: number;
  hasSpecialNeeds: boolean;
  specialNeedsDescription?: string;
  parentName?: string;
  parentEmail?: string;
  parentPhone?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStudentDTO {
  schoolYearId: number;
  gradeLevelId: number;
  externalId?: string;
  fullName: string;
  birthdate?: string;
  gender?: 'M' | 'F' | 'O';
  academicAverage?: number;
  behavioralScore?: number;
  hasSpecialNeeds?: boolean;
  specialNeedsDescription?: string;
  parentName?: string;
  parentEmail?: string;
  parentPhone?: string;
  notes?: string;
}

export interface UpdateStudentDTO extends Partial<CreateStudentDTO> {}

export interface Class {
  id: number;
  schoolYearId: number;
  gradeLevelId: number;
  name: string;
  maxCapacity: number;
  currentCount: number;
  roomNumber?: string;
  teacherName?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClassDTO {
  schoolYearId: number;
  gradeLevelId: number;
  name: string;
  maxCapacity: number;
  roomNumber?: string;
  teacherName?: string;
  notes?: string;
}

export interface UpdateClassDTO extends Partial<CreateClassDTO> {}

export interface SchoolYear {
  id: number;
  year: number;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSchoolYearDTO {
  year: number;
  name: string;
  startDate: string;
  endDate: string;
  isActive?: boolean;
}

export interface UpdateSchoolYearDTO extends Partial<CreateSchoolYearDTO> {}

export interface GradeLevel {
  id: number;
  name: string;
  code: string;
  displayOrder: number;
  expectedStudentCount: number;
  numberOfClasses: number;
  studentsPerClass: number;
  createdAt: string;
  updatedAt: string;
}

export interface StudentPreference {
  id: number;
  studentId: number;
  preferredStudentId: number;
  priority: number;
  createdAt: string;
  updatedAt: string;
}

export interface Constraint {
  id: number;
  studentAId: number;
  studentBId: number;
  constraintTypeId: number;
  ruleType: 'SEPARATE' | 'GROUP';
  reason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConstraintType {
  id: number;
  name: string;
  code: string;
  weight: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Configuration {
  id: number;
  name: string;
  description?: string;
  weights: WeightConfiguration;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WeightConfiguration {
  critical_constraints: number;
  high_constraints: number;
  behavioral_separation: number;
  sibling_rules: number;
  student_preferences: number;
  academic_balance: number;
  class_size_balance: number;
}

export interface Distribution {
  id: number;
  schoolYearId: number;
  gradeLevelId: number;
  configurationId: number;
  name: string;
  fitnessScore?: number;
  generationCount?: number;
  executionTime?: number;
  status: 'DRAFT' | 'OPTIMIZING' | 'COMPLETED' | 'FAILED';
  createdAt: string;
  updatedAt: string;
}

export interface DistributionAssignment {
  id: number;
  distributionId: number;
  studentId: number;
  classId: number;
  isManualOverride: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Import Types
// ============================================================================

export interface ImportError {
  row: number;
  field: string;
  message: string;
}

export interface ImportValidationResult {
  valid: boolean;
  totalRows: number;
  validRows: number;
  errors: ImportError[];
  preview: CreateStudentDTO[];
}

export interface ImportResult {
  success: boolean;
  message: string;
  successCount: number;
  errorCount: number;
  errors: ImportError[];
  duplicates: number;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ============================================================================
// Filter Types
// ============================================================================

export interface StudentFilters {
  schoolYearId?: number;
  gradeLevelId?: number;
  search?: string;
  hasSpecialNeeds?: boolean;
  gender?: 'M' | 'F' | 'O';
  page?: number;
  limit?: number;
}

export interface ClassFilters {
  schoolYearId?: number;
  gradeLevelId?: number;
  search?: string;
  page?: number;
  limit?: number;
}

// ============================================================================
// Preferences & Constraints Types (Phase 3)
// ============================================================================

export interface StudentPreference {
  id: number;
  studentId: number;
  preferredStudentId: number;
  priority: 1 | 2 | 3;
  createdAt: string;
  studentName?: string;
  preferredStudentName?: string;
  gradeLevelId?: number;
}

export interface CreateStudentPreferenceDTO {
  studentId: number;
  preferredStudentId: number;
  priority: 1 | 2 | 3;
}

export interface BulkPreferencesDTO {
  studentId: number;
  preferences: Array<{
    preferredStudentId: number;
    priority: 1 | 2 | 3;
  }>;
}

export type ConstraintAction = 'SEPARATE' | 'GROUP';

export interface StudentConstraint {
  id: number;
  schoolYearId: number;
  studentAId: number;
  studentBId: number;
  constraintTypeId: number;
  action: ConstraintAction;
  reason?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  studentAName?: string;
  studentBName?: string;
  constraintTypeName?: string;
  constraintTypeWeight?: number;
}

export interface CreateStudentConstraintDTO {
  schoolYearId: number;
  studentAId: number;
  studentBId: number;
  constraintTypeId: number;
  action: ConstraintAction;
  reason?: string;
  createdBy?: string;
}

export interface UpdateStudentConstraintDTO {
  constraintTypeId?: number;
  action?: ConstraintAction;
  reason?: string;
}

export type SiblingRuleType = 'SAME_CLASS' | 'DIFFERENT_CLASS' | 'NO_PREFERENCE';

export interface SiblingRule {
  id: number;
  schoolYearId: number;
  studentAId: number;
  studentBId: number;
  ruleType: SiblingRuleType;
  reason?: string;
  createdAt: string;
  studentAName?: string;
  studentBName?: string;
  gradeLevelId?: number;
}

export interface CreateSiblingRuleDTO {
  schoolYearId: number;
  studentAId: number;
  studentBId: number;
  ruleType: SiblingRuleType;
  reason?: string;
}

export interface UpdateSiblingRuleDTO {
  ruleType?: SiblingRuleType;
  reason?: string;
}

export interface ConstraintType {
  id: number;
  code: string;
  name: string;
  weight: number;
  description?: string;
  createdAt: string;
}

// ============================================================================
// Optimization Types
// ============================================================================

export interface OptimizationRun {
  id: string;
  distributionId: number;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  progress: number;
  currentGeneration: number;
  totalGenerations: number;
  bestFitness?: number;
  startTime: string;
  endTime?: string;
  errorMessage?: string;
}

export interface OptimizationProgress {
  runId: string;
  status: string;
  progress: number;
  currentGeneration: number;
  totalGenerations: number;
  bestFitness: number;
  elapsedTime: number;
}

// ============================================================================
// UI State Types
// ============================================================================

export interface AppState {
  activeSchoolYear: SchoolYear | null;
  activeGradeLevel: GradeLevel | null;
  currentDistribution: Distribution | null;
  setActiveSchoolYear: (schoolYear: SchoolYear | null) => void;
  setActiveGradeLevel: (gradeLevel: GradeLevel | null) => void;
  setCurrentDistribution: (distribution: Distribution | null) => void;
}

// ============================================================================
// Form Types
// ============================================================================

export interface ImportFormData {
  file: File | null;
  schoolYearId: number;
  gradeLevelId: number;
  replaceExisting: boolean;
}

// ============================================================================
// Utility Types
// ============================================================================

export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  field: string;
  direction: SortDirection;
}

export interface TableColumn<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
}
