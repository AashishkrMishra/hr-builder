import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Monitor,
  Tablet,
  Smartphone,
  Play,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { Assessment, Question, AssessmentResponse } from '@/types/assessment';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';

interface LivePreviewProps {
  assessment: Assessment;
  previewMode: 'desktop' | 'tablet' | 'mobile';
  onPreviewModeChange: (mode: 'desktop' | 'tablet' | 'mobile') => void;
}

const previewModeConfigs = {
  desktop: {
    icon: Monitor,
    width: '100%',
    label: 'Desktop',
  },
  tablet: {
    icon: Tablet,
    width: '768px',
    label: 'Tablet',
  },
  mobile: {
    icon: Smartphone,
    width: '375px',
    label: 'Mobile',
  },
};

export const LivePreview: React.FC<LivePreviewProps> = ({
  assessment,
  previewMode,
  onPreviewModeChange,
}) => {
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [isTestMode, setIsTestMode] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const currentSection = assessment.sections[currentSectionIndex];
  const totalQuestions = assessment.sections.reduce((acc, section) => acc + section.questions.length, 0);
  const answeredQuestions = Object.keys(responses).length;
  const progress = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;

  const updateResponse = (questionId: string, value: any) => {
    setResponses(prev => ({ ...prev, [questionId]: value }));
    // Clear validation error when user provides input
    if (validationErrors[questionId]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[questionId];
        return newErrors;
      });
    }
  };

  const validateQuestion = (question: Question, value: any): string | null => {
    if (question.required && (!value || (Array.isArray(value) && value.length === 0))) {
      return 'This field is required';
    }

    if (question.type === 'numeric' && question.validation) {
      const numValue = Number(value);
      if (question.validation.minValue !== undefined && numValue < question.validation.minValue) {
        return `Value must be at least ${question.validation.minValue}`;
      }
      if (question.validation.maxValue !== undefined && numValue > question.validation.maxValue) {
        return `Value must be at most ${question.validation.maxValue}`;
      }
    }

    if ((question.type === 'short-text' || question.type === 'long-text') && question.validation) {
      const textValue = String(value || '');
      if (question.validation.minLength !== undefined && textValue.length < question.validation.minLength) {
        return `Must be at least ${question.validation.minLength} characters`;
      }
      if (question.validation.maxLength !== undefined && textValue.length > question.validation.maxLength) {
        return `Must be at most ${question.validation.maxLength} characters`;
      }
    }

    return null;
  };

  const validateCurrentSection = (): boolean => {
    if (!currentSection) return true;

    const errors: Record<string, string> = {};
    let hasErrors = false;

    currentSection.questions.forEach(question => {
      const error = validateQuestion(question, responses[question.id]);
      if (error) {
        errors[question.id] = error;
        hasErrors = true;
      }
    });

    setValidationErrors(errors);
    return !hasErrors;
  };

  const goToNextSection = () => {
    if (validateCurrentSection() && currentSectionIndex < assessment.sections.length - 1) {
      setCurrentSectionIndex(prev => prev + 1);
    }
  };

  const goToPreviousSection = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(prev => prev - 1);
    }
  };

  const resetPreview = () => {
    setResponses({});
    setCurrentSectionIndex(0);
    setValidationErrors({});
    setIsTestMode(false);
  };

  const renderQuestion = (question: Question) => {
    const value = responses[question.id];
    const error = validationErrors[question.id];
    const isRequired = question.required;

    // Check conditional logic
    if (question.conditional) {
      const dependentValue = responses[question.conditional.dependsOn];
      const shouldShow = (() => {
        switch (question.conditional.condition) {
          case 'equals':
            return dependentValue === question.conditional.value;
          case 'not-equals':
            return dependentValue !== question.conditional.value;
          case 'contains':
            return String(dependentValue || '').includes(String(question.conditional.value));
          default:
            return true;
        }
      })();

      if (!shouldShow) return null;
    }

    return (
      <motion.div
        key={question.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="space-y-3"
      >
        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground flex items-center gap-2">
            {question.title}
            {isRequired && <span className="text-danger text-xs">*</span>}
          </Label>
          
          {question.description && (
            <p className="text-xs text-foreground-muted">{question.description}</p>
          )}
        </div>

        <div className="space-y-2">
          {question.type === 'single-choice' && (
            <RadioGroup
              value={value || ''}
              onValueChange={(newValue) => updateResponse(question.id, newValue)}
              className="space-y-2"
            >
              {(question.options || []).map((option, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center space-x-2"
                >
                  <RadioGroupItem value={option} id={`${question.id}-${index}`} />
                  <Label 
                    htmlFor={`${question.id}-${index}`}
                    className="text-sm cursor-pointer hover:text-primary transition-colors"
                  >
                    {option}
                  </Label>
                </motion.div>
              ))}
            </RadioGroup>
          )}

          {question.type === 'multi-choice' && (
            <div className="space-y-2">
              {(question.options || []).map((option, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center space-x-2"
                >
                  <Checkbox
                    id={`${question.id}-${index}`}
                    checked={(value || []).includes(option)}
                    onCheckedChange={(checked) => {
                      const currentValues = value || [];
                      const newValues = checked
                        ? [...currentValues, option]
                        : currentValues.filter((v: string) => v !== option);
                      updateResponse(question.id, newValues);
                    }}
                  />
                  <Label 
                    htmlFor={`${question.id}-${index}`}
                    className="text-sm cursor-pointer hover:text-primary transition-colors"
                  >
                    {option}
                  </Label>
                </motion.div>
              ))}
            </div>
          )}

          {question.type === 'short-text' && (
            <Input
              value={value || ''}
              onChange={(e) => updateResponse(question.id, e.target.value)}
              placeholder={question.placeholder || 'Enter your answer...'}
              className={`input-glass transition-all duration-200 ${
                error ? 'border-danger focus:border-danger focus:ring-danger/20' : ''
              }`}
            />
          )}

          {question.type === 'long-text' && (
            <Textarea
              value={value || ''}
              onChange={(e) => updateResponse(question.id, e.target.value)}
              placeholder={question.placeholder || 'Enter your detailed answer...'}
              rows={4}
              className={`input-glass resize-none transition-all duration-200 ${
                error ? 'border-danger focus:border-danger focus:ring-danger/20' : ''
              }`}
            />
          )}

          {question.type === 'numeric' && (
            <Input
              type="number"
              value={value || ''}
              onChange={(e) => updateResponse(question.id, e.target.value)}
              placeholder={question.placeholder || 'Enter a number...'}
              min={question.validation?.minValue}
              max={question.validation?.maxValue}
              className={`input-glass transition-all duration-200 ${
                error ? 'border-danger focus:border-danger focus:ring-danger/20' : ''
              }`}
            />
          )}

          {question.type === 'file-upload' && (
            <div className={`drop-zone p-6 rounded-lg text-center transition-all duration-200 ${
              error ? 'border-danger' : ''
            }`}>
              <div className="space-y-2">
                <div className="w-12 h-12 mx-auto bg-gradient-primary/10 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-foreground">
                    <button className="text-primary hover:underline">Click to upload</button>
                    {' '}or drag and drop
                  </p>
                  <p className="text-xs text-foreground-muted">Max file size: 10MB</p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-danger text-xs"
            >
              <AlertCircle className="w-3 h-3" />
              {error}
            </motion.div>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-background-tertiary">
      {/* Preview Header */}
      <div className="p-4 border-b border-border bg-background-secondary/80 backdrop-blur-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Live Preview</h2>
          
          <div className="flex items-center gap-2">
            <Button
              variant={isTestMode ? 'default' : 'outline'}
              size="sm"
              onClick={() => setIsTestMode(!isTestMode)}
              className={isTestMode ? 'btn-primary' : 'btn-secondary'}
            >
              <Play className="w-3 h-3 mr-1" />
              {isTestMode ? 'Testing' : 'Test Mode'}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={resetPreview}
              className="btn-secondary"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Reset
            </Button>
          </div>
        </div>

        {/* Device Mode Selector */}
        <div className="flex items-center gap-1 bg-background-tertiary rounded-lg p-1">
          {Object.entries(previewModeConfigs).map(([mode, config]) => {
            const IconComponent = config.icon;
            return (
              <button
                key={mode}
                onClick={() => onPreviewModeChange(mode as typeof previewMode)}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  previewMode === mode
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-foreground-muted hover:text-foreground hover:bg-background-secondary/50'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                {config.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 overflow-auto custom-scrollbar p-4">
        <div className="max-w-full mx-auto" style={{ width: previewModeConfigs[previewMode].width }}>
          <motion.div
            className="bg-background border border-border rounded-lg shadow-card overflow-hidden"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            {/* Assessment Header */}
            <div className="p-6 border-b border-border bg-background-secondary/30">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h1 className="text-2xl font-bold text-foreground mb-2">
                  {assessment.title || 'Assessment Preview'}
                </h1>
                {assessment.description && (
                  <p className="text-foreground-muted leading-relaxed">
                    {assessment.description}
                  </p>
                )}
              </motion.div>

              {/* Progress Bar */}
              {isTestMode && totalQuestions > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="mt-4"
                >
                  <div className="flex items-center justify-between text-sm text-foreground-muted mb-2">
                    <span>Progress</span>
                    <span>{answeredQuestions} of {totalQuestions} questions</span>
                  </div>
                  <Progress value={progress} className="progress-bar" />
                </motion.div>
              )}
            </div>

            {/* Current Section */}
            {currentSection && (
              <div className="p-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSection.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Section Header */}
                    <div className="mb-6">
                      <h2 className="text-xl font-semibold text-foreground mb-2">
                        {currentSection.title}
                      </h2>
                      {currentSection.description && (
                        <p className="text-foreground-muted">
                          {currentSection.description}
                        </p>
                      )}
                    </div>

                    {/* Questions */}
                    <div className="space-y-6">
                      <AnimatePresence>
                        {currentSection.questions.map((question, index) => (
                          <motion.div
                            key={question.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            {renderQuestion(question)}
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>

                    {/* Navigation */}
                    {isTestMode && assessment.sections.length > 1 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="flex items-center justify-between mt-8 pt-6 border-t border-border"
                      >
                        <Button
                          variant="outline"
                          onClick={goToPreviousSection}
                          disabled={currentSectionIndex === 0}
                          className="btn-secondary"
                        >
                          <ArrowLeft className="w-4 h-4 mr-2" />
                          Previous
                        </Button>

                        <span className="text-sm text-foreground-muted">
                          Section {currentSectionIndex + 1} of {assessment.sections.length}
                        </span>

                        {currentSectionIndex < assessment.sections.length - 1 ? (
                          <Button
                            onClick={goToNextSection}
                            className="btn-primary"
                          >
                            Next
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        ) : (
                          <Button
                            onClick={() => {
                              if (validateCurrentSection()) {
                                console.log('Assessment completed!', responses);
                              }
                            }}
                            className="btn-primary"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Submit
                          </Button>
                        )}
                      </motion.div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            )}

            {/* Empty State */}
            {assessment.sections.length === 0 && (
              <div className="p-12 text-center">
                <div className="w-16 h-16 mx-auto bg-gradient-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Play className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  No sections yet
                </h3>
                <p className="text-foreground-muted">
                  Add sections and questions to see the live preview
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};