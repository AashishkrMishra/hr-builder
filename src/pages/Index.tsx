import React from 'react';
import { motion } from 'framer-motion';
import { AssessmentBuilder } from '@/components/assessment/AssessmentBuilder';
import { useAssessment } from '@/hooks/useAssessment';

const Index = () => {
  const { assessment, updateAssessment } = useAssessment();

  return (
    <motion.div 
      className="min-h-screen bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <AssessmentBuilder
        assessment={assessment}
        onUpdateAssessment={updateAssessment}
      />
    </motion.div>
  );
};

export default Index;
