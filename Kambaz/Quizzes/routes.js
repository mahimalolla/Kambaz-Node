import * as quizDao from "./dao.js";

export default function QuizRoutes(app) {

  // ================================
  // ENHANCED MIDDLEWARE FOR DEBUGGING ALL QUIZ ROUTES
  // ================================
  
  // Add this middleware to log ALL requests to quiz routes
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
  // COMPREHENSIVE DEBUG ROUTES
  // ================================

  // Test complete quiz workflow
  app.get("/api/debug/test-quiz-workflow", async (req, res) => {
    try {
      console.log('🧪 Starting complete quiz workflow test...');
      
      const result = await quizDao.testCompleteQuizWorkflow();
      
      res.json({
        message: 'Quiz workflow test completed',
        timestamp: new Date().toISOString(),
        ...result
      });
      
    } catch (error) {
      console.error('💥 Quiz workflow test failed:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  });

  // Enhanced database health check
  app.get("/api/debug/database-detailed", async (req, res) => {
    try {
      console.log('🔍 Detailed database health check...');
      
      const dbResult = await quizDao.debugDatabaseConnection();
      
      // Test quiz operations
      const allQuizzes = await quizDao.findAllQuizzes();
      
      // Sample quiz for testing
      const sampleQuiz = allQuizzes.length > 0 ? allQuizzes[0] : null;
      let operationTests = null;
      
      if (sampleQuiz) {
        try {
          // Test simple update
          operationTests = await quizDao.testSimpleQuizUpdate(sampleQuiz._id);
        } catch (opError) {
          operationTests = { error: opError.message };
        }
      }
      
      const healthData = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: {
          connected: dbResult.connected,
          collections: dbResult.collections || [],
          totalQuizzes: dbResult.quizCount || 0,
          totalAttempts: dbResult.attemptCount || 0
        },
        sampleQuiz: sampleQuiz ? {
          id: sampleQuiz._id,
          title: sampleQuiz.title,
          questionCount: sampleQuiz.questions?.length || 0
        } : null,
        operationTests,
        server: {
          nodeVersion: process.version,
          platform: process.platform,
          memory: process.memoryUsage(),
          uptime: process.uptime()
        }
      };
      
      console.log('🏥 Detailed health check completed');
      res.json(healthData);
      
    } catch (error) {
      console.error('💥 Detailed health check failed:', error);
      res.status(503).json({
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Force create a test quiz for debugging
  app.post("/api/debug/create-test-quiz", async (req, res) => {
    try {
      console.log('🧪 Creating test quiz for debugging...');
      
      const testQuiz = {
        title: `Debug Test Quiz ${Date.now()}`,
        courseId: req.body.courseId || 'debug-course',
        description: 'This is a test quiz created for debugging purposes',
        quizType: 'Graded Quiz',
        assignmentGroup: 'Quizzes',
        shuffleAnswers: true,
        timeLimit: 20,
        multipleAttempts: false,
        attemptLimit: 1,
        published: false
      };
      
      const createdQuiz = await quizDao.createQuiz(testQuiz);
      
      res.json({
        success: true,
        quiz: {
          id: createdQuiz._id,
          title: createdQuiz.title,
          courseId: createdQuiz.courseId
        },
        message: 'Test quiz created successfully',
        timestamp: new Date().toISOString(),
        instructions: [
          `Use this quiz ID for testing: ${createdQuiz._id}`,
          `Test URL: /api/debug/test-quiz/${createdQuiz._id}`,
          `Update test: POST /api/debug/test-update/${createdQuiz._id}`,
          `Remember to delete this test quiz when done!`
        ]
      });
      
    } catch (error) {
      console.error('💥 Error creating test quiz:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Test specific quiz operations
  app.get("/api/debug/test-quiz/:quizId", async (req, res) => {
    try {
      const { quizId } = req.params;
      console.log('🧪 Testing operations for quiz:', quizId);
      
      // Test 1: Check if quiz exists
      const existsTest = await quizDao.testQuizExists(quizId);
      
      // Test 2: Try simple update
      const updateTest = await quizDao.testSimpleQuizUpdate(quizId);
      
      res.json({
        quizId: quizId,
        tests: {
          existence: {
            exists: !!existsTest,
            quiz: existsTest ? {
              id: existsTest._id,
              title: existsTest.title,
              questionCount: existsTest.questions?.length || 0
            } : null
          },
          simpleUpdate: updateTest
        },
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('💥 Quiz test failed:', error);
      res.status(500).json({
        error: error.message,
        quizId: req.params.quizId
      });
    }
  });

  // List all quizzes with basic info
  app.get("/api/debug/list-quizzes", async (req, res) => {
    try {
      console.log('📋 Listing all quizzes for debugging...');
      
      const quizzes = await quizDao.findAllQuizzes();
      
      const quizList = quizzes.map(quiz => ({
        id: quiz._id,
        title: quiz.title,
        courseId: quiz.courseId,
        published: quiz.published,
        questionCount: quiz.questions?.length || 0,
        points: quiz.points || 0,
        createdAt: quiz.createdAt,
        updatedAt: quiz.updatedAt
      }));
      
      res.json({
        total: quizzes.length,
        quizzes: quizList,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('💥 Error listing quizzes:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Test network connectivity from server
  app.get("/api/debug/network-test", (req, res) => {
    const testData = {
      timestamp: new Date().toISOString(),
      server: {
        nodejs: process.version,
        platform: process.platform,
        uptime: process.uptime(),
        memory: process.memoryUsage()
      },
      request: {
        method: req.method,
        url: req.url,
        headers: {
          origin: req.headers.origin,
          userAgent: req.headers['user-agent'],
          contentType: req.headers['content-type']
        }
      },
      cors: {
        origin: req.headers.origin,
        allowed: true // If this response comes back, CORS is working
      }
    };
    
    console.log('🌐 Network test requested from:', req.headers.origin);
    res.json(testData);
  });

  // ================================
  // SPECIFIC QUIZ ROUTES (MUST COME BEFORE GENERAL ONES)
  // ================================

  // Publish/Unpublish quiz - SPECIFIC ROUTE
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

  // Add question to quiz - SPECIFIC ROUTE
  app.post("/api/courses/:courseId/quizzes/:quizId/questions", async (req, res) => {
    try {
      const { quizId, courseId } = req.params;
      
      console.log('🎯 POST /questions - Full request details:');
      console.log('📋 Params:', { quizId, courseId });
      console.log('📝 Body:', req.body);
      console.log('🔗 URL:', req.url);
      
      // Validate required parameters
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

      console.log('✅ Quiz exists, proceeding with question creation');
      
      const questionData = {
        ...req.body,
        type: req.body.type || 'multiple-choice',
        points: req.body.points || 1,
        title: req.body.title || `Question ${Date.now()}`,
        question: req.body.question || ''
      };
      
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
      
      // Ensure we always return an array
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

  // Enhanced Update quiz route
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
}
