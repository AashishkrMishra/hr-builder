import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Settings, 
  Layers, 
  Type, 
  List, 
  FileText, 
  Hash, 
  Upload,
  CheckCircle,
  Circle,
  Sparkles,
  Eye,
  EyeOff
} from 'lucide-react';
import { Assessment, Question, QuestionType, QuestionTypeConfig } from '@/types/assessment';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

interface BuilderSidebarProps {
  assessment: Assessment;
  onUpdateAssessment: (assessment: Assessment) => void;
  selectedQuestion: string | null;
  onSelectQuestion: (questionId: string | null) => void;
}

const questionTypes: QuestionTypeConfig[] = [
  {
    type: 'single-choice',
    label: 'Single Choice',
    description: 'Radio buttons for single selection',
    icon: 'Circle',
    defaultProps: {
      type: 'single-choice',
      title: 'New Single Choice Question',
      required: false,
      options: ['Option 1', 'Option 2', 'Option 3'],
    },
  },
  {
    type: 'multi-choice',
    label: 'Multiple Choice',
    description: 'Checkboxes for multiple selections',
    icon: 'CheckCircle',
    defaultProps: {
      type: 'multi-choice',
      title: 'New Multiple Choice Question',
      required: false,
      options: ['Option 1', 'Option 2', 'Option 3'],
    },
  },
  {
    type: 'short-text',
    label: 'Short Text',
    description: 'Single line text input',
    icon: 'Type',
    defaultProps: {
      type: 'short-text',
      title: 'New Short Text Question',
      required: false,
      placeholder: 'Enter your answer...',
    },
  },
  {
    type: 'long-text',
    label: 'Long Text',
    description: 'Multi-line text area',
    icon: 'FileText',
    defaultProps: {
      type: 'long-text',
      title: 'New Long Text Question',
      required: false,
      placeholder: 'Enter your detailed answer...',
    },
  },
  {
    type: 'numeric',
    label: 'Numeric',
    description: 'Number input with validation',
    icon: 'Hash',
    defaultProps: {
      type: 'numeric',
      title: 'New Numeric Question',
      required: false,
      placeholder: 'Enter a number...',
    },
  },
  {
    type: 'file-upload',
    label: 'File Upload',
    description: 'File attachment input',
    icon: 'Upload',
    defaultProps: {
      type: 'file-upload',
      title: 'New File Upload Question',
      required: false,
    },
  },
];

const getIconComponent = (iconName: string) => {
  const icons = {
    Circle,
    CheckCircle,
    Type,
    FileText,
    Hash,
    Upload,
  };
  return icons[iconName as keyof typeof icons] || Circle;
};

export const BuilderSidebar: React.FC<BuilderSidebarProps> = ({
  assessment,
  onUpdateAssessment,
  selectedQuestion,
  onSelectQuestion,
}) => {
  const [activeTab, setActiveTab] = useState<'questions' | 'settings'>('questions');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredQuestionTypes = questionTypes.filter(type =>
    type.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    type.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addQuestion = (sectionId: string, questionType: QuestionTypeConfig) => {
    const newQuestion: Question = {
      id: `question-${Date.now()}`,
      ...questionType.defaultProps,
      order: 0, // Will be set properly when added to section
    } as Question;

    const updatedSections = assessment.sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          questions: [...section.questions, { ...newQuestion, order: section.questions.length }],
        };
      }
      return section;
    });

    onUpdateAssessment({
      ...assessment,
      sections: updatedSections,
    });
  };

  const selectedQuestionData = selectedQuestion ? 
    assessment.sections
      .flatMap(s => s.questions)
      .find(q => q.id === selectedQuestion) : null;

  const updateQuestion = (questionId: string, updates: Partial<Question>) => {
    const updatedSections = assessment.sections.map(section => ({
      ...section,
      questions: section.questions.map(question =>
        question.id === questionId ? { ...question, ...updates } : question
      ),
    }));

    onUpdateAssessment({
      ...assessment,
      sections: updatedSections,
    });
  };

  return (
    <div className="h-full flex flex-col bg-background-secondary">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 rounded bg-gradient-primary flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-white" />
          </div>
          <span className="font-medium text-foreground">Builder Tools</span>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex bg-background-tertiary rounded-lg p-1">
          <button
            onClick={() => setActiveTab('questions')}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              activeTab === 'questions'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-foreground-muted hover:text-foreground'
            }`}
          >
            <Layers className="w-4 h-4" />
            Questions
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              activeTab === 'settings'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-foreground-muted hover:text-foreground'
            }`}
          >
            <Settings className="w-4 h-4" />
            Settings
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto custom-scrollbar">
        <AnimatePresence mode="wait">
          {activeTab === 'questions' && (
            <motion.div
              key="questions"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              className="p-4 space-y-4"
            >
              {/* Search */}
              <div>
                <Label htmlFor="search" className="text-sm font-medium mb-2">
                  Search Question Types
                </Label>
                <Input
                  id="search"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-glass"
                />
              </div>

              {/* Question Types */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Add Question Type</Label>
                <div className="space-y-2">
                  {filteredQuestionTypes.map((questionType, index) => {
                    const IconComponent = getIconComponent(questionType.icon);
                    return (
                      <motion.div
                        key={questionType.type}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                      >
                        <button
                          onClick={() => {
                            if (assessment.sections.length === 0) {
                              // Create a default section first
                              const newSection = {
                                id: `section-${Date.now()}`,
                                title: 'Section 1',
                                description: '',
                                order: 0,
                                questions: [],
                                isExpanded: true,
                              };
                              onUpdateAssessment({
                                ...assessment,
                                sections: [newSection],
                              });
                              setTimeout(() => addQuestion(newSection.id, questionType), 100);
                            } else {
                              addQuestion(assessment.sections[0].id, questionType);
                            }
                          }}
                          className="question-type-card w-full p-3 text-left group"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-primary/10 flex items-center justify-center group-hover:bg-gradient-primary group-hover:text-white transition-all duration-200">
                              <IconComponent className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">
                                {questionType.label}
                              </div>
                              <div className="text-xs text-foreground-muted mt-1">
                                {questionType.description}
                              </div>
                            </div>
                            <Plus className="w-4 h-4 text-foreground-muted group-hover:text-primary transition-colors" />
                          </div>
                        </button>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Selected Question Settings */}
              {selectedQuestionData && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <Separator />
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <Label className="text-sm font-medium">Selected Question</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onSelectQuestion(null)}
                        className="h-6 w-6 p-0 hover:bg-background-tertiary"
                      >
                        <EyeOff className="w-3 h-3" />
                      </Button>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="question-title" className="text-xs text-foreground-muted mb-1">
                          Question Title
                        </Label>
                        <Input
                          id="question-title"
                          value={selectedQuestionData.title}
                          onChange={(e) => updateQuestion(selectedQuestion, { title: e.target.value })}
                          className="input-glass text-sm"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="question-description" className="text-xs text-foreground-muted mb-1">
                          Description (Optional)
                        </Label>
                        <Textarea
                          id="question-description"
                          value={selectedQuestionData.description || ''}
                          onChange={(e) => updateQuestion(selectedQuestion, { description: e.target.value })}
                          className="input-glass text-sm resize-none"
                          rows={2}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="question-required" className="text-xs text-foreground-muted">
                          Required Question
                        </Label>
                        <Switch
                          id="question-required"
                          checked={selectedQuestionData.required}
                          onCheckedChange={(checked) => updateQuestion(selectedQuestion, { required: checked })}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              className="p-4 space-y-4"
            >
              <div>
                <Label className="text-sm font-medium mb-3 block">Assessment Settings</Label>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="assessment-title" className="text-xs text-foreground-muted mb-1">
                      Assessment Title
                    </Label>
                    <Input
                      id="assessment-title"
                      value={assessment.title}
                      onChange={(e) => onUpdateAssessment({ ...assessment, title: e.target.value })}
                      className="input-glass"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="assessment-description" className="text-xs text-foreground-muted mb-1">
                      Description
                    </Label>
                    <Textarea
                      id="assessment-description"
                      value={assessment.description}
                      onChange={(e) => onUpdateAssessment({ ...assessment, description: e.target.value })}
                      className="input-glass resize-none"
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};