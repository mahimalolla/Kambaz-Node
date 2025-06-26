import * as quizDao from "./dao.js";

export default function QuizRoutes(app) {

  // ================================
  // ENHANCED MIDDLEWARE FOR DEBUGGING ALL QUIZ ROUTES
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
  // DEBUG ROUTES
  // ================================

  // Test if specific quiz exists
  app.get("/api/courses/:courseId/quizzes/:quizId/test", async (req, res) => {
    try {
      const { quizId, courseId } = req.params;
      console.log('🧪 Testing quiz existence:', { quizId, courseId });
      
      const quiz = await quizDao.testQuizExists(quizId);
      
      res.json({
        exists: !!quiz,
        quizId: quizId,
        courseId: courseId,
        quiz: quiz ? {
          id: quiz._id,
          title: quiz.title,
          courseId: quiz.courseId,
          questionCount: quiz.questions?.length || 0,
          published: quiz.published
        } : null
      });
    } catch (error) {
      console.error('💥 Error in quiz test route:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Enhanced quiz existence check
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

  // Enhanced database health check
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

  // Test database connection
  app.get("/api/debug/database", async (req, res) => {
    try {
      const result = await quizDao.debugDatabaseConnection();
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Test route to verify quiz routes are working
  app.get("/api/quizzes/test", (req, res) => {
    res.json({ 
      message: "Quiz routes are working!", 
      timestamp: new Date().toISOString(),
      database: "MongoDB (not in-memory)",
      availableRoutes: [
        "GET /api/courses/:courseId/quizzes",
        "GET /api/courses/:courseId/quizzes/:quizId",
        "POST /api/courses/:courseId/quizzes",
        "PUT /api/courses/:courseId/quizzes/:quizId",
        "DELETE /api/courses/:courseId/quizzes/:quizId",
        "PATCH /api/courses/:courseId/quizzes/:quizId/publish",
        "POST /api/courses/:courseId/quizzes/:quizId/questions",
        "PUT /api/courses/:courseId/quizzes/:quizId/questions/:questionId",
        "DELETE /api/courses/:courseId/quizzes/:quizId/questions/:questionId",
        "POST /api/courses/:courseId/quizzes/:quizId/attempts",
        "GET /api/courses/:courseId/quizzes/:quizId/attempts/:userId",
        "GET /api/courses/:courseId/quizzes/:quizId/attempts",
        "GET /api/courses/:courseId/quizzes/:quizId/stats"
      ]
    });
  });

  // ================================
  // SPECIFIC QUIZ ROUTES (MUST COME BEFORE GENERAL ONES)
  // ================================

  // 🔧 ENHANCED: Publish/Unpublish quiz - SPECIFIC ROUTE
  app.patch("/api/courses/:courseId/quizzes/:quizId/publish", async (req, res) => {
    try {
      const { quizId, courseId } = req.params;
      const { published } = req.body;
      
      console.log('🚀 PATCH /publish route hit:', { quizId, courseId, published });
      
      // Enhanced validation
      if (!quizId || !courseId) {
        console.error('❌ Missing required parameters');
        return res.status(400).json({ 
          error: "Missing required parameters",
          details: { quizId: !!quizId, courseId: !!courseId }
        });
      }
      
      if (typeof published !== 'boolean') {
        console.error('❌ Invalid published value:', published);
        return res.status(400).json({
          error: "Invalid published value",
          message: "Published must be a boolean value",
          received: typeof published
        });
      }
      
      // Check if quiz exists and belongs to course
      const existingQuiz = await quizDao.findQuizById(quizId);
      if (!existingQuiz) {
        console.log('❌ Quiz not found for publish:', quizId);
        return res.status(404).json({ 
          error: "Quiz not found",
          quizId: quizId,
          courseId: courseId 
        });
      }
      
      // Validate course ownership
      if (existingQuiz.courseId !== courseId) {
        console.error('❌ Course ID mismatch for publish:', {
          requestedCourseId: courseId,
          actualCourseId: existingQuiz.courseId
        });
        return res.status(400).json({
          error: "Quiz does not belong to this course",
          quizId: quizId,
          courseId: courseId
        });
      }
      
      console.log('✅ Quiz exists and belongs to course, updating...');
      const updatedQuiz = await quizDao.updateQuiz(quizId, { published });
      
      if (!updatedQuiz) {
        console.error('❌ Failed to update quiz publish status');
        return res.status(500).json({
          error: "Failed to update quiz publish status",
          message: "Database update operation failed"
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
      res.status(500).json({ 
        error: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  });

  // Quiz statistics - SPECIFIC ROUTE  
  app.get("/api/courses/:courseId/quizzes/:quizId/stats", async (req, res) => {
    try {
      const { quizId, courseId } = req.params;
      console.log('📊 GET /stats for quiz:', { quizId, courseId });
      
      const stats = await quizDao.getQuizStats(quizId);
      console.log('📊 Generated stats:', stats);
      
      res.json(stats);
    } catch (error) {
      console.error('💥 Error getting quiz stats:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // ================================
  // QUIZ ATTEMPT ROUTES - SPECIFIC
  // ================================

  // Get user's attempts for a quiz - SPECIFIC ROUTE
  app.get("/api/courses/:courseId/quizzes/:quizId/attempts/:userId", async (req, res) => {
    try {
      const { quizId, userId, courseId } = req.params;
      console.log('🔍 GET /attempts for user:', { quizId, userId, courseId });
      
      const attempts = await quizDao.findAttemptsByQuizAndUser(quizId, userId);
      console.log('📋 Found attempts:', attempts.length);
      
      res.json(attempts);
    } catch (error) {
      console.error('💥 Error getting user attempts:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get all attempts for a quiz - SPECIFIC ROUTE
  app.get("/api/courses/:courseId/quizzes/:quizId/attempts", async (req, res) => {
    try {
      const { quizId, courseId } = req.params;
      console.log('🔍 GET /attempts (all) for quiz:', { quizId, courseId });
      
      const attempts = await quizDao.findAllAttemptsByQuiz(quizId);
      console.log('📋 Found total attempts:', attempts.length);
      
      res.json(attempts);
    } catch (error) {
      console.error('💥 Error getting all attempts:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Submit quiz attempt - SPECIFIC ROUTE
  app.post("/api/courses/:courseId/quizzes/:quizId/attempts", async (req, res) => {
    try {
      const { quizId, courseId } = req.params;
      const { userId, answers } = req.body;
      
      console.log('📝 POST /attempts:', { quizId, courseId, userId });
      console.log('📋 Answers provided:', Object.keys(answers).length);
      
      // Get quiz to calculate score
      const quiz = await quizDao.findQuizById(quizId);
      if (!quiz) {
        console.log('❌ Quiz not found for attempt:', quizId);
        return res.status(404).json({ 
          error: "Quiz not found",
          quizId: quizId,
          courseId: courseId
        });
      }
      
      // Check if student can take quiz (attempt limits, etc.)
      const existingAttempts = await quizDao.findAttemptsByQuizAndUser(quizId, userId);
      console.log('📊 Existing attempts:', existingAttempts.length);
      
      if (!quiz.multipleAttempts && existingAttempts.length > 0) {
        console.log('❌ Multiple attempts not allowed');
        return res.status(400).json({ error: "Multiple attempts not allowed" });
      }
      
      if (quiz.multipleAttempts && existingAttempts.length >= quiz.attemptLimit) {
        console.log('❌ Maximum attempts exceeded');
        return res.status(400).json({ error: "Maximum attempts exceeded" });
      }
      
      // Calculate score
      const scoreResult = quizDao.calculateScore(quiz.questions, answers);
      console.log('🧮 Score calculated:', scoreResult);
      
      const attemptData = {
        quizId,
        userId,
        answers,
        score: scoreResult.score,
        maxScore: scoreResult.maxScore,
        percentage: scoreResult.percentage,
        timeSpent: req.body.timeSpent || 0
      };
      
      const newAttempt = await quizDao.createQuizAttempt(attemptData);
      console.log('✅ Successfully created attempt:', newAttempt._id);
      
      res.status(201).json({
        ...newAttempt,
        ...scoreResult
      });
    } catch (error) {
      console.error('💥 Error creating quiz attempt:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // ================================
  // QUESTION ROUTES - SPECIFIC
  // ================================

  // 🔧 ENHANCED: Add question to quiz - SPECIFIC ROUTE
  app.post("/api/courses/:courseId/quizzes/:quizId/questions", async (req, res) => {
    try {
      const { quizId, courseId } = req.params;
      
      console.log('🎯 POST /questions - Enhanced request details:');
      console.log('📋 Params:', { quizId, courseId });
      console.log('📝 Body:', req.body);
      console.log('🔗 URL:', req.url);
      
      // Enhanced validation
      if (!quizId || !courseId) {
        console.error('❌ Missing required parameters');
        return res.status(400).json({ 
          error: "Missing required parameters",
          details: { quizId: !!quizId, courseId: !!courseId }
        });
      }

      // Validate quiz exists first
      const existingQuiz = await quizDao.findQuizById(quizId);
      if (!existingQuiz) {
        console.error('❌ Quiz not found before question creation');
        return res.status(404).json({ 
          error: "Quiz not found",
          quizId: quizId,
          courseId: courseId,
          message: "The quiz you're trying to add a question to doesn't exist"
        });
      }

      // Validate course ownership
      if (existingQuiz.courseId !== courseId) {
        console.error('❌ Course ID mismatch for question creation');
        return res.status(400).json({
          error: "Quiz does not belong to this course",
          quizId: quizId,
          courseId: courseId
        });
      }

      console.log('✅ Quiz exists and belongs to course, proceeding with question creation');
      
      // Enhanced question data validation
      const questionData = {
        ...req.body,
        type: req.body.type || 'multiple-choice',
        points: parseInt(req.body.points) || 1,
        title: req.body.title || `Question ${Date.now()}`,
        question: req.body.question || ''
      };
      
      // Validate question type specific data
      if (questionData.type === 'multiple-choice' && !questionData.choices) {
        questionData.choices = ['', '', '', ''];
        questionData.correctAnswer = 0;
      }
      
      console.log('📋 Processed question data:', {
        type: questionData.type,
        title: questionData.title,
        points: questionData.points,
        hasChoices: !!questionData.choices,
        hasCorrectAnswer: questionData.correctAnswer !== undefined
      });
      
      const newQuestion = await quizDao.addQuestionToQuiz(quizId, questionData);
      
      if (!newQuestion) {
        console.error('❌ Question creation failed');
        return res.status(500).json({ 
          error: "Failed to create question",
          quizId: quizId,
          courseId: courseId,
          message: "Question creation failed in database operation"
        });
      }
      
      console.log('✅ Successfully created question:', newQuestion._id);
      res.status(201).json(newQuestion);
      
    } catch (error) {
      console.error('💥 Error in question creation route:', error);
      res.status(500).json({ 
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  });

  // Update question - SPECIFIC ROUTE
  app.put("/api/courses/:courseId/quizzes/:quizId/questions/:questionId", async (req, res) => {
    try {
      const { quizId, questionId, courseId } = req.params;
      console.log('🔄 PUT /question:', { quizId, questionId, courseId });
      console.log('📝 Update data:', Object.keys(req.body));
      
      const updatedQuestion = await quizDao.updateQuestion(quizId, questionId, req.body);
      if (!updatedQuestion) {
        console.log('❌ Question or Quiz not found for update:', { quizId, questionId });
        return res.status(404).json({ 
          error: "Question or Quiz not found",
          quizId: quizId,
          questionId: questionId,
          courseId: courseId
        });
      }
      
      console.log('✅ Successfully updated question:', questionId);
      res.json(updatedQuestion);
    } catch (error) {
      console.error('💥 Error updating question:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Delete question - SPECIFIC ROUTE
  app.delete("/api/courses/:courseId/quizzes/:quizId/questions/:questionId", async (req, res) => {
    try {
      const { quizId, questionId, courseId } = req.params;
      console.log('🗑️ DELETE /question:', { quizId, questionId, courseId });
      
      const deleted = await quizDao.deleteQuestion(quizId, questionId);
      if (!deleted) {
        console.log('❌ Question or Quiz not found for deletion:', { quizId, questionId });
        return res.status(404).json({ 
          error: "Question or Quiz not found",
          quizId: quizId,
          questionId: questionId,
          courseId: courseId
        });
      }
      
      console.log('✅ Successfully deleted question:', questionId);
      res.json({ message: "Question deleted successfully" });
    } catch (error) {
      console.error('💥 Error deleting question:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // ================================
  // GENERAL QUIZ ROUTES (MUST COME AFTER SPECIFIC ONES)
  // ================================

  // Get all quizzes for a course - GENERAL ROUTE
  app.get("/api/courses/:courseId/quizzes", async (req, res) => {
    try {
      const { courseId } = req.params;
      console.log('🔍 GET /quizzes for course:', courseId);
      
      const quizzes = await quizDao.findQuizzesByCourse(courseId);
      console.log('📋 Found quizzes:', Array.isArray(quizzes) ? quizzes.length : 'NOT_ARRAY');
      
      // 🔧 FIXED: Ensure we always return an array
      const safeQuizzes = Array.isArray(quizzes) ? quizzes : [];
      res.json(safeQuizzes);
    } catch (error) {
      console.error('💥 Error getting quizzes for course:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get specific quiz - GENERAL ROUTE
  app.get("/api/courses/:courseId/quizzes/:quizId", async (req, res) => {
    try {
      const { quizId, courseId } = req.params;
      console.log('🔍 GET /quiz:', { quizId, courseId });
      
      const quiz = await quizDao.findQuizById(quizId);
      if (!quiz) {
        console.log('❌ Quiz not found:', quizId);
        return res.status(404).json({ 
          error: "Quiz not found",
          quizId: quizId,
          courseId: courseId 
        });
      }
      
      console.log('✅ Quiz found:', quiz.title);
      res.json(quiz);
    } catch (error) {
      console.error('💥 Error getting quiz:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Create new quiz - GENERAL ROUTE
  app.post("/api/courses/:courseId/quizzes", async (req, res) => {
    try {
      const { courseId } = req.params;
      console.log('➕ POST /quizzes for course:', courseId);
      console.log('📝 Request body:', Object.keys(req.body));
      
      const quizData = {
        ...req.body,
        courseId,
        // Set defaults from requirements
        quizType: req.body.quizType || "Graded Quiz",
        assignmentGroup: req.body.assignmentGroup || "Quizzes",
        shuffleAnswers: req.body.shuffleAnswers !== undefined ? req.body.shuffleAnswers : true,
        timeLimit: req.body.timeLimit || 20,
        multipleAttempts: req.body.multipleAttempts || false,
        attemptLimit: req.body.attemptLimit || 1,
        showCorrectAnswers: req.body.showCorrectAnswers || "Immediately",
        oneQuestionAtATime: req.body.oneQuestionAtATime !== undefined ? req.body.oneQuestionAtATime : true,
        webcamRequired: req.body.webcamRequired || false,
        lockQuestionsAfterAnswering: req.body.lockQuestionsAfterAnswering || false,
        accessCode: req.body.accessCode || "",
        title: req.body.title || `New Quiz`,
        description: req.body.description || "",
        points: 0,
        questions: []
      };
      
      console.log('📋 Creating quiz with data:', {
        title: quizData.title,
        courseId: quizData.courseId,
        quizType: quizData.quizType
      });
      
      const newQuiz = await quizDao.createQuiz(quizData);
      console.log('✅ Successfully created quiz:', newQuiz._id);
      
      res.status(201).json(newQuiz);
    } catch (error) {
      console.error('💥 Error creating quiz:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // 🔧 ENHANCED: Update quiz route with extensive debugging and validation
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
        questionCount: req.body.questions?.length || 0,
        published: req.body.published
      });
      
      // Enhanced validation
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

  // Delete quiz - GENERAL ROUTE
  app.delete("/api/courses/:courseId/quizzes/:quizId", async (req, res) => {
    try {
      const { quizId, courseId } = req.params;
      console.log('🗑️ DELETE /quiz:', { quizId, courseId });
      
      const deleted = await quizDao.deleteQuiz(quizId);
      if (!deleted) {
        console.log('❌ Quiz not found for deletion:', quizId);
        return res.status(404).json({ 
          error: "Quiz not found",
          quizId: quizId,
          courseId: courseId 
        });
      }
      
      console.log('✅ Successfully deleted quiz:', quizId);
      res.json({ message: "Quiz deleted successfully" });
    } catch (error) {
      console.error('💥 Error deleting quiz:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // ================================
  // HEALTH CHECK ROUTES
  // ================================

  // Health check for quiz system
  app.get("/api/health/quiz", async (req, res) => {
    try {
      console.log('🏥 Health check for quiz system');
      
      // Test database connection
      const dbResult = await quizDao.debugDatabaseConnection();
      
      // Test quiz operations
      const allQuizzes = await quizDao.findAllQuizzes();
      
      const healthStatus = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: dbResult.connected ? 'connected' : 'disconnected',
        collections: dbResult.collections || [],
        totalQuizzes: dbResult.quizCount || 0,
        totalAttempts: dbResult.attemptCount || 0,
        environment: process.env.NODE_ENV || 'unknown'
      };
      
      console.log('🏥 Health check result:', healthStatus);
      res.json(healthStatus);
      
    } catch (error) {
      console.error('💥 Health check failed:', error);
      res.status(500).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message
      });
    }
  });

  // ================================
  // ERROR HANDLER MIDDLEWARE
  // ================================

  // Enhanced error handler for quiz routes
  app.use('/api/courses/:courseId/quizzes*', (err, req, res, next) => {
    console.error('💥 Quiz route error handler:', err);
    console.error('🔍 Request details:', {
      method: req.method,
      url: req.url,
      params: req.params,
      body: req.body
    });
    
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
    
    if (err.code === 11000) {
      return res.status(409).json({
        error: "Duplicate key error",
        message: "A resource with this identifier already exists"
      });
    }
    
    res.status(500).json({
      error: "Internal server error",
      message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
      timestamp: new Date().toISOString()
    });
  });

  console.log('✅ Enhanced quiz routes initialized successfully');
}
