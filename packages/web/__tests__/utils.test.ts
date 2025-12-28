import { describe, it, expect } from 'vitest';
import { shuffleArray, shuffleQuestionOptions, shuffleQuestionsAndOptions } from '@/lib/utils';

describe('Randomization Utils', () => {
  describe('shuffleArray', () => {
    it('should return an array of the same length', () => {
      const original = [1, 2, 3, 4, 5];
      const shuffled = shuffleArray(original);
      
      expect(shuffled).toHaveLength(original.length);
    });

    it('should contain all original elements', () => {
      const original = [1, 2, 3, 4, 5];
      const shuffled = shuffleArray(original);
      
      expect(shuffled.sort()).toEqual(original.sort());
    });

    it('should not mutate the original array', () => {
      const original = [1, 2, 3, 4, 5];
      const originalCopy = [...original];
      shuffleArray(original);
      
      expect(original).toEqual(originalCopy);
    });

    it('should handle empty arrays', () => {
      const original: number[] = [];
      const shuffled = shuffleArray(original);
      
      expect(shuffled).toEqual([]);
    });

    it('should handle single element arrays', () => {
      const original = [42];
      const shuffled = shuffleArray(original);
      
      expect(shuffled).toEqual([42]);
    });
  });

  describe('shuffleQuestionOptions', () => {
    const mockQuestion = {
      id: 'q1',
      title: 'Test Question',
      options: [
        { id: 'opt1', text: 'Option 1' },
        { id: 'opt2', text: 'Option 2' },
        { id: 'opt3', text: 'Option 3' },
        { id: 'opt4', text: 'Option 4' },
      ],
      correct_answer_ids: ['opt2', 'opt3'],
    };

    it('should return a question with the same properties', () => {
      const shuffled = shuffleQuestionOptions(mockQuestion);
      
      expect(shuffled.id).toBe(mockQuestion.id);
      expect(shuffled.title).toBe(mockQuestion.title);
      expect(shuffled.correct_answer_ids).toEqual(mockQuestion.correct_answer_ids);
    });

    it('should return options with the same length', () => {
      const shuffled = shuffleQuestionOptions(mockQuestion);
      
      expect(shuffled.options).toHaveLength(mockQuestion.options.length);
    });

    it('should contain all original options', () => {
      const shuffled = shuffleQuestionOptions(mockQuestion);
      const originalIds = mockQuestion.options.map(o => o.id).sort();
      const shuffledIds = shuffled.options.map(o => o.id).sort();
      
      expect(shuffledIds).toEqual(originalIds);
    });

    it('should not mutate the original question', () => {
      const originalCopy = JSON.parse(JSON.stringify(mockQuestion));
      shuffleQuestionOptions(mockQuestion);
      
      expect(mockQuestion).toEqual(originalCopy);
    });

    it('should keep correct_answer_ids unchanged', () => {
      const shuffled = shuffleQuestionOptions(mockQuestion);
      
      expect(shuffled.correct_answer_ids).toEqual(mockQuestion.correct_answer_ids);
    });

    it('should handle questions with no options', () => {
      const emptyQuestion = {
        id: 'q1',
        options: [],
        correct_answer_ids: [],
      };
      const shuffled = shuffleQuestionOptions(emptyQuestion);
      
      expect(shuffled.options).toEqual([]);
    });
  });

  describe('shuffleQuestionsAndOptions', () => {
    const mockQuestions = [
      {
        id: 'q1',
        title: 'Question 1',
        options: [
          { id: 'q1-opt1', text: 'Q1 Option 1' },
          { id: 'q1-opt2', text: 'Q1 Option 2' },
        ],
        correct_answer_ids: ['q1-opt1'],
      },
      {
        id: 'q2',
        title: 'Question 2',
        options: [
          { id: 'q2-opt1', text: 'Q2 Option 1' },
          { id: 'q2-opt2', text: 'Q2 Option 2' },
        ],
        correct_answer_ids: ['q2-opt2'],
      },
      {
        id: 'q3',
        title: 'Question 3',
        options: [
          { id: 'q3-opt1', text: 'Q3 Option 1' },
          { id: 'q3-opt2', text: 'Q3 Option 2' },
        ],
        correct_answer_ids: ['q3-opt1'],
      },
    ];

    it('should return questions with the same length', () => {
      const shuffled = shuffleQuestionsAndOptions(mockQuestions);
      
      expect(shuffled).toHaveLength(mockQuestions.length);
    });

    it('should contain all original questions', () => {
      const shuffled = shuffleQuestionsAndOptions(mockQuestions);
      const originalIds = mockQuestions.map(q => q.id).sort();
      const shuffledIds = shuffled.map(q => q.id).sort();
      
      expect(shuffledIds).toEqual(originalIds);
    });

    it('should shuffle options within each question', () => {
      const shuffled = shuffleQuestionsAndOptions(mockQuestions);
      
      shuffled.forEach(question => {
        const originalQuestion = mockQuestions.find(q => q.id === question.id);
        expect(question.options).toHaveLength(originalQuestion!.options.length);
        
        const originalOptionIds = originalQuestion!.options.map(o => o.id).sort();
        const shuffledOptionIds = question.options.map(o => o.id).sort();
        expect(shuffledOptionIds).toEqual(originalOptionIds);
      });
    });

    it('should preserve correct_answer_ids for each question', () => {
      const shuffled = shuffleQuestionsAndOptions(mockQuestions);
      
      shuffled.forEach(question => {
        const originalQuestion = mockQuestions.find(q => q.id === question.id);
        expect(question.correct_answer_ids).toEqual(originalQuestion!.correct_answer_ids);
      });
    });

    it('should not mutate the original questions array', () => {
      const originalCopy = JSON.parse(JSON.stringify(mockQuestions));
      shuffleQuestionsAndOptions(mockQuestions);
      
      expect(mockQuestions).toEqual(originalCopy);
    });

    it('should handle empty questions array', () => {
      const shuffled = shuffleQuestionsAndOptions([]);
      
      expect(shuffled).toEqual([]);
    });
  });

  describe('Answer validation with shuffled options', () => {
    it('should validate correct answers after shuffling - single answer', () => {
      const question = {
        id: 'q1',
        options: [
          { id: 'opt1', text: 'Wrong' },
          { id: 'opt2', text: 'Correct' },
          { id: 'opt3', text: 'Wrong' },
        ],
        correct_answer_ids: ['opt2'],
      };

      const shuffled = shuffleQuestionOptions(question);
      
      // Simular respuesta del usuario (selecciona opt2)
      const userSelection = ['opt2'];
      const isCorrect = shuffled.correct_answer_ids.includes(userSelection[0]);
      
      expect(isCorrect).toBe(true);
    });

    it('should validate incorrect answers after shuffling - single answer', () => {
      const question = {
        id: 'q1',
        options: [
          { id: 'opt1', text: 'Wrong' },
          { id: 'opt2', text: 'Correct' },
          { id: 'opt3', text: 'Wrong' },
        ],
        correct_answer_ids: ['opt2'],
      };

      const shuffled = shuffleQuestionOptions(question);
      
      // Simular respuesta del usuario (selecciona opt1)
      const userSelection = ['opt1'];
      const isCorrect = shuffled.correct_answer_ids.includes(userSelection[0]);
      
      expect(isCorrect).toBe(false);
    });

    it('should validate correct answers after shuffling - multiple answers', () => {
      const question = {
        id: 'q1',
        options: [
          { id: 'opt1', text: 'Correct 1' },
          { id: 'opt2', text: 'Wrong' },
          { id: 'opt3', text: 'Correct 2' },
          { id: 'opt4', text: 'Wrong' },
        ],
        correct_answer_ids: ['opt1', 'opt3'],
      };

      const shuffled = shuffleQuestionOptions(question);
      
      // Simular respuesta del usuario (selecciona opt1 y opt3)
      const userSelection = ['opt3', 'opt1']; // En diferente orden
      const isCorrect = 
        userSelection.sort().join(',') === 
        shuffled.correct_answer_ids.sort().join(',');
      
      expect(isCorrect).toBe(true);
    });

    it('should validate incorrect answers after shuffling - multiple answers', () => {
      const question = {
        id: 'q1',
        options: [
          { id: 'opt1', text: 'Correct 1' },
          { id: 'opt2', text: 'Wrong' },
          { id: 'opt3', text: 'Correct 2' },
          { id: 'opt4', text: 'Wrong' },
        ],
        correct_answer_ids: ['opt1', 'opt3'],
      };

      const shuffled = shuffleQuestionOptions(question);
      
      // Simular respuesta del usuario (selecciona solo opt1)
      const userSelection = ['opt1'];
      const isCorrect = 
        userSelection.sort().join(',') === 
        shuffled.correct_answer_ids.sort().join(',');
      
      expect(isCorrect).toBe(false);
    });
  });
});
