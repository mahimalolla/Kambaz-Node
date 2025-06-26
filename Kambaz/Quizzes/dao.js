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

// 🔧 FIXED: Enhanced updateQuiz function with multiple methods and better error handling
export async function updateQuiz(quizId, quizUpdates) {
  try {
    const db = getDB();
    
    console.log('🔄 Updating quiz:', quizId);
    console.log('📝 Update data keys:', Object.keys(quizUpdates));
    console.log('📋 Update data sample:', {
      title: quizUpdates.title,
      published: quizUpdates.published,
      hasQuestions: !!quizUpdates.questions,
      questionCount: quizUpdates.questions?.length || 0
    });
    
    // First check if quiz exists
    const existingQuiz = await db.collection('quizzes').findOne({ _id: quizId });
    if (!existingQuiz) {
      console.error('❌ Quiz not found for update:', quizId);
      return null;
    }
    
    console.log('✅ Quiz exists before update:', existingQuiz.title);
    
    // Clean the update data - remove any problematic fields
    const cleanUpdateData = {
      // Only include safe fields
      ...(quizUpdates.title && { title: quizUpdates.title }),
      ...(quizUpdates.description !== undefined && { description: quizUpdates.description }),
      ...(quizUpdates.quizType && { quizType: quizUpdates.quizType }),
      ...(quizUpdates.assignmentGroup && { assignmentGroup: quizUpdates.assignmentGroup }),
      ...(quizUpdates.shuffleAnswers !== undefined && { shuffleAnswers: quizUpdates.shuffleAnswers }),
      ...(quizUpdates.timeLimit !== undefined && { timeLimit: quizUpdates.timeLimit }),
      ...(quizUpdates.multipleAttempts !== undefined && { multipleAttempts: quizUpdates.multipleAttempts }),
      ...(quizUpdates.attemptLimit !== undefined && { attemptLimit: quizUpdates.attemptLimit }),
      ...(quizUpdates.showCorrectAnswers && { showCorrectAnswers: quizUpdates.showCorrectAnswers }),
      ...(quizUpdates.accessCode !== undefined && { accessCode: quizUpdates.accessCode }),
      ...(quizUpdates.oneQuestionAtATime !== undefined && { oneQuestionAtATime: quizUpdates.oneQuestionAtATime }),
      ...(quizUpdates.webcamRequired !== undefined && { webcamRequired: quizUpdates.webcamRequired }),
      ...(quizUpdates.lockQuestionsAfterAnswering !== undefined && { lockQuestionsAfterAnswering: quizUpdates.lockQuestionsAfterAnswering }),
      ...(quizUpdates.published !== undefined && { published: quizUpdates.published }),
      ...(quizUpdates.points !== undefined && { points: quizUpdates.points }),
      ...(quizUpdates.dueDate !== undefined && { dueDate: quizUpdates.dueDate }),
      ...(quizUpdates.availableDate !== undefined && { availableDate: quizUpdates.availableDate }),
      ...(quizUpdates.availableUntil !== undefined && { availableUntil: quizUpdates.availableUntil }),
      ...(quizUpdates.questions && { questions: quizUpdates.questions }),
      updatedAt: new Date().toISOString()
    };
    
    console.log('🧹 Clean update data keys:', Object.keys(cleanUpdateData));
    
    // METHOD 1: Try findOneAndUpdate
    try {
      console.log('🔄 Method 1: findOneAndUpdate...');
      
      const result = await db.collection('quizzes').findOneAndUpdate(
        { _id: quizId },
        { $set: cleanUpdateData },
        { returnDocument: 'after' }
      );
      
      if (result && result.value) {
        console.log('✅ Method 1 successful - quiz updated');
        return result.value;
      } else {
        console.log('⚠️ Method 1 failed - no result value');
      }
    } catch (method1Error) {
      console.log('⚠️ Method 1 error:', method1Error.message);
    }
    
    // METHOD 2: Try updateOne + findOne
    try {
      console.log('🔄 Method 2: updateOne + findOne...');
      
      const updateResult = await db.collection('quizzes').updateOne(
        { _id: quizId },
        { $set: cleanUpdateData }
      );
      
      console.log('📊 UpdateOne result:', {
        matchedCount: updateResult.matchedCount,
        modifiedCount: updateResult.modifiedCount
      });
      
      if (updateResult.modifiedCount === 1) {
        const updatedQuiz = await db.collection('quizzes').findOne({ _id: quizId });
        console.log('✅ Method 2 successful - quiz updated');
        return updatedQuiz;
      } else {
        console.log('⚠️ Method 2 failed - no documents modified');
      }
    } catch (method2Error) {
      console.log('⚠️ Method 2 error:', method2Error.message);
    }
    
    // METHOD 3: Try replaceOne (last resort)
    try {
      console.log('🔄 Method 3: replaceOne...');
      
      const newDocument = {
        ...existingQuiz,
        ...cleanUpdateData,
        _id: quizId  // Ensure ID stays the same
      };
      
      const replaceResult = await db.collection('quizzes').replaceOne(
        { _id: quizId },
        newDocument
      );
      
      console.log('📊 ReplaceOne result:', {
        matchedCount: replaceResult.matchedCount,
        modifiedCount: replaceResult.modifiedCount
      });
      
      if (replaceResult.modifiedCount === 1) {
        console.log('✅ Method 3 successful - quiz replaced');
        return newDocument;
      } else {
        console.log('⚠️ Method 3 failed - no documents modified');
      }
    } catch (method3Error) {
      console.log('⚠️ Method 3 error:', method3Error.message);
    }
    
    console.error('❌ All update methods failed');
    return null;
    
  } catch (error) {
    console.error('💥 Error updating quiz:', error);
    console.error('🔍 Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
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
// QUESTION CRUD OPERATIONS - FIXED!
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
    
    // First, verify the quiz exists
    const existingQuiz = await db.collection('quizzes').findOne({ _id: quizId });
    console.log('🎯 Found quiz:', existingQuiz ? 'YES' : 'NO');
    
    if (!existingQuiz) {
      console.error('❌ Quiz not found with ID:', quizId);
      return null;
    }
    
    console.log('📋 Quiz found - Details:', {
      id: existingQuiz._id,
      title: existingQuiz.title,
      currentQuestions: existingQuiz.questions?.length || 0
    });
    
    // Create a clean question object with only the fields we need
    const newQuestion = {
      _id: uuidv4(),
      type: question.type || 'multiple-choice',
      title: question.title || 'Untitled Question',
      points: parseInt(question.points) || 1,
      question: question.question || ''
    };
    
    // Add type-specific fields
    if (question.type === 'multiple-choice') {
      newQuestion.choices = question.choices || ['', '', '', ''];
      newQuestion.correctAnswer = question.correctAnswer !== undefined ? question.correctAnswer : 0;
    } else if (question.type === 'true-false') {
      newQuestion.correctAnswer = question.correctAnswer || 'true';
    } else if (question.type === 'fill-blank') {
      newQuestion.possibleAnswers = question.possibleAnswers || [''];
    }
    
    console.log('➕ Adding new question with ID:', newQuestion._id);
    console.log('📋 Clean question data:', newQuestion);
    
    // METHOD 1: Try the replacement approach (most reliable)
    try {
      console.log('🔄 Trying method 1: Full document replacement...');
      
      // Get current quiz with all data
      const currentQuiz = await db.collection('quizzes').findOne({ _id: quizId });
      if (!currentQuiz) {
        console.error('❌ Quiz disappeared during operation');
        return null;
      }
      
      // Add question to the array
      const updatedQuestions = [...(currentQuiz.questions || []), newQuestion];
      const totalPoints = updatedQuestions.reduce((sum, q) => sum + (q.points || 0), 0);
      
      // Update the entire questions array
      const updateResult = await db.collection('quizzes').updateOne(
        { _id: quizId },
        { 
          $set: { 
            questions: updatedQuestions,
            points: totalPoints,
            updatedAt: new Date().toISOString()
          }
        }
      );
      
      console.log('📊 Method 1 update result:', {
        matchedCount: updateResult.matchedCount,
        modifiedCount: updateResult.modifiedCount
      });
      
      if (updateResult.modifiedCount === 1) {
        console.log('✅ Successfully added question using method 1 (replacement)');
        console.log('📊 Quiz now has', updatedQuestions.length, 'questions');
        console.log('💯 Updated total points to:', totalPoints);
        return newQuestion;
      } else {
        console.log('⚠️ Method 1 failed - no documents modified');
      }
      
    } catch (method1Error) {
      console.log('⚠️ Method 1 error:', method1Error.message);
    }
    
    // METHOD 2: Try the $push approach with different options
    try {
      console.log('🔄 Trying method 2: $push operation...');
      
      const result = await db.collection('quizzes').findOneAndUpdate(
        { _id: quizId },
        { 
          $push: { questions: newQuestion },
          $set: { updatedAt: new Date().toISOString() }
        },
        { 
          returnDocument: 'after',
          upsert: false
        }
      );
      
      console.log('📊 Method 2 result status:', result ? 'RESULT_EXISTS' : 'NO_RESULT');
      console.log('📊 Method 2 value status:', result?.value ? 'VALUE_EXISTS' : 'NO_VALUE');
      
      if (result && result.value) {
        console.log('✅ Successfully added question using method 2 ($push)');
        console.log('📊 Quiz now has', result.value.questions.length, 'questions');
        
        // Update total points in a separate operation
        const totalPoints = result.value.questions.reduce((sum, q) => sum + (q.points || 0), 0);
        await db.collection('quizzes').updateOne(
          { _id: quizId },
          { $set: { points: totalPoints } }
        );
        
        console.log('💯 Updated total points to:', totalPoints);
        return newQuestion;
      } else {
        console.log('⚠️ Method 2 failed - no result or value');
      }
      
    } catch (method2Error) {
      console.error('⚠️ Method 2 error:', method2Error);
    }
    
    // METHOD 3: Try updateOne with $push
    try {
      console.log('🔄 Trying method 3: updateOne with $push...');
      
      const updateResult = await db.collection('quizzes').updateOne(
        { _id: quizId },
        { 
          $push: { questions: newQuestion },
          $inc: { points: newQuestion.points },
          $set: { updatedAt: new Date().toISOString() }
        }
      );
      
      console.log('📊 Method 3 update result:', {
        matchedCount: updateResult.matchedCount,
        modifiedCount: updateResult.modifiedCount
      });
      
      if (updateResult.modifiedCount === 1) {
        console.log('✅ Successfully added question using method 3 (updateOne)');
        return newQuestion;
      } else {
        console.log('⚠️ Method 3 failed - no documents modified');
      }
      
    } catch (method3Error) {
      console.error('⚠️ Method 3 error:', method3Error);
    }
    
    console.error('❌ All methods failed to add question');
    return null;
    
  } catch (error) {
    console.error('💥 Error adding question to quiz:', error);
    console.error('🔍 Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
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

// ================================
// NEW DEBUG METHODS FOR TESTING
// ================================

export async function testSimpleQuizUpdate(quizId) {
  try {
    const db = getDB();
    
    console.log('🧪 Testing simple quiz update for:', quizId);
    
    const result = await db.collection('quizzes').updateOne(
      { _id: quizId },
      { $set: { testField: 'test-' + Date.now() } }
    );
    
    console.log('📊 Simple update result:', result);
    
    return {
      success: result.modifiedCount === 1,
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount
    };
  } catch (error) {
    console.error('💥 Simple update test failed:', error);
    return { success: false, error: error.message };
  }
}

export async function forceAddQuestionDirect(quizId, questionData) {
  try {
    const db = getDB();
    
    console.log('🔧 Force adding question directly:', quizId);
    
    // Get current quiz
    const quiz = await db.collection('quizzes').findOne({ _id: quizId });
    if (!quiz) {
      return { success: false, error: 'Quiz not found' };
    }
    
    // Create new question
    const newQuestion = {
      _id: uuidv4(),
      ...questionData,
      type: questionData.type || 'multiple-choice',
      points: parseInt(questionData.points) || 1
    };
    
    // Force update using replaceOne
    const updatedQuestions = [...(quiz.questions || []), newQuestion];
    const updatedQuiz = {
      ...quiz,
      questions: updatedQuestions,
      points: updatedQuestions.reduce((sum, q) => sum + (q.points || 0), 0),
      updatedAt: new Date().toISOString()
    };
    
    const result = await db.collection('quizzes').replaceOne(
      { _id: quizId },
      updatedQuiz
    );
    
    console.log('📊 Force update result:', result);
    
    return {
      success: result.modifiedCount === 1,
      questionId: newQuestion._id,
      totalQuestions: updatedQuestions.length
    };
  } catch (error) {
    console.error('💥 Force add question failed:', error);
    return { success: false, error: error.message };
  }
}
