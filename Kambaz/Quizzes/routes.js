// 🔧 ENHANCED BACKEND FIXES for routes.js

// ================================
// MIDDLEWARE FOR DEBUGGING ALL QUIZ ROUTES
// ================================

// Enhanced middleware with better logging
app.use('/api/courses/:courseId/quizzes*', (req, res, next) => {
  console.log('🌐 QUIZ ROUTE HIT:', {
    method: req.method,
    url: req.url,
    fullPath: req.originalUrl,
    params: req.params,
    query: req.query,
    hasBody: !!req.body && Object.keys(req.body).length > 0,
    bodyKeys: req.body ? Object.keys(req.body) : [],
    headers: {
      contentType: req.headers['content-type'],
      origin: req.headers.origin,
      userAgent: req.headers['user-agent']?.substring(0, 50)
    }
  });
  next();
});

// ================================
// CORS PREFLIGHT HANDLER
// ================================

// Handle OPTIONS requests for CORS preflight
app.options('/api/courses/:courseId/quizzes*', (req, res) => {
  console.log('🔄 CORS Preflight request for quiz route');
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

// ================================
// ENHANCED UPDATE QUIZ ROUTE
// ================================

app.put("/api/courses/:courseId/quizzes/:quizId", async (req, res) => {
  try {
    const { quizId, courseId } = req.params;
    
    console.log('🎯 PUT QUIZ ROUTE HIT!'); 
    console.log('📋 Params:', { quizId, courseId });
    console.log('📝 Body keys:', Object.keys(req.body));
    console.log('📄 Request details:', {
      contentType: req.headers['content-type'],
      bodySize: JSON.stringify(req.body).length,
      hasQuestions: !!req.body.questions,
      questionCount: req.body.questions?.length || 0
    });
    
    // Validate required parameters
    if (!quizId || !courseId) {
      console.error('❌ Missing required parameters');
      return res.status(400).json({ 
        error: "Missing required parameters",
        details: { quizId: !!quizId, courseId: !!courseId }
      });
    }

    // Check if quiz exists BEFORE trying to update
    console.log('🔍 Checking if quiz exists...');
    const existingQuiz = await quizDao.findQuizById(quizId);
    
    if (!existingQuiz) {
      console.error('❌ Quiz not found in route check:', quizId);
      return res.status(404).json({ 
        error: "Quiz not found",
        quizId: quizId,
        courseId: courseId,
        message: "The quiz you're trying to update doesn't exist in the database"
      });
    }
    
    console.log('✅ Quiz exists in route, details:', {
      id: existingQuiz._id,
      title: existingQuiz.title,
      courseId: existingQuiz.courseId,
      currentQuestions: existingQuiz.questions?.length || 0
    });
    
    // Validate course ID matches
    if (existingQuiz.courseId !== courseId) {
      console.error('❌ Course ID mismatch:', {
        requestedCourseId: courseId,
        actualCourseId: existingQuiz.courseId
      });
      return res.status(400).json({
        error: "Course ID mismatch",
        message: "The quiz belongs to a different course"
      });
    }
    
    console.log('🔄 Calling DAO updateQuiz...');
    const updatedQuiz = await quizDao.updateQuiz(quizId, req.body);
    
    console.log('📊 DAO returned:', updatedQuiz ? 'QUIZ_OBJECT' : 'NULL');
    
    if (!updatedQuiz) {
      console.error('❌ DAO returned null - quiz update failed');
      return res.status(500).json({ 
        error: "Quiz update failed",
        quizId: quizId,
        courseId: courseId,
        message: "The quiz could not be updated. Please try again."
      });
    }
    
    console.log('✅ Successfully updated quiz in route:', {
      id: updatedQuiz._id,
      title: updatedQuiz.title,
      published: updatedQuiz.published,
      questionCount: updatedQuiz.questions?.length || 0
    });
    
    res.json(updatedQuiz);
    
  } catch (error) {
    console.error('💥 Error in PUT route:', error);
    console.error('🔍 Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// ================================
// ENHANCED PUBLISH/UNPUBLISH ROUTE
// ================================

app.patch("/api/courses/:courseId/quizzes/:quizId/publish", async (req, res) => {
  try {
    const { quizId, courseId } = req.params;
    const { published } = req.body;
    
    console.log('🚀 PATCH /publish route hit:', { quizId, courseId, published });
    
    // Validate parameters
    if (!quizId || !courseId) {
      return res.status(400).json({ 
        error: "Missing required parameters",
        details: { quizId: !!quizId, courseId: !!courseId }
      });
    }
    
    if (typeof published !== 'boolean') {
      return res.status(400).json({
        error: "Invalid published value",
        message: "Published must be a boolean value"
      });
    }
    
    // Check if quiz exists
    const existingQuiz = await quizDao.findQuizById(quizId);
    if (!existingQuiz) {
      console.log('❌ Quiz not found for publish:', quizId);
      return res.status(404).json({ 
        error: "Quiz not found",
        quizId: quizId,
        courseId: courseId 
      });
    }
    
    // Update quiz with new published status
    const updatedQuiz = await quizDao.updateQuiz(quizId, { published });
    
    if (!updatedQuiz) {
      return res.status(500).json({
        error: "Failed to update quiz publish status"
      });
    }
    
    console.log('✅ Successfully updated publish status:', {
      quizId,
      published,
      title: updatedQuiz.title
    });
    
    res.json(updatedQuiz);
    
  } catch (error) {
    console.error('💥 Error updating publish status:', error);
    res.status(500).json({ error: error.message });
  }
});

// ================================
// DATABASE HEALTH CHECK ROUTE
// ================================

app.get("/api/health/quiz-database", async (req, res) => {
  try {
    console.log('🏥 Quiz database health check');
    
    // Test database connection
    const dbResult = await quizDao.debugDatabaseConnection();
    
    // Test quiz operations
    const allQuizzes = await quizDao.findAllQuizzes();
    
    // Get sample quiz for testing
    const sampleQuiz = allQuizzes.length > 0 ? allQuizzes[0] : null;
    let updateTest = null;
    
    if (sampleQuiz) {
      try {
        // Test update operation
        updateTest = await quizDao.testSimpleQuizUpdate(sampleQuiz._id);
      } catch (err) {
        console.error('Update test failed:', err);
        updateTest = { success: false, error: err.message };
      }
    }
    
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: {
        connected: dbResult.connected,
        collections: dbResult.collections || [],
        totalQuizzes: dbResult.quizCount || 0,
        totalAttempts: dbResult.attemptCount || 0
      },
      operations: {
        canRead: allQuizzes.length >= 0,
        canUpdate: updateTest?.success || false,
        updateError: updateTest?.error || null
      },
      environment: process.env.NODE_ENV || 'unknown',
      server: {
        nodeVersion: process.version,
        platform: process.platform,
        memory: process.memoryUsage()
      }
    };
    
    console.log('🏥 Health check result:', healthStatus);
    
    const statusCode = healthStatus.database.connected && healthStatus.operations.canRead ? 200 : 503;
    res.status(statusCode).json(healthStatus);
    
  } catch (error) {
    console.error('💥 Health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// ================================
// QUIZ EXISTENCE CHECK ROUTE
// ================================

app.get("/api/courses/:courseId/quizzes/:quizId/exists", async (req, res) => {
  try {
    const { quizId, courseId } = req.params;
    console.log('🔍 Checking quiz existence:', { quizId, courseId });
    
    const quiz = await quizDao.findQuizById(quizId);
    
    if (!quiz) {
      return res.status(404).json({
        exists: false,
        quizId: quizId,
        courseId: courseId,
        message: "Quiz not found"
      });
    }
    
    const courseMatches = quiz.courseId === courseId;
    
    res.json({
      exists: true,
      courseMatches: courseMatches,
      quiz: {
        id: quiz._id,
        title: quiz.title,
        courseId: quiz.courseId,
        questionCount: quiz.questions?.length || 0,
        published: quiz.published,
        createdAt: quiz.createdAt,
        updatedAt: quiz.updatedAt
      }
    });
    
  } catch (error) {
    console.error('💥 Error checking quiz existence:', error);
    res.status(500).json({ error: error.message });
  }
});

// ================================
// ERROR HANDLER MIDDLEWARE
// ================================

// Add this after all quiz routes
app.use('/api/courses/:courseId/quizzes*', (err, req, res, next) => {
  console.error('💥 Quiz route error handler:', err);
  
  if (err.name === 'CastError') {
    return res.status(400).json({
      error: "Invalid ID format",
      message: "The provided ID is not in the correct format"
    });
  }
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: "Validation error",
      message: err.message
    });
  }
  
  res.status(500).json({
    error: "Internal server error",
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

console.log('✅ Enhanced quiz routes initialized successfully');
