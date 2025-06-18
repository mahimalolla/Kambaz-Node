import Database from "../Database/index.js";
import { v4 as uuidv4 } from "uuid";

// ================================
// QUIZ CRUD OPERATIONS
// ================================

export function findAllQuizzes() {
  return Database.quizzes || [];
}

export function findQuizzesByCourse(courseId) {
  const quizzes = Database.quizzes || [];
  return quizzes.filter(quiz => quiz.courseId === courseId);
}

export function findQuizById(quizId) {
  const quizzes = Database.quizzes || [];
  return quizzes.find(quiz => quiz._id === quizId);
}

export function createQuiz(quiz) {
  if (!Database.quizzes) {
    Database.quizzes = [];
  }
  
  const newQuiz = {
    ...quiz,
    _id: uuidv4(),
    questions: quiz.questions || [],
    published: quiz.published || false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  Database.quizzes = [...Database.quizzes, newQuiz];
  return newQuiz;
}

export function updateQuiz(quizId, quizUpdates) {
  if (!Database.quizzes) {
    Database.quizzes = [];
  }
  
  const quizIndex = Database.quizzes.findIndex(quiz => quiz._id === quizId);
  if (quizIndex !== -1) {
    const updatedQuiz = {
      ...Database.quizzes[quizIndex],
      ...quizUpdates,
      updatedAt: new Date().toISOString()
    };
    Database.quizzes[quizIndex] = updatedQuiz;
    return updatedQuiz;
  }
  return null;
}

export function deleteQuiz(quizId) {
  if (!Database.quizzes) {
    return false;
  }
  
  const quizIndex = Database.quizzes.findIndex(quiz => quiz._id === quizId);
  if (quizIndex !== -1) {
    // Remove the quiz
    Database.quizzes = Database.quizzes.filter(quiz => quiz._id !== quizId);
    
    // Remove all attempts for this quiz
    if (Database.quizAttempts) {
      Database.quizAttempts = Database.quizAttempts.filter(attempt => attempt.quizId !== quizId);
    }
    
    return true;
  }
  return false;
}

// ================================
// QUESTION CRUD OPERATIONS
// ================================

export function addQuestionToQuiz(quizId, question) {
  if (!Database.quizzes) {
    Database.quizzes = [];
  }
  
  const quizIndex = Database.quizzes.findIndex(quiz => quiz._id === quizId);
  if (quizIndex !== -1) {
    const newQuestion = {
      ...question,
      _id: uuidv4()
    };
    
    if (!Database.quizzes[quizIndex].questions) {
      Database.quizzes[quizIndex].questions = [];
    }
    
    Database.quizzes[quizIndex].questions.push(newQuestion);
    Database.quizzes[quizIndex].updatedAt = new Date().toISOString();
    
    // Update total points
    const totalPoints = Database.quizzes[quizIndex].questions.reduce((sum, q) => sum + (q.points || 0), 0);
    Database.quizzes[quizIndex].points = totalPoints;
    
    return newQuestion;
  }
  return null;
}

export function updateQuestion(quizId, questionId, questionUpdates) {
  if (!Database.quizzes) {
    return null;
  }
  
  const quizIndex = Database.quizzes.findIndex(quiz => quiz._id === quizId);
  if (quizIndex !== -1 && Database.quizzes[quizIndex].questions) {
    const questionIndex = Database.quizzes[quizIndex].questions.findIndex(q => q._id === questionId);
    if (questionIndex !== -1) {
      Database.quizzes[quizIndex].questions[questionIndex] = {
        ...Database.quizzes[quizIndex].questions[questionIndex],
        ...questionUpdates
      };
      Database.quizzes[quizIndex].updatedAt = new Date().toISOString();
      
      // Update total points
      const totalPoints = Database.quizzes[quizIndex].questions.reduce((sum, q) => sum + (q.points || 0), 0);
      Database.quizzes[quizIndex].points = totalPoints;
      
      return Database.quizzes[quizIndex].questions[questionIndex];
    }
  }
  return null;
}

export function deleteQuestion(quizId, questionId) {
  if (!Database.quizzes) {
    return false;
  }
  
  const quizIndex = Database.quizzes.findIndex(quiz => quiz._id === quizId);
  if (quizIndex !== -1 && Database.quizzes[quizIndex].questions) {
    const questionIndex = Database.quizzes[quizIndex].questions.findIndex(q => q._id === questionId);
    if (questionIndex !== -1) {
      Database.quizzes[quizIndex].questions = Database.quizzes[quizIndex].questions.filter(q => q._id !== questionId);
      Database.quizzes[quizIndex].updatedAt = new Date().toISOString();
      
      // Update total points
      const totalPoints = Database.quizzes[quizIndex].questions.reduce((sum, q) => sum + (q.points || 0), 0);
      Database.quizzes[quizIndex].points = totalPoints;
      
      return true;
    }
  }
  return false;
}

// ================================
// QUIZ ATTEMPT OPERATIONS
// ================================

export function createQuizAttempt(attempt) {
  if (!Database.quizAttempts) {
    Database.quizAttempts = [];
  }
  
  const newAttempt = {
    ...attempt,
    _id: uuidv4(),
    submittedAt: new Date().toISOString()
  };
  
  Database.quizAttempts = [...Database.quizAttempts, newAttempt];
  return newAttempt;
}

export function findAttemptsByQuizAndUser(quizId, userId) {
  if (!Database.quizAttempts) {
    return [];
  }
  
  return Database.quizAttempts.filter(attempt => 
    attempt.quizId === quizId && attempt.userId === userId
  ).sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
}

export function findAllAttemptsByQuiz(quizId) {
  if (!Database.quizAttempts) {
    return [];
  }
  
  return Database.quizAttempts.filter(attempt => attempt.quizId === quizId)
    .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
}

export function getQuizStats(quizId) {
  if (!Database.quizAttempts) {
    return {
      totalAttempts: 0,
      uniqueStudents: 0,
      averageScore: 0,
      highestScore: 0,
      lowestScore: 0
    };
  }
  
  const attempts = Database.quizAttempts.filter(attempt => attempt.quizId === quizId);
  
  if (attempts.length === 0) {
    return {
      totalAttempts: 0,
      uniqueStudents: 0,
      averageScore: 0,
      highestScore: 0,
      lowestScore: 0
    };
  }
  
  const scores = attempts.map(attempt => attempt.score);
  const uniqueStudents = new Set(attempts.map(attempt => attempt.userId)).size;
  
  return {
    totalAttempts: attempts.length,
    uniqueStudents,
    averageScore: scores.reduce((sum, score) => sum + score, 0) / scores.length,
    highestScore: Math.max(...scores),
    lowestScore: Math.min(...scores)
  };
}

// ================================
// UTILITY FUNCTIONS
// ================================

export function calculateScore(questions, answers) {
  let score = 0;
  let maxScore = 0;

  questions.forEach(question => {
    maxScore += question.points || 0;
    const userAnswer = answers[question._id];
    
    if (question.type === 'multiple-choice') {
      if (userAnswer === question.correctAnswer) {
        score += question.points || 0;
      }
    } else if (question.type === 'true-false') {
      if (userAnswer === question.correctAnswer) {
        score += question.points || 0;
      }
    } else if (question.type === 'fill-blank') {
      const userAnswerLower = userAnswer?.toLowerCase().trim();
      const isCorrect = question.possibleAnswers?.some(
        correct => correct.toLowerCase().trim() === userAnswerLower
      );
      if (isCorrect) {
        score += question.points || 0;
      }
    }
  });

  const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  return { score, maxScore, percentage };
}
