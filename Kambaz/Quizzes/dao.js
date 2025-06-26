import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

// Helper to get MongoDB collections
const getDB = () => mongoose.connection.db;

// ================================
// QUIZ CRUD OPERATIONS
// ================================

export async function findAllQuizzes() {
  try {
    const db = getDB();
    const quizzes = await db.collection('quizzes').find({}).toArray();
    return quizzes;
  } catch (error) {
    console.error('Error finding all quizzes:', error);
    return [];
  }
}

export async function findQuizzesByCourse(courseId) {
  try {
    const db = getDB();
    const quizzes = await db.collection('quizzes').find({ courseId }).toArray();
    return quizzes;
  } catch (error) {
    console.error('Error finding quizzes by course:', error);
    return [];
  }
}

export async function findQuizById(quizId) {
  try {
    const db = getDB();
    const quiz = await db.collection('quizzes').findOne({ _id: quizId });
    return quiz;
  } catch (error) {
    console.error('Error finding quiz by ID:', error);
    return null;
  }
}

export async function createQuiz(quiz) {
  try {
    const db = getDB();
    
    const newQuiz = {
      ...quiz,
      _id: uuidv4(),
      questions: quiz.questions || [],
      published: quiz.published || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await db.collection('quizzes').insertOne(newQuiz);
    return newQuiz;
  } catch (error) {
    console.error('Error creating quiz:', error);
    throw error;
  }
}

export async function updateQuiz(quizId, quizUpdates) {
  try {
    const db = getDB();
    
    const updateData = {
      ...quizUpdates,
      updatedAt: new Date().toISOString()
    };
    
    const result = await db.collection('quizzes').findOneAndUpdate(
      { _id: quizId },
      { $set: updateData },
      { returnDocument: 'after' }
    );
    
    return result.value;
  } catch (error) {
    console.error('Error updating quiz:', error);
    return null;
  }
}

export async function deleteQuiz(quizId) {
  try {
    const db = getDB();
    
    // Remove the quiz
    const result = await db.collection('quizzes').deleteOne({ _id: quizId });
    
    // Remove all attempts for this quiz
    await db.collection('quizAttempts').deleteMany({ quizId });
    
    return result.deletedCount > 0;
  } catch (error) {
    console.error('Error deleting quiz:', error);
    return false;
  }
}

// ================================
// QUESTION CRUD OPERATIONS
// ================================

export async function addQuestionToQuiz(quizId, question) {
  try {
    const db = getDB();
    
    const newQuestion = {
      ...question,
      _id: uuidv4()
    };
    
    // Add question to quiz's questions array
    const result = await db.collection('quizzes').findOneAndUpdate(
      { _id: quizId },
      { 
        $push: { questions: newQuestion },
        $set: { updatedAt: new Date().toISOString() }
      },
      { returnDocument: 'after' }
    );
    
    if (result.value) {
      // Update total points
      const totalPoints = result.value.questions.reduce((sum, q) => sum + (q.points || 0), 0);
      await db.collection('quizzes').updateOne(
        { _id: quizId },
        { $set: { points: totalPoints } }
      );
      
      return newQuestion;
    }
    
    return null;
  } catch (error) {
    console.error('Error adding question to quiz:', error);
    return null;
  }
}

export async function updateQuestion(quizId, questionId, questionUpdates) {
  try {
    const db = getDB();
    
    const result = await db.collection('quizzes').findOneAndUpdate(
      { 
        _id: quizId,
        "questions._id": questionId
      },
      { 
        $set: {
          "questions.$": { ...questionUpdates, _id: questionId },
          updatedAt: new Date().toISOString()
        }
      },
      { returnDocument: 'after' }
    );
    
    if (result.value) {
      // Update total points
      const totalPoints = result.value.questions.reduce((sum, q) => sum + (q.points || 0), 0);
      await db.collection('quizzes').updateOne(
        { _id: quizId },
        { $set: { points: totalPoints } }
      );
      
      return result.value.questions.find(q => q._id === questionId);
    }
    
    return null;
  } catch (error) {
    console.error('Error updating question:', error);
    return null;
  }
}

export async function deleteQuestion(quizId, questionId) {
  try {
    const db = getDB();
    
    const result = await db.collection('quizzes').findOneAndUpdate(
      { _id: quizId },
      { 
        $pull: { questions: { _id: questionId } },
        $set: { updatedAt: new Date().toISOString() }
      },
      { returnDocument: 'after' }
    );
    
    if (result.value) {
      // Update total points
      const totalPoints = result.value.questions.reduce((sum, q) => sum + (q.points || 0), 0);
      await db.collection('quizzes').updateOne(
        { _id: quizId },
        { $set: { points: totalPoints } }
      );
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error deleting question:', error);
    return false;
  }
}

// ================================
// QUIZ ATTEMPT OPERATIONS
// ================================

export async function createQuizAttempt(attempt) {
  try {
    const db = getDB();
    
    const newAttempt = {
      ...attempt,
      _id: uuidv4(),
      submittedAt: new Date().toISOString()
    };
    
    await db.collection('quizAttempts').insertOne(newAttempt);
    return newAttempt;
  } catch (error) {
    console.error('Error creating quiz attempt:', error);
    throw error;
  }
}

export async function findAttemptsByQuizAndUser(quizId, userId) {
  try {
    const db = getDB();
    const attempts = await db.collection('quizAttempts')
      .find({ quizId, userId })
      .sort({ submittedAt: -1 })
      .toArray();
    return attempts;
  } catch (error) {
    console.error('Error finding attempts by quiz and user:', error);
    return [];
  }
}

export async function findAllAttemptsByQuiz(quizId) {
  try {
    const db = getDB();
    const attempts = await db.collection('quizAttempts')
      .find({ quizId })
      .sort({ submittedAt: -1 })
      .toArray();
    return attempts;
  } catch (error) {
    console.error('Error finding all attempts by quiz:', error);
    return [];
  }
}

export async function getQuizStats(quizId) {
  try {
    const db = getDB();
    const attempts = await db.collection('quizAttempts').find({ quizId }).toArray();
    
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
  } catch (error) {
    console.error('Error getting quiz stats:', error);
    return {
      totalAttempts: 0,
      uniqueStudents: 0,
      averageScore: 0,
      highestScore: 0,
      lowestScore: 0
    };
  }
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
