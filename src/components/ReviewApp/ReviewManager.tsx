import React, { useState, useEffect } from 'react';
import { ReviewSet, ReviewMode, Student } from '../../types';
import {
  loadReviewSetsFromStorage,
  saveReviewSetsToStorage,
} from '../../lib/storage';
import { MillionaireReviewer } from './MillionaireReviewer';
import { QuizBeeApp } from './QuizBeeApp';
import { FlashcardGame } from './FlashcardGame';
import { QuestionBankEditor } from './QuestionBankEditor';

interface ReviewManagerProps {
  students?: Student[];
  className?: string;
  initialMode?: ReviewMode | 'editor';
}

export const ReviewManager: React.FC<ReviewManagerProps> = ({
  students = [],
  className = 'Active Class',
  initialMode = 'millionaire',
}) => {
  const [reviewSets, setReviewSets] = useState<ReviewSet[]>(() => loadReviewSetsFromStorage());
  const [activeSetId, setActiveSetId] = useState<string>(() => {
    const sets = loadReviewSetsFromStorage();
    return sets[0]?.id || '';
  });

  const [activeMode, setActiveMode] = useState<ReviewMode | 'editor'>(initialMode);

  useEffect(() => {
    if (initialMode) {
      setActiveMode(initialMode);
    }
  }, [initialMode]);

  // Handle saving modified review sets
  const handleSaveSets = (updatedSets: ReviewSet[]) => {
    setReviewSets(updatedSets);
    saveReviewSetsToStorage(updatedSets);
  };

  // Handle updating a single review set
  const handleUpdateActiveSet = (updatedSet: ReviewSet) => {
    const updatedSets = reviewSets.map((s) => (s.id === updatedSet.id ? updatedSet : s));
    handleSaveSets(updatedSets);
  };

  const activeSet = reviewSets.find((s) => s.id === activeSetId) || reviewSets[0];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {activeMode === 'millionaire' && activeSet && (
        <MillionaireReviewer
          reviewSet={activeSet}
          reviewSets={reviewSets}
          activeSetId={activeSetId}
          onSelectSet={setActiveSetId}
          onUpdateReviewSet={handleUpdateActiveSet}
          onEditSet={() => setActiveMode('editor')}
        />
      )}

      {activeMode === 'quizbee' && activeSet && (
        <QuizBeeApp
          reviewSet={activeSet}
          reviewSets={reviewSets}
          activeSetId={activeSetId}
          onSelectSet={setActiveSetId}
          onUpdateReviewSet={handleUpdateActiveSet}
          students={students}
          onEditSet={() => setActiveMode('editor')}
        />
      )}

      {activeMode === 'flashcard' && activeSet && (
        <FlashcardGame
          reviewSet={activeSet}
          reviewSets={reviewSets}
          activeSetId={activeSetId}
          onSelectSet={setActiveSetId}
          onUpdateReviewSet={handleUpdateActiveSet}
          onEditSet={() => setActiveMode('editor')}
        />
      )}

      {activeMode === 'editor' && (
        <QuestionBankEditor
          reviewSets={reviewSets}
          activeSetId={activeSetId}
          onSelectSet={setActiveSetId}
          onSaveSets={handleSaveSets}
        />
      )}
    </div>
  );
};
