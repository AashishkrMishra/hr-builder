import { useState, useEffect } from 'react';
import { Assessment, Section, Question } from '@/types/assessment';

const createSampleAssessment = (): Assessment => {
  const now = new Date();
  
  return {
    id: 'sample-assessment-1',
    jobId: 'job-frontend-developer',
    title: 'Frontend Developer Assessment',
    description: 'Comprehensive assessment for frontend developer candidates covering technical skills, problem-solving abilities, and cultural fit.',
    sections: [
      {
        id: 'section-technical',
        title: 'Technical Skills',
        description: 'Evaluate the candidate\'s technical knowledge and programming skills.',
        order: 0,
        isExpanded: true,
        questions: [
          {
            id: 'question-js-experience',
            type: 'single-choice',
            title: 'How many years of JavaScript experience do you have?',
            description: 'Include both professional and personal project experience.',
            required: true,
            order: 0,
            options: ['Less than 1 year', '1-2 years', '3-5 years', '5+ years'],
          },
          {
            id: 'question-frameworks',
            type: 'multi-choice',
            title: 'Which frontend frameworks have you worked with?',
            description: 'Select all that apply.',
            required: true,
            order: 1,
            options: ['React', 'Vue.js', 'Angular', 'Svelte', 'Next.js', 'Nuxt.js'],
          },
          {
            id: 'question-code-sample',
            type: 'long-text',
            title: 'Describe a challenging technical problem you solved recently',
            description: 'Include the problem, your approach, and the outcome.',
            required: true,
            order: 2,
            placeholder: 'Describe the problem, your solution approach, technologies used, and the final outcome...',
            validation: {
              minLength: 100,
              maxLength: 1000,
            },
          },
        ],
      },
      {
        id: 'section-experience',
        title: 'Professional Experience',
        description: 'Tell us about your background and career journey.',
        order: 1,
        isExpanded: false,
        questions: [
          {
            id: 'question-years-experience',
            type: 'numeric',
            title: 'Total years of professional development experience',
            required: true,
            order: 0,
            validation: {
              minValue: 0,
              maxValue: 50,
            },
          },
          {
            id: 'question-portfolio',
            type: 'short-text',
            title: 'Portfolio or GitHub URL',
            description: 'Share a link to your best work.',
            required: false,
            order: 1,
            placeholder: 'https://github.com/username or https://portfolio.com',
          },
          {
            id: 'question-resume',
            type: 'file-upload',
            title: 'Upload your resume',
            description: 'Please upload your most recent resume (PDF preferred).',
            required: true,
            order: 2,
          },
        ],
      },
      {
        id: 'section-culture',
        title: 'Culture & Values',
        description: 'Help us understand if we\'re a good mutual fit.',
        order: 2,
        isExpanded: false,
        questions: [
          {
            id: 'question-work-style',
            type: 'single-choice',
            title: 'What work environment do you thrive in?',
            required: true,
            order: 0,
            options: [
              'Collaborative team environment',
              'Independent work with minimal supervision',
              'Mix of both collaboration and independent work',
              'Highly structured with clear processes',
            ],
          },
          {
            id: 'question-motivation',
            type: 'long-text',
            title: 'What motivates you as a developer?',
            description: 'Share what drives your passion for development.',
            required: true,
            order: 1,
            placeholder: 'Tell us about what excites you most about software development...',
            validation: {
              minLength: 50,
              maxLength: 500,
            },
          },
        ],
      },
    ],
    createdAt: now,
    updatedAt: now,
  };
};

export const useAssessment = () => {
  const [assessment, setAssessment] = useState<Assessment>(() => {
    // Try to load from localStorage first
    const saved = localStorage.getItem('current-assessment');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          createdAt: new Date(parsed.createdAt),
          updatedAt: new Date(parsed.updatedAt),
        };
      } catch (error) {
        console.error('Failed to parse saved assessment:', error);
      }
    }
    
    // Fallback to sample assessment
    return createSampleAssessment();
  });

  const updateAssessment = (newAssessment: Assessment) => {
    const updatedAssessment = {
      ...newAssessment,
      updatedAt: new Date(),
    };
    
    setAssessment(updatedAssessment);
    
    // Save to localStorage
    localStorage.setItem('current-assessment', JSON.stringify(updatedAssessment));
  };

  const createNewAssessment = () => {
    const newAssessment: Assessment = {
      id: `assessment-${Date.now()}`,
      jobId: '',
      title: 'New Assessment',
      description: 'Enter a description for your assessment...',
      sections: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    updateAssessment(newAssessment);
    return newAssessment;
  };

  const loadAssessment = (assessmentData: Assessment) => {
    updateAssessment(assessmentData);
  };

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      localStorage.setItem('current-assessment', JSON.stringify(assessment));
    }, 30000);

    return () => clearInterval(interval);
  }, [assessment]);

  return {
    assessment,
    updateAssessment,
    createNewAssessment,
    loadAssessment,
  };
};