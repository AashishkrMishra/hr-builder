import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  GripVertical,
  Edit3,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  Circle,
  CheckCircle,
  Type,
  FileText,
  Hash,
  Upload,
  Plus,
  X,
} from 'lucide-react';
import { Question, QuestionType } from '@/types/assessment';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface QuestionBuilderProps {
  question: Question;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<Question>) => void;
  onDelete: () => void;
}

const questionTypeIcons = {
  'single-choice': Circle,
  'multi-choice': CheckCircle,
  'short-text': Type,
  'long-text': FileText,
  'numeric': Hash,
  'file-upload': Upload,
};

const questionTypeLabels = {
  'single-choice': 'Single Choice',
  'multi-choice': 'Multiple Choice',
  'short-text': 'Short Text',
  'long-text': 'Long Text',
  'numeric': 'Numeric',
  'file-upload': 'File Upload',
};

export const QuestionBuilder: React.FC<QuestionBuilderProps> = ({
  question,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [tempTitle, setTempTitle] = useState(question.title);
  const [tempDescription, setTempDescription] = useState(question.description || '');

  const IconComponent = questionTypeIcons[question.type];

  const handleSaveTitle = () => {
    onUpdate({ title: tempTitle });
    setIsEditingTitle(false);
  };

  const handleSaveDescription = () => {
    onUpdate({ description: tempDescription });
    setIsEditingDescription(false);
  };

  const addOption = () => {
    const currentOptions = question.options || [];
    const newOptions = [...currentOptions, `Option ${currentOptions.length + 1}`];
    onUpdate({ options: newOptions });
  };

  const updateOption = (index: number, value: string) => {
    const currentOptions = question.options || [];
    const newOptions = [...currentOptions];
    newOptions[index] = value;
    onUpdate({ options: newOptions });
  };

  const removeOption = (index: number) => {
    const currentOptions = question.options || [];
    const newOptions = currentOptions.filter((_, i) => i !== index);
    onUpdate({ options: newOptions });
  };

  const duplicateQuestion = () => {
    // This would need to be handled by the parent component
    // For now, we'll just show a visual feedback
    console.log('Duplicate question:', question.id);
  };

  return (
    <motion.div
      className={`card-glass transition-all duration-200 ${
        isSelected ? 'border-primary shadow-glow' : ''
      }`}
      whileHover={{ scale: 1.01 }}
      layout
    >
      {/* Question Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          {/* Drag Handle */}
          <div className="drag-handle p-1 rounded hover:bg-background-tertiary">
            <GripVertical className="w-4 h-4" />
          </div>

          {/* Question Type Icon */}
          <div className="w-8 h-8 rounded-lg bg-gradient-primary/10 flex items-center justify-center">
            <IconComponent className="w-4 h-4 text-primary" />
          </div>

          {/* Question Title */}
          <div className="flex-1">
            {isEditingTitle ? (
              <Input
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                onBlur={handleSaveTitle}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveTitle();
                  if (e.key === 'Escape') {
                    setTempTitle(question.title);
                    setIsEditingTitle(false);
                  }
                }}
                className="input-glass font-medium"
                autoFocus
              />
            ) : (
              <div className="group flex items-center gap-2">
                <h4 className="font-medium text-foreground">
                  {question.title}
                </h4>
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

          {/* Question Type Label */}
          <span className="text-xs text-foreground-muted bg-background-tertiary px-2 py-1 rounded">
            {questionTypeLabels[question.type]}
          </span>

          {/* Question Actions */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onSelect}
              className={`h-8 w-8 p-0 ${
                isSelected ? 'bg-primary/20 text-primary' : 'hover:bg-background-tertiary'
              }`}
              title={isSelected ? 'Hide details' : 'Show details'}
            >
              {isSelected ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={duplicateQuestion}
              className="h-8 w-8 p-0 hover:bg-background-tertiary"
              title="Duplicate question"
            >
              <Copy className="w-3 h-3" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="h-8 w-8 p-0 hover:bg-danger/20 hover:text-danger"
              title="Delete question"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Question Description */}
        {(question.description || isEditingDescription) && (
          <div className="mt-3 ml-11">
            {isEditingDescription ? (
              <Textarea
                value={tempDescription}
                onChange={(e) => setTempDescription(e.target.value)}
                onBlur={handleSaveDescription}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.ctrlKey) handleSaveDescription();
                  if (e.key === 'Escape') {
                    setTempDescription(question.description || '');
                    setIsEditingDescription(false);
                  }
                }}
                className="input-glass resize-none"
                rows={2}
                placeholder="Question description..."
                autoFocus
              />
            ) : (
              <div className="group flex items-start gap-2">
                <p className="text-sm text-foreground-muted">
                  {question.description || 'Click to add description...'}
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

      {/* Question Details */}
      {isSelected && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <div className="p-4 space-y-4 border-b border-border bg-background-secondary/30">
            {/* Question Type Selector */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Question Type</Label>
              <Select
                value={question.type}
                onValueChange={(value: QuestionType) => onUpdate({ type: value })}
              >
                <SelectTrigger className="input-glass">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(questionTypeLabels).map(([type, label]) => (
                    <SelectItem key={type} value={type}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Options for Choice Questions */}
            {(question.type === 'single-choice' || question.type === 'multi-choice') && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Options</Label>
                <div className="space-y-2">
                  {(question.options || []).map((option, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-2"
                    >
                      <Input
                        value={option}
                        onChange={(e) => updateOption(index, e.target.value)}
                        className="input-glass flex-1"
                        placeholder={`Option ${index + 1}`}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeOption(index)}
                        className="h-8 w-8 p-0 hover:bg-danger/20 hover:text-danger"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </motion.div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addOption}
                    className="btn-secondary"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add Option
                  </Button>
                </div>
              </div>
            )}

            {/* Placeholder for Text Questions */}
            {(question.type === 'short-text' || question.type === 'long-text') && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Placeholder Text</Label>
                <Input
                  value={question.placeholder || ''}
                  onChange={(e) => onUpdate({ placeholder: e.target.value })}
                  className="input-glass"
                  placeholder="Enter placeholder text..."
                />
              </div>
            )}

            {/* Validation Rules for Numeric Questions */}
            {question.type === 'numeric' && (
              <div className="space-y-3">
                <Label className="text-sm font-medium">Validation Rules</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-foreground-muted">Min Value</Label>
                    <Input
                      type="number"
                      value={question.validation?.minValue || ''}
                      onChange={(e) => onUpdate({
                        validation: {
                          ...question.validation,
                          minValue: e.target.value ? Number(e.target.value) : undefined,
                        }
                      })}
                      className="input-glass"
                      placeholder="No minimum"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-foreground-muted">Max Value</Label>
                    <Input
                      type="number"
                      value={question.validation?.maxValue || ''}
                      onChange={(e) => onUpdate({
                        validation: {
                          ...question.validation,
                          maxValue: e.target.value ? Number(e.target.value) : undefined,
                        }
                      })}
                      className="input-glass"
                      placeholder="No maximum"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Required Toggle */}
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Required Question</Label>
              <Switch
                checked={question.required}
                onCheckedChange={(checked) => onUpdate({ required: checked })}
              />
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};