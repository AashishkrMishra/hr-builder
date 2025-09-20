import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { createPortal } from 'react-dom';
import { 
  Settings, 
  Eye, 
  Code, 
  Save, 
  Download,
  Upload,
  Plus,
  Sparkles
} from 'lucide-react';
import { Assessment, Section, Question } from '@/types/assessment';
import { BuilderSidebar } from './BuilderSidebar';
import { SectionBuilder } from './SectionBuilder';
import { LivePreview } from './LivePreview';
import { AssessmentHeader } from './AssessmentHeader';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface AssessmentBuilderProps {
  assessment: Assessment;
  onUpdateAssessment: (assessment: Assessment) => void;
}

export const AssessmentBuilder: React.FC<AssessmentBuilderProps> = ({
  assessment,
  onUpdateAssessment,
}) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isPreviewVisible, setIsPreviewVisible] = useState(true);
  const [draggedItem, setDraggedItem] = useState<Section | Question | null>(null);
  const { toast } = useToast();

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    // Find the dragged item from sections or questions
    const item = findItemById(event.active.id as string);
    setDraggedItem(item);
  }, [assessment]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) {
      setActiveId(null);
      setDraggedItem(null);
      return;
    }

    // Handle reordering logic here
    const updatedAssessment = reorderItems(assessment, active.id as string, over.id as string);
    onUpdateAssessment(updatedAssessment);
    
    setActiveId(null);
    setDraggedItem(null);
    
    toast({
      title: "Items reordered",
      description: "Your changes have been saved automatically.",
    });
  }, [assessment, onUpdateAssessment, toast]);

  const findItemById = (id: string): Section | Question | null => {
    // Find section
    const section = assessment.sections.find(s => s.id === id);
    if (section) return section;
    
    // Find question
    for (const section of assessment.sections) {
      const question = section.questions.find(q => q.id === id);
      if (question) return question;
    }
    
    return null;
  };

  const reorderItems = (assessment: Assessment, activeId: string, overId: string): Assessment => {
    // Implementation for reordering sections and questions
    // This would be more complex in a real implementation
    return assessment;
  };

  const handleSave = () => {
    // Save to localStorage or API
    localStorage.setItem(`assessment-${assessment.id}`, JSON.stringify(assessment));
    toast({
      title: "Assessment saved",
      description: "Your changes have been saved successfully.",
    });
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(assessment, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `${assessment.title.replace(/\s+/g, '-').toLowerCase()}-assessment.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();

    toast({
      title: "Assessment exported",
      description: "Assessment has been downloaded as JSON file.",
    });
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Top Navigation Bar */}
      <motion.header 
        className="h-16 border-b border-border bg-background-secondary/80 backdrop-blur-lg sticky top-0 z-50"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="h-full px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-lg font-semibold text-foreground">Assessment Builder</h1>
            </div>
            
            <div className="h-6 w-px bg-border" />
            
            <div className="text-sm text-foreground-muted">
              {assessment.title || 'Untitled Assessment'}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={() => setIsPreviewVisible(!isPreviewVisible)}
              className="btn-secondary"
            >
              <Eye className="w-4 h-4 mr-2" />
              {isPreviewVisible ? 'Hide Preview' : 'Show Preview'}
            </Button>
            
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={handleSave}
              className="btn-secondary"
            >
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
            
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={handleExport}
              className="btn-secondary"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Main Content Area */}
      <div className="flex h-[calc(100vh-4rem)]">
        <DndContext
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          {/* Left Panel - Builder */}
          <motion.div 
            className={`${isPreviewVisible ? 'w-1/2' : 'w-full'} border-r border-border bg-background transition-all duration-300`}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <div className="h-full flex">
              {/* Sidebar */}
              <div className="w-80 border-r border-border bg-background-secondary">
                <BuilderSidebar 
                  assessment={assessment}
                  onUpdateAssessment={onUpdateAssessment}
                  selectedQuestion={selectedQuestion}
                  onSelectQuestion={setSelectedQuestion}
                />
              </div>
              
              {/* Main Builder Area */}
              <div className="flex-1 overflow-auto custom-scrollbar">
                <div className="p-6 space-y-6">
                  <AssessmentHeader 
                    assessment={assessment}
                    onUpdateAssessment={onUpdateAssessment}
                  />
                  
                  <SortableContext 
                    items={assessment.sections.map(s => s.id)} 
                    strategy={verticalListSortingStrategy}
                  >
                    <AnimatePresence>
                      {assessment.sections.map((section, index) => (
                        <motion.div
                          key={section.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                          <SectionBuilder
                            section={section}
                            assessment={assessment}
                            onUpdateAssessment={onUpdateAssessment}
                            selectedQuestion={selectedQuestion}
                            onSelectQuestion={setSelectedQuestion}
                          />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </SortableContext>
                  
                  {/* Add Section Button */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Button 
                      variant="outline" 
                      className="w-full h-16 btn-secondary border-dashed hover:border-primary"
                      onClick={() => {
                        const newSection: Section = {
                          id: `section-${Date.now()}`,
                          title: 'New Section',
                          description: '',
                          order: assessment.sections.length,
                          questions: [],
                          isExpanded: true,
                        };
                        onUpdateAssessment({
                          ...assessment,
                          sections: [...assessment.sections, newSection],
                        });
                      }}
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Add New Section
                    </Button>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Panel - Live Preview */}
          <AnimatePresence>
            {isPreviewVisible && (
              <motion.div 
                className="w-1/2 bg-background-tertiary"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 20, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <LivePreview
                  assessment={assessment}
                  previewMode={previewMode}
                  onPreviewModeChange={setPreviewMode}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Drag Overlay */}
          {createPortal(
            <DragOverlay>
              {draggedItem && (
                <motion.div 
                  className="card-glass p-4 shadow-floating cursor-grabbing"
                  initial={{ scale: 1.05, rotate: 5 }}
                  animate={{ scale: 1.1, rotate: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {'title' in draggedItem ? (
                    <div className="font-medium">{draggedItem.title}</div>
                  ) : (
                    <div className="font-medium">Question</div>
                  )}
                </motion.div>
              )}
            </DragOverlay>,
            document.body
          )}
        </DndContext>
      </div>
    </div>
  );
};