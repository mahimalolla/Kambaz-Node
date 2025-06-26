import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

// Helper to get MongoDB collections
const getDB = () => mongoose.connection.db;

// ================================
// QUIZ CRUD OPERATIONS - SIMPLIFIED & FIXED
// ================================

export async function findAllQuizzes() {
  try {
    const db = getDB();
    const quizzes = await db.collection('quizzes').find({}).toArray();
    console.log('📋 Found', quizzes.length, 'total quizzes');
    return quizzes;
  } catch (error) {
    console.error('💥 Error finding all quizzes:', error);
    throw new Error(`Failed to find quizzes: ${error.message}`);
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
    throw new Error(`Failed to find quizzes for course ${courseId}: ${error.message}`);
  }
}

export async function findQuizById(quizId) {
  try {
    const db = getDB();
    console.log('🔍 Finding quiz by ID:', quizId);
    
    if (!quizId) {
      throw new Error('Quiz ID is required');
    }
    
    const quiz = await db.collection('quizzes').findOne({ _id: quizId });
    console.log('🎯 Quiz found:', quiz ? 'YES' : 'NO');
    
    if (!quiz) {
      throw new Error(`Quiz with ID ${quizId} not found`);
    }
    
    console.log('📝 Quiz details:', {
      id: quiz._id,
      title: quiz.title,
      courseId: quiz.courseId,
      questionCount: quiz.questions?.length || 0
    });
    
    return quiz;
  } catch (error) {
    console.error('💥 Error finding quiz by ID:', error);
    throw error;
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
    
    const result = await db.collection('quizzes').insertOne(newQuiz);
    
    if (!result.acknowledged) {
      throw new Error('Failed to create quiz - database did not acknowledge insert');
    }
    
    console.log('✅ Successfully created quiz:', newQuiz._id);
    return newQuiz;
  } catch (error) {
    console.error('💥 Error creating quiz:', error);
    throw new Error(`Failed to create quiz: ${error.message}`);
  }
}

// 🔧 COMPLETELY REWRITTEN - SIMPLIFIED AND FIXED
export async function updateQuiz(quizId, quizUpdates) {
  try {
    const db = getDB();
    
    console.log('🔄 Starting updateQuiz:', { quizId, updateKeys: Object.keys(quizUpdates) });
    
    if (!quizId) {
      throw new Error('Quiz ID is required');
    }
    
    if (!quizUpdates || Object.keys(quizUpdates).length === 0) {
      throw new Error('No updates provided');
    }
    
    // 🔍 First check if quiz exists
    const existingQuiz = await db.collection('quizzes').findOne({ _id: quizId });
    if (!existingQuiz) {
      console.error('❌ Quiz not found for update:', quizId);
      throw new Error(`Quiz with ID ${quizId} not found`);
    }
    
    console.log('✅ Quiz exists, current title:', existingQuiz.title);
    
    // 🧹 Clean the update data - remove undefined values
    const cleanUpdateData = {};
    Object.keys(quizUpdates).forEach(key => {
      if (quizUpdates[key] !== undefined) {
        cleanUpdateData[key] = quizUpdates[key];
      }
    });
    
    // Add updatedAt timestamp
    cleanUpdateData.updatedAt = new Date().toISOString();
    
    console.log('📝 Clean update data:', Object.keys(cleanUpdateData));
    
    // 🔄 Perform the update using findOneAndUpdate with proper options
    const result = await db.collection('quizzes').findOneAndUpdate(
      { _id: quizId },
      { $set: cleanUpdateData },
      { 
        returnDocument: 'after',  // Return updated document
        upsert: false            // Don't create if doesn't exist
      }
    );
    
    console.log('📊 Update result:', {
      found: !!result.value,
      lastErrorObject: result.lastErrorObject
    });
    
    if (!result.value) {
      throw new Error(`Failed to update quiz ${quizId} - no document returned`);
    }
    
    console.log('✅ Successfully updated quiz:', {
      id: result.value._id,
      title: result.value.title,
      published: result.value.published
    });
    
    return result.value;
    
  } catch (error) {
    console.error('💥 Error updating quiz:', {
      quizId,
      error: error.message,
      stack: error.stack
    });
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
      throw new Error(`Quiz with ID ${quizId} not found or already deleted`);
    }
    
    // Remove all attempts for this quiz
    await db.collection('quizAttempts').deleteMany({ quizId });
    
    console.log('✅ Successfully deleted quiz:', quizId);
    return true;
  } catch (error) {
    console.error('💥 Error deleting quiz:', error);
    throw new Error(`Failed to delete quiz: ${error.message}`);
  }
}

// ================================
// QUESTION OPERATIONS - COMPLETELY REWRITTEN
// ================================

export async function addQuestionToQuiz(quizId, question) {
  try {
    const db = getDB();
    
    console.log('🔍 Adding question to quiz:', quizId);
    console.log('📝 Question data:', {
      type: question.type,
      title: question.title,
      points: question.points
    });
    
    if (!quizId) {
      throw new Error('Quiz ID is required');
    }
    
    if (!question) {
      throw new Error('Question data is required');
    }
    
    // 🔍 Verify the quiz exists
    const existingQuiz = await db.collection('quizzes').findOne({ _id: quizId });
    if (!existingQuiz) {
      throw new Error(`Quiz with ID ${quizId} not found`);
    }
    
    console.log('📋 Quiz found:', {
      id: existingQuiz._id,
      title: existingQuiz.title,
      currentQuestions: existingQuiz.questions?.length || 0
    });
    
    // 🆕 Create a clean question object
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
    
    // 🔄 Use $push to add the question and $inc to update total points
    const result = await db.collection('quizzes').findOneAndUpdate(
      { _id: quizId },
      { 
        $push: { questions: newQuestion },
        $inc: { points: newQuestion.points },
        $set: { updatedAt: new Date().toISOString() }
      },
      { 
        returnDocument: 'after',
        upsert: false
      }
    );
    
    if (!result.value) {
      throw new Error('Failed to add question - quiz not found or update failed');
    }
    
    console.log('✅ Successfully added question:', {
      questionId: newQuestion._id,
      totalQuestions: result.value.questions.length,
      totalPoints: result.value.points
    });
    
    return newQuestion;
    
  } catch (error) {
    console.error('💥 Error adding question to quiz:', error);
    throw error;
  }
}

export async function updateQuestion(quizId, questionId, questionUpdates) {
  try {
    const db = getDB();
    
    console.log('🔄 Updating question:', { quizId, questionId });
    console.log('📝 Update data:', Object.keys(questionUpdates));
    
    if (!quizId || !questionId) {
      throw new Error('Quiz ID and Question ID are required');
    }
    
    // Create complete question object
    const updatedQuestion = {
      ...questionUpdates,
      _id: questionId
    };
    
    // 🔄 Update the specific question in the array
    const result = await db.collection('quizzes').findOneAndUpdate(
      { 
        _id: quizId,
        "questions._id": questionId
      },
      { 
        $set: {
          "questions.$": updatedQuestion,
          updatedAt: new Date().toISOString()
        }
      },
      { returnDocument: 'after' }
    );
    
    if (!result.value) {
      throw new Error(`Question ${questionId} not found in quiz ${quizId}`);
    }
    
    // 🔄 Recalculate total points
    const totalPoints = result.value.questions.reduce((sum, q) => sum + (q.points || 0), 0);
    await db.collection('quizzes').updateOne(
      { _id: quizId },
      { $set: { points: totalPoints } }
    );
    
    console.log('✅ Successfully updated question:', questionId);
    
    const updatedQuestionResult = result.value.questions.find(q => q._id === questionId);
    return updatedQuestionResult;
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
    
    const result = await db.collection('quizzes').findOneAndUpdate(
      { _id: quizId },
      { 
        $pull: { questions: { _id: questionId } },
        $set: { updatedAt: new Date().toISOString() }
      },
      { returnDocument: 'after' }
    );
    
    if (!result.value) {
      throw new Error(`Quiz ${quizId} not found`);
    }
    
    // 🔄 Recalculate total points
    const totalPoints = result.value.questions.reduce((sum, q) => sum + (q.points || 0), 0);
    await db.collection('quizzes').updateOne(
      { _id: quizId },
      { $set: { points: totalPoints } }
    );
    
    console.log('✅ Successfully deleted question:', questionId);
    return true;
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
    
    if (!result.acknowledged) {
      throw new Error('Failed to create quiz attempt');
    }
    
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
    throw error;
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
    throw error;
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
    throw error;
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
// DEBUG FUNCTIONS - ENHANCED
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
    throw error;
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
// NEW COMPREHENSIVE TEST METHODS
// ================================

export async function testSimpleQuizUpdate(quizId) {
  try {
    const db = getDB();
    
    console.log('🧪 Testing simple quiz update for:', quizId);
    
    const testData = { 
      testField: 'test-' + Date.now(),
      updatedAt: new Date().toISOString()
    };
    
    const result = await db.collection('quizzes').findOneAndUpdate(
      { _id: quizId },
      { $set: testData },
      { returnDocument: 'after' }
    );
    
    console.log('📊 Simple update result:', {
      found: !!result.value,
      testFieldValue: result.value?.testField
    });
    
    return {
      success: !!result.value,
      found: !!result.value,
      testField: result.value?.testField
    };
  } catch (error) {
    console.error('💥 Simple update test failed:', error);
    return { 
      success: false, 
      error: error.message 
    };
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
    
    console.log('📊 Force update result:', {
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount
    });
    
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

// 🆕 NEW: Test complete quiz workflow
export async function testCompleteQuizWorkflow() {
  try {
    const db = getDB();
    console.log('🧪 Testing complete quiz workflow...');
    
    // 1. Create test quiz
    const testQuiz = {
      title: 'Test Quiz ' + Date.now(),
      courseId: 'test-course',
      description: 'Test quiz for debugging',
      published: false
    };
    
    const createdQuiz = await createQuiz(testQuiz);
    console.log('✅ Created test quiz:', createdQuiz._id);
    
    // 2. Update quiz
    const updateResult = await updateQuiz(createdQuiz._id, { 
      title: 'Updated Test Quiz',
      published: true 
    });
    console.log('✅ Updated test quiz:', updateResult.title);
    
    // 3. Add question
    const testQuestion = {
      type: 'multiple-choice',
      title: 'Test Question',
      points: 5,
      question: 'What is 2+2?',
      choices: ['3', '4', '5', '6'],
      correctAnswer: 1
    };
    
    const addedQuestion = await addQuestionToQuiz(createdQuiz._id, testQuestion);
    console.log('✅ Added test question:', addedQuestion._id);
    
    // 4. Verify final state
    const finalQuiz = await findQuizById(createdQuiz._id);
    console.log('✅ Final quiz state:', {
      title: finalQuiz.title,
      published: finalQuiz.published,
      questionCount: finalQuiz.questions.length,
      totalPoints: finalQuiz.points
    });
    
    // 5. Cleanup
    await deleteQuiz(createdQuiz._id);
    console.log('✅ Cleaned up test quiz');
    
    return {
      success: true,
      message: 'Complete workflow test passed',
      results: {
        created: !!createdQuiz,
        updated: !!updateResult,
        questionAdded: !!addedQuestion,
        finalState: {
          questions: finalQuiz.questions.length,
          points: finalQuiz.points,
          published: finalQuiz.published
        }
      }
    };
    
  } catch (error) {
    console.error('💥 Complete workflow test failed:', error);
    return {
      success: false,
      error: error.message,
      stack: error.stack
    };
  }
}
