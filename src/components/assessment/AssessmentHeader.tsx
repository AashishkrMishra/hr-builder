import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Edit3, Check, X, Calendar, User } from 'lucide-react';
import { Assessment } from '@/types/assessment';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface AssessmentHeaderProps {
  assessment: Assessment;
  onUpdateAssessment: (assessment: Assessment) => void;
}

export const AssessmentHeader: React.FC<AssessmentHeaderProps> = ({
  assessment,
  onUpdateAssessment,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [tempTitle, setTempTitle] = useState(assessment.title);
  const [tempDescription, setTempDescription] = useState(assessment.description);

  const handleSaveTitle = () => {
    onUpdateAssessment({ ...assessment, title: tempTitle });
    setIsEditingTitle(false);
  };

  const handleSaveDescription = () => {
    onUpdateAssessment({ ...assessment, description: tempDescription });
    setIsEditingDescription(false);
  };

  const handleCancelTitle = () => {
    setTempTitle(assessment.title);
    setIsEditingTitle(false);
  };

  const handleCancelDescription = () => {
    setTempDescription(assessment.description);
    setIsEditingDescription(false);
  };

  return (
    <motion.div
      className="card-glass p-6 space-y-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Title */}
      <div className="space-y-2">
        {isEditingTitle ? (
          <motion.div 
            className="space-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Input
              value={tempTitle}
              onChange={(e) => setTempTitle(e.target.value)}
              className="input-glass text-2xl font-bold"
              placeholder="Enter assessment title..."
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveTitle();
                if (e.key === 'Escape') handleCancelTitle();
              }}
            />
            <div className="flex items-center gap-2">
              <Button 
                size="sm" 
                onClick={handleSaveTitle}
                className="btn-primary h-8"
              >
                <Check className="w-3 h-3 mr-1" />
                Save
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleCancelTitle}
                className="btn-secondary h-8"
              >
                <X className="w-3 h-3 mr-1" />
                Cancel
              </Button>
            </div>
          </motion.div>
        ) : (
          <div className="group flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">
              {assessment.title || 'Untitled Assessment'}
            </h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditingTitle(true)}
              className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 hover:bg-background-tertiary"
            >
              <Edit3 className="w-3 h-3" />
            </Button>
          </div>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        {isEditingDescription ? (
          <motion.div 
            className="space-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Textarea
              value={tempDescription}
              onChange={(e) => setTempDescription(e.target.value)}
              className="input-glass resize-none"
              placeholder="Enter assessment description..."
              rows={3}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.ctrlKey) handleSaveDescription();
                if (e.key === 'Escape') handleCancelDescription();
              }}
            />
            <div className="flex items-center gap-2">
              <Button 
                size="sm" 
                onClick={handleSaveDescription}
                className="btn-primary h-8"
              >
                <Check className="w-3 h-3 mr-1" />
                Save
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleCancelDescription}
                className="btn-secondary h-8"
              >
                <X className="w-3 h-3 mr-1" />
                Cancel
              </Button>
            </div>
          </motion.div>
        ) : (
          <div className="group flex items-start gap-3">
            <p className="text-foreground-muted leading-relaxed">
              {assessment.description || 'Click to add a description for this assessment...'}
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditingDescription(true)}
              className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 hover:bg-background-tertiary flex-shrink-0"
            >
              <Edit3 className="w-3 h-3" />
            </Button>
          </div>
        )}
      </div>

      {/* Metadata */}
      <div className="flex items-center gap-6 text-sm text-foreground-muted pt-2 border-t border-border">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          <span>Created {new Date(assessment.createdAt).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <Edit3 className="w-4 h-4" />
          <span>Modified {new Date(assessment.updatedAt).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <User className="w-4 h-4" />
          <span>{assessment.sections.reduce((acc, section) => acc + section.questions.length, 0)} questions</span>
        </div>
      </div>
    </motion.div>
  );
};