import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  ChevronDown,
  ChevronRight,
  GripVertical,
  Plus,
  Edit3,
  Trash2,
  Copy,
  Eye,
} from 'lucide-react';
import { Assessment, Section, Question } from '@/types/assessment';
import { QuestionBuilder } from './QuestionBuilder';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface SectionBuilderProps {
  section: Section;
  assessment: Assessment;
  onUpdateAssessment: (assessment: Assessment) => void;
  selectedQuestion: string | null;
  onSelectQuestion: (questionId: string | null) => void;
}

export const SectionBuilder: React.FC<SectionBuilderProps> = ({
  section,
  assessment,
  onUpdateAssessment,
  selectedQuestion,
  onSelectQuestion,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [tempTitle, setTempTitle] = useState(section.title);
  const [tempDescription, setTempDescription] = useState(section.description || '');

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const updateSection = (updates: Partial<Section>) => {
    const updatedSections = assessment.sections.map(s =>
      s.id === section.id ? { ...s, ...updates } : s
    );
    onUpdateAssessment({ ...assessment, sections: updatedSections });
  };

  const deleteSection = () => {
    const updatedSections = assessment.sections.filter(s => s.id !== section.id);
    onUpdateAssessment({ ...assessment, sections: updatedSections });
  };

  const duplicateSection = () => {
    const newSection: Section = {
      ...section,
      id: `section-${Date.now()}`,
      title: `${section.title} (Copy)`,
      order: assessment.sections.length,
      questions: section.questions.map(q => ({
        ...q,
        id: `question-${Date.now()}-${Math.random()}`,
      })),
    };
    
    onUpdateAssessment({
      ...assessment,
      sections: [...assessment.sections, newSection],
    });
  };

  const addQuestion = () => {
    const newQuestion: Question = {
      id: `question-${Date.now()}`,
      type: 'short-text',
      title: 'New Question',
      description: '',
      required: false,
      order: section.questions.length,
      placeholder: 'Enter your answer...',
    };

    updateSection({
      questions: [...section.questions, newQuestion],
    });
  };

  const updateQuestion = (questionId: string, updates: Partial<Question>) => {
    const updatedQuestions = section.questions.map(q =>
      q.id === questionId ? { ...q, ...updates } : q
    );
    updateSection({ questions: updatedQuestions });
  };

  const deleteQuestion = (questionId: string) => {
    const updatedQuestions = section.questions.filter(q => q.id !== questionId);
    updateSection({ questions: updatedQuestions });
    if (selectedQuestion === questionId) {
      onSelectQuestion(null);
    }
  };

  const handleSaveTitle = () => {
    updateSection({ title: tempTitle });
    setIsEditingTitle(false);
  };

  const handleSaveDescription = () => {
    updateSection({ description: tempDescription });
    setIsEditingDescription(false);
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      className={`card-glass transition-all duration-200 ${
        isDragging ? 'opacity-50 scale-105 shadow-floating' : ''
      }`}
      layout
    >
      {/* Section Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          {/* Drag Handle */}
          <div
            {...attributes}
            {...listeners}
            className="drag-handle p-1 rounded hover:bg-background-tertiary"
          >
            <GripVertical className="w-4 h-4" />
          </div>

          {/* Expand/Collapse Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => updateSection({ isExpanded: !section.isExpanded })}
            className="h-8 w-8 p-0 hover:bg-background-tertiary"
          >
            {section.isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </Button>

          {/* Section Title */}
          <div className="flex-1">
            {isEditingTitle ? (
              <Input
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                onBlur={handleSaveTitle}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveTitle();
                  if (e.key === 'Escape') {
                    setTempTitle(section.title);
                    setIsEditingTitle(false);
                  }
                }}
                className="input-glass text-lg font-medium"
                autoFocus
              />
            ) : (
              <div className="group flex items-center gap-2">
                <h3 className="text-lg font-medium text-foreground">
                  {section.title}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditingTitle(true)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                >
                  <Edit3 className="w-3 h-3" />
                </Button>
              </div>
            )}
          </div>

          {/* Section Actions */}
          <div className="flex items-center gap-1">
            <span className="text-sm text-foreground-muted px-2">
              {section.questions.length} questions
            </span>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={duplicateSection}
              className="h-8 w-8 p-0 hover:bg-background-tertiary"
              title="Duplicate section"
            >
              <Copy className="w-3 h-3" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={deleteSection}
              className="h-8 w-8 p-0 hover:bg-danger/20 hover:text-danger"
              title="Delete section"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Section Description */}
        {(section.description || isEditingDescription) && (
          <div className="mt-3">
            {isEditingDescription ? (
              <Textarea
                value={tempDescription}
                onChange={(e) => setTempDescription(e.target.value)}
                onBlur={handleSaveDescription}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.ctrlKey) handleSaveDescription();
                  if (e.key === 'Escape') {
                    setTempDescription(section.description || '');
                    setIsEditingDescription(false);
                  }
                }}
                className="input-glass resize-none"
                rows={2}
                placeholder="Section description..."
                autoFocus
              />
            ) : (
              <div className="group flex items-start gap-2">
                <p className="text-sm text-foreground-muted">
                  {section.description || 'Click to add description...'}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditingDescription(true)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                >
                  <Edit3 className="w-2 h-2" />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Section Content */}
      <AnimatePresence>
        {section.isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-4 space-y-4">
              {/* Questions */}
              <AnimatePresence>
                {section.questions.map((question, index) => (
                  <motion.div
                    key={question.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                  >
                    <QuestionBuilder
                      question={question}
                      isSelected={selectedQuestion === question.id}
                      onSelect={() => onSelectQuestion(
                        selectedQuestion === question.id ? null : question.id
                      )}
                      onUpdate={(updates) => updateQuestion(question.id, updates)}
                      onDelete={() => deleteQuestion(question.id)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Add Question Button */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: section.questions.length * 0.05 + 0.1 }}
              >
                <Button
                  variant="outline"
                  onClick={addQuestion}
                  className="w-full h-12 btn-secondary border-dashed hover:border-primary"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Question
                </Button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};