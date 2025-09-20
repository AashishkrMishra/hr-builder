export type QuestionType = 
  | 'single-choice'
  | 'multi-choice' 
  | 'short-text'
  | 'long-text'
  | 'numeric'
  | 'file-upload';

export interface ValidationRule {
  minLength?: number;
  maxLength?: number;
  minValue?: number;
  maxValue?: number;
  pattern?: string;
  required?: boolean;
}

export interface ConditionalLogic {
  dependsOn: string; // question ID
  condition: 'equals' | 'not-equals' | 'contains' | 'greater-than' | 'less-than';
  value: string | number;
}

export interface Question {
  id: string;
  type: QuestionType;
  title: string;
  description?: string;
  required: boolean;
  order: number;
  validation?: ValidationRule;
  conditional?: ConditionalLogic;
  options?: string[]; // for choice questions
  placeholder?: string;
}

export interface Section {
  id: string;
  title: string;
  description?: string;
  order: number;
  questions: Question[];
  isExpanded?: boolean;
}

export interface Assessment {
  id: string;
  jobId: string;
  title: string;
  description: string;
  sections: Section[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AssessmentResponse {
  assessmentId: string;
  candidateId: string;
  responses: Record<string, any>;
  completedSections: string[];
  startedAt: Date;
  completedAt?: Date;
  progress: number;
}

export interface QuestionTypeConfig {
  type: QuestionType;
  label: string;
  description: string;
  icon: string;
  defaultProps: Partial<Question>;
}