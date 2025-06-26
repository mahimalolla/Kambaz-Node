import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

// Helper to get MongoDB collections
const getDB = () => mongoose.connection.db;

// ================================
// 🚨 EMERGENCY SIMPLIFIED DAO - BULLETPROOF VERSION
// ================================

export async function findAllQuizzes() {
  try {
    const db = getDB();
    const quizzes = await db.collection('quizzes').find({}).toArray();
    console.log('📋 Found', quizzes.length, 'total quizzes');
    return quizzes || [];
  } catch (error) {
    console.error('💥 Error finding all quizzes:', error);
    return [];
  }
}

export async function findQuizzesByCourse(courseId) {
  try {
    const db = getDB();
    console.log('🔍 Finding quizzes for course:', courseId);
    const quizzes = await db.collection('quizzes').find({ courseId }).toArray();
    console.log('📋 Found', quizzes.length, 'quizzes for course', courseId);
    return quizzes || [];
  } catch (error) {
    console.error('💥 Error finding quizzes by course:', error);
    return [];
  }
}

export async function findQuizById(quizId) {
  try {
    const db = getDB();
    console.log('🔍 Finding quiz by ID:', quizId);
    
    if (!quizId) {
      console.error('❌ No quiz ID provided');
      return null;
    }
    
    const quiz = await db.collection('quizzes').findOne({ _id: quizId });
    console.log('🎯 Quiz found:', quiz ? 'YES' : 'NO');
    
    if (quiz) {
      console.log('📝 Quiz details:', {
        id: quiz._id,
        title: quiz.title,
        courseId: quiz.courseId,
        questionCount: quiz.questions?.length || 0
      });
    }
    
    return quiz;
  } catch (error) {
    console.error('💥 Error finding quiz by ID:', error);
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
      points: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    console.log('➕ Creating new quiz:', {
      id: newQuiz._id,
      title: newQuiz.title,
      courseId: newQuiz.courseId
    });
    
    const result = await db.collection('quizzes').insertOne(newQuiz);
    
    if (result.acknowledged) {
      console.log('✅ Successfully created quiz:', newQuiz._id);
      return newQuiz;
    } else {
      throw new Error('Quiz creation not acknowledged by database');
    }
  } catch (error) {
    console.error('💥 Error creating quiz:', error);
    throw error;
  }
}

// 🚨 EMERGENCY FIX: Ultra-simple updateQuiz function
export async function updateQuiz(quizId, quizUpdates) {
  try {
    const db = getDB();
    
    console.log('🔄 EMERGENCY UPDATE - Starting updateQuiz:', { 
      quizId, 
      updateKeys: Object.keys(quizUpdates || {})
    });
    
    // Basic validation
    if (!quizId) {
      const error = new Error('Quiz ID is required');
      console.error('❌ Validation failed:', error.message);
      throw error;
    }
    
    if (!quizUpdates || Object.keys(quizUpdates).length === 0) {
      const error = new Error('No updates provided');
      console.error('❌ Validation failed:', error.message);
      throw error;
    }
    
    // Check if quiz exists first
    console.log('🔍 Checking if quiz exists...');
    const existingQuiz = await db.collection('quizzes').findOne({ _id: quizId });
    
    if (!existingQuiz) {
      const error = new Error(`Quiz with ID ${quizId} not found`);
      console.error('❌ Quiz not found:', error.message);
      throw error;
    }
    
    console.log('✅ Quiz exists:', existingQuiz.title);
    
    // Create simple update object
    const updateData = {
      ...quizUpdates,
      updatedAt: new Date().toISOString()
    };
    
    // Remove any undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });
    
    console.log('📝 Clean update data keys:', Object.keys(updateData));
    
    // Use the most basic update possible
    console.log('🔄 Attempting database update...');
    const updateResult = await db.collection('quizzes').updateOne(
      { _id: quizId },
      { $set: updateData }
    );
    
    console.log('📊 Update result:', {
      matched: updateResult.matchedCount,
      modified: updateResult.modifiedCount,
      acknowledged: updateResult.acknowledged
    });
    
    if (!updateResult.acknowledged) {
      throw new Error('Update not acknowledged by database');
    }
    
    if (updateResult.matchedCount === 0) {
      throw new Error('No quiz matched the provided ID');
    }
    
    // Get the updated quiz
    console.log('🔍 Fetching updated quiz...');
    const updatedQuiz = await db.collection('quizzes').findOne({ _id: quizId });
    
    if (!updatedQuiz) {
      throw new Error('Could not retrieve updated quiz');
    }
    
    console.log('✅ Quiz updated successfully:', {
      id: updatedQuiz._id,
      title: updatedQuiz.title,
      published: updatedQuiz.published,
      questionCount: updatedQuiz.questions?.length || 0
    });
    
    return updatedQuiz;
    
  } catch (error) {
    console.error('💥 EMERGENCY ERROR in updateQuiz:', {
      message: error.message,
      stack: error.stack,
      quizId,
      updateKeys: Object.keys(quizUpdates || {})
    });
    
    // Re-throw the error so the route handler can catch it
    throw error;
  }
}

export async function deleteQuiz(quizId) {
  try {
    const db = getDB();
    
    console.log('🗑️ Deleting quiz:', quizId);
    
    if (!quizId) {
      throw new Error('Quiz ID is required');
    }
    
    // Remove the quiz
    const result = await db.collection('quizzes').deleteOne({ _id: quizId });
    
    if (result.deletedCount === 0) {
      throw new Error(`Quiz with ID ${quizId} not found`);
    }
    
    // Remove all attempts for this quiz
    await db.collection('quizAttempts').deleteMany({ quizId });
    
    console.log('✅ Successfully deleted quiz:', quizId);
    return true;
  } catch (error) {
    console.error('💥 Error deleting quiz:', error);
    throw error;
  }
}

// ================================
// QUESTION OPERATIONS - SIMPLIFIED
// ================================

export async function addQuestionToQuiz(quizId, question) {
  try {
    const db = getDB();
    
    console.log('🔍 Adding question to quiz:', quizId);
    
    if (!quizId || !question) {
      throw new Error('Quiz ID and question data are required');
    }
    
    // Verify quiz exists
    const existingQuiz = await db.collection('quizzes').findOne({ _id: quizId });
    if (!existingQuiz) {
      throw new Error(`Quiz with ID ${quizId} not found`);
    }
    
    console.log('📋 Quiz found for question addition');
    
    // Create new question
    const newQuestion = {
      _id: uuidv4(),
      type: question.type || 'multiple-choice',
      title: question.title || 'Untitled Question',
      points: parseInt(question.points) || 1,
      question: question.question || '',
      ...question // Include any other question-specific fields
    };
    
    console.log('➕ Adding question:', newQuestion._id);
    
    // Add question using $push
    const result = await db.collection('quizzes').updateOne(
      { _id: quizId },
      { 
        $push: { questions: newQuestion },
        $inc: { points: newQuestion.points },
        $set: { updatedAt: new Date().toISOString() }
      }
    );
    
    if (result.modifiedCount === 1) {
      console.log('✅ Successfully added question');
      return newQuestion;
    } else {
      throw new Error('Failed to add question to quiz');
    }
    
  } catch (error) {
    console.error('💥 Error adding question:', error);
    throw error;
  }
}

export async function updateQuestion(quizId, questionId, questionUpdates) {
  try {
    const db = getDB();
    
    console.log('🔄 Updating question:', { quizId, questionId });
    
    if (!quizId || !questionId) {
      throw new Error('Quiz ID and Question ID are required');
    }
    
    const updatedQuestion = {
      ...questionUpdates,
      _id: questionId
    };
    
    const result = await db.collection('quizzes').updateOne(
      { 
        _id: quizId,
        "questions._id": questionId
      },
      { 
        $set: {
          "questions.$": updatedQuestion,
          updatedAt: new Date().toISOString()
        }
      }
    );
    
    if (result.modifiedCount === 1) {
      console.log('✅ Successfully updated question');
      
      // Recalculate total points
      const quiz = await db.collection('quizzes').findOne({ _id: quizId });
      if (quiz && quiz.questions) {
        const totalPoints = quiz.questions.reduce((sum, q) => sum + (q.points || 0), 0);
        await db.collection('quizzes').updateOne(
          { _id: quizId },
          { $set: { points: totalPoints } }
        );
      }
      
      return updatedQuestion;
    } else {
      throw new Error('Question not found or not updated');
    }
  } catch (error) {
    console.error('💥 Error updating question:', error);
    throw error;
  }
}

export async function deleteQuestion(quizId, questionId) {
  try {
    const db = getDB();
    
    console.log('🗑️ Deleting question:', { quizId, questionId });
    
    if (!quizId || !questionId) {
      throw new Error('Quiz ID and Question ID are required');
    }
    
    const result = await db.collection('quizzes').updateOne(
      { _id: quizId },
      { 
        $pull: { questions: { _id: questionId } },
        $set: { updatedAt: new Date().toISOString() }
      }
    );
    
    if (result.modifiedCount === 1) {
      console.log('✅ Successfully deleted question');
      
      // Recalculate total points
      const quiz = await db.collection('quizzes').findOne({ _id: quizId });
      if (quiz && quiz.questions) {
        const totalPoints = quiz.questions.reduce((sum, q) => sum + (q.points || 0), 0);
        await db.collection('quizzes').updateOne(
          { _id: quizId },
          { $set: { points: totalPoints } }
        );
      }
      
      return true;
    } else {
      throw new Error('Question not found or not deleted');
    }
  } catch (error) {
    console.error('💥 Error deleting question:', error);
    throw error;
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
    
    console.log('➕ Creating quiz attempt:', {
      quizId: newAttempt.quizId,
      userId: newAttempt.userId,
      score: newAttempt.score
    });
    
    const result = await db.collection('quizAttempts').insertOne(newAttempt);
    
    if (result.acknowledged) {
      console.log('✅ Successfully created quiz attempt');
      return newAttempt;
    } else {
      throw new Error('Quiz attempt creation not acknowledged');
    }
  } catch (error) {
    console.error('💥 Error creating quiz attempt:', error);
    throw error;
  }
}

export async function findAttemptsByQuizAndUser(quizId, userId) {
  try {
    const db = getDB();
    console.log('🔍 Finding attempts for quiz:', quizId, 'user:', userId);
    const attempts = await db.collection('quizAttempts')
      .find({ quizId, userId })
      .sort({ submittedAt: -1 })
      .toArray();
    console.log('📋 Found', attempts.length, 'attempts');
    return attempts || [];
  } catch (error) {
    console.error('💥 Error finding attempts:', error);
    return [];
  }
}

export async function findAllAttemptsByQuiz(quizId) {
  try {
    const db = getDB();
    console.log('🔍 Finding all attempts for quiz:', quizId);
    const attempts = await db.collection('quizAttempts')
      .find({ quizId })
      .sort({ submittedAt: -1 })
      .toArray();
    console.log('📋 Found', attempts.length, 'total attempts');
    return attempts || [];
  } catch (error) {
    console.error('💥 Error finding all attempts:', error);
    return [];
  }
}

export async function getQuizStats(quizId) {
  try {
    const db = getDB();
    console.log('📊 Getting stats for quiz:', quizId);
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
    
    const stats = {
      totalAttempts: attempts.length,
      uniqueStudents,
      averageScore: scores.reduce((sum, score) => sum + score, 0) / scores.length,
      highestScore: Math.max(...scores),
      lowestScore: Math.min(...scores)
    };
    
    console.log('📊 Quiz stats calculated');
    return stats;
  } catch (error) {
    console.error('💥 Error getting quiz stats:', error);
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

  console.log('🧮 Calculating score for', questions.length, 'questions');

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
  
  console.log('🧮 Score calculation result:', { score, maxScore, percentage });
  
  return { score, maxScore, percentage };
}

// ================================
// DEBUG FUNCTIONS
// ================================

export async function debugDatabaseConnection() {
  try {
    const db = getDB();
    
    console.log('🔍 Testing database connection...');
    
    const adminDb = db.admin();
    const result = await adminDb.ping();
    console.log('🏓 Database ping successful');
    
    const collections = await db.listCollections().toArray();
    const quizCount = await db.collection('quizzes').countDocuments();
    const attemptCount = await db.collection('quizAttempts').countDocuments();
    
    return {
      connected: true,
      collections: collections.map(c => c.name),
      quizCount,
      attemptCount
    };
  } catch (error) {
    console.error('💥 Database connection test failed:', error);
    return {
      connected: false,
      error: error.message
    };
  }
}
