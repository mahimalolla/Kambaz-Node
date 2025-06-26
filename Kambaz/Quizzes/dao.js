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
    console.log('📋 Found', quizzes.length, 'total quizzes');
    return quizzes;
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
    return quizzes;
  } catch (error) {
    console.error('💥 Error finding quizzes by course:', error);
    return [];
  }
}

export async function findQuizById(quizId) {
  try {
    const db = getDB();
    console.log('🔍 Finding quiz by ID:', quizId);
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    console.log('➕ Creating new quiz:', {
      id: newQuiz._id,
      title: newQuiz.title,
      courseId: newQuiz.courseId
    });
    
    await db.collection('quizzes').insertOne(newQuiz);
    console.log('✅ Successfully created quiz:', newQuiz._id);
    return newQuiz;
  } catch (error) {
    console.error('💥 Error creating quiz:', error);
    throw error;
  }
}

export async function updateQuiz(quizId, quizUpdates) {
  try {
    const db = getDB();
    
    console.log('🔄 Updating quiz:', quizId);
    console.log('📝 Update data:', Object.keys(quizUpdates));
    
    const updateData = {
      ...quizUpdates,
      updatedAt: new Date().toISOString()
    };
    
    const result = await db.collection('quizzes').findOneAndUpdate(
      { _id: quizId },
      { $set: updateData },
      { returnDocument: 'after' }
    );
    
    if (result.value) {
      console.log('✅ Successfully updated quiz:', quizId);
    } else {
      console.log('❌ Quiz not found for update:', quizId);
    }
    
    return result.value;
  } catch (error) {
    console.error('💥 Error updating quiz:', error);
    return null;
  }
}

export async function deleteQuiz(quizId) {
  try {
    const db = getDB();
    
    console.log('🗑️ Deleting quiz:', quizId);
    
    // Remove the quiz
    const result = await db.collection('quizzes').deleteOne({ _id: quizId });
    
    // Remove all attempts for this quiz
    await db.collection('quizAttempts').deleteMany({ quizId });
    
    const success = result.deletedCount > 0;
    console.log(success ? '✅ Successfully deleted quiz:' : '❌ Quiz not found for deletion:', quizId);
    
    return success;
  } catch (error) {
    console.error('💥 Error deleting quiz:', error);
    return false;
  }
}

// ================================
// QUESTION CRUD OPERATIONS
// ================================

export async function addQuestionToQuiz(quizId, question) {
  try {
    const db = getDB();
    
    console.log('🔍 Adding question to quiz:', quizId);
    console.log('📝 Question data:', {
      type: question.type,
      title: question.title,
      points: question.points,
      hasQuestion: !!question.question
    });
    
    // First, check if the quiz exists and log details
    const existingQuiz = await db.collection('quizzes').findOne({ _id: quizId });
    console.log('🎯 Found quiz:', existingQuiz ? 'YES' : 'NO');
    
    if (!existingQuiz) {
      console.error('❌ Quiz not found with ID:', quizId);
      
      // Debug: Check what quizzes exist
      const allQuizzes = await db.collection('quizzes').find({}).toArray();
      console.log('📋 All quizzes in database:');
      allQuizzes.forEach(q => {
        console.log(`  - ID: ${q._id} | Title: ${q.title} | Course: ${q.courseId}`);
      });
      
      // Check if it's a string vs ObjectId issue
      console.log('🔍 Quiz ID type check:', {
        quizId: quizId,
        type: typeof quizId,
        length: quizId?.length
      });
      
      return null;
    }
    
    console.log('📋 Quiz found - Details:', {
      id: existingQuiz._id,
      title: existingQuiz.title,
      courseId: existingQuiz.courseId,
      currentQuestions: existingQuiz.questions?.length || 0
    });
    
    const newQuestion = {
      ...question,
      _id: uuidv4()
    };
    
    console.log('➕ Adding new question with ID:', newQuestion._id);
    
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
      console.log('✅ Successfully added question to quiz');
      console.log('📊 Quiz now has', result.value.questions.length, 'questions');
      
      // Update total points
      const totalPoints = result.value.questions.reduce((sum, q) => sum + (q.points || 0), 0);
      await db.collection('quizzes').updateOne(
        { _id: quizId },
        { $set: { points: totalPoints } }
      );
      
      console.log('💯 Updated total points to:', totalPoints);
      return newQuestion;
    }
    
    console.error('❌ Failed to update quiz - result.value is null');
    return null;
  } catch (error) {
    console.error('💥 Error adding question to quiz:', error);
    console.error('🔍 Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    return null;
  }
}

export async function updateQuestion(quizId, questionId, questionUpdates) {
  try {
    const db = getDB();
    
    console.log('🔄 Updating question:', { quizId, questionId });
    console.log('📝 Update data:', Object.keys(questionUpdates));
    
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
      console.log('✅ Successfully updated question:', questionId);
      
      // Update total points
      const totalPoints = result.value.questions.reduce((sum, q) => sum + (q.points || 0), 0);
      await db.collection('quizzes').updateOne(
        { _id: quizId },
        { $set: { points: totalPoints } }
      );
      
      return result.value.questions.find(q => q._id === questionId);
    }
    
    console.log('❌ Question or Quiz not found for update:', { quizId, questionId });
    return null;
  } catch (error) {
    console.error('💥 Error updating question:', error);
    return null;
  }
}

export async function deleteQuestion(quizId, questionId) {
  try {
    const db = getDB();
    
    console.log('🗑️ Deleting question:', { quizId, questionId });
    
    const result = await db.collection('quizzes').findOneAndUpdate(
      { _id: quizId },
      { 
        $pull: { questions: { _id: questionId } },
        $set: { updatedAt: new Date().toISOString() }
      },
      { returnDocument: 'after' }
    );
    
    if (result.value) {
      console.log('✅ Successfully deleted question:', questionId);
      
      // Update total points
      const totalPoints = result.value.questions.reduce((sum, q) => sum + (q.points || 0), 0);
      await db.collection('quizzes').updateOne(
        { _id: quizId },
        { $set: { points: totalPoints } }
      );
      
      return true;
    }
    
    console.log('❌ Question or Quiz not found for deletion:', { quizId, questionId });
    return false;
  } catch (error) {
    console.error('💥 Error deleting question:', error);
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
    
    console.log('➕ Creating quiz attempt:', {
      quizId: newAttempt.quizId,
      userId: newAttempt.userId,
      score: newAttempt.score
    });
    
    await db.collection('quizAttempts').insertOne(newAttempt);
    console.log('✅ Successfully created quiz attempt:', newAttempt._id);
    return newAttempt;
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
    return attempts;
  } catch (error) {
    console.error('💥 Error finding attempts by quiz and user:', error);
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
    return attempts;
  } catch (error) {
    console.error('💥 Error finding all attempts by quiz:', error);
    return [];
  }
}

export async function getQuizStats(quizId) {
  try {
    const db = getDB();
    console.log('📊 Getting stats for quiz:', quizId);
    const attempts = await db.collection('quizAttempts').find({ quizId }).toArray();
    
    if (attempts.length === 0) {
      console.log('📊 No attempts found for stats');
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
    
    console.log('📊 Quiz stats:', stats);
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

export async function testQuizExists(quizId) {
  try {
    const db = getDB();
    
    console.log('🔍 Testing if quiz exists:', quizId);
    
    const quiz = await db.collection('quizzes').findOne({ _id: quizId });
    console.log('🎯 Quiz found:', !!quiz);
    
    if (quiz) {
      console.log('📋 Quiz details:', {
        id: quiz._id,
        title: quiz.title,
        courseId: quiz.courseId,
        questionCount: quiz.questions?.length || 0,
        published: quiz.published
      });
    }
    
    // Also check all quizzes for debugging
    const allQuizzes = await db.collection('quizzes').find({}).toArray();
    console.log('📊 All quizzes in database:');
    allQuizzes.forEach(q => {
      console.log(`  - ${q._id}: ${q.title} (Course: ${q.courseId}, Questions: ${q.questions?.length || 0})`);
    });
    
    return quiz;
  } catch (error) {
    console.error('💥 Error testing quiz existence:', error);
    return null;
  }
}

export async function debugDatabaseConnection() {
  try {
    const db = getDB();
    
    console.log('🔍 Testing database connection...');
    
    // Test connection
    const adminDb = db.admin();
    const result = await adminDb.ping();
    console.log('🏓 Database ping result:', result);
    
    // List collections
    const collections = await db.listCollections().toArray();
    console.log('📋 Available collections:', collections.map(c => c.name));
    
    // Count documents in quizzes collection
    const quizCount = await db.collection('quizzes').countDocuments();
    console.log('📊 Total quizzes in database:', quizCount);
    
    // Count documents in quizAttempts collection
    const attemptCount = await db.collection('quizAttempts').countDocuments();
    console.log('📊 Total quiz attempts in database:', attemptCount);
    
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
