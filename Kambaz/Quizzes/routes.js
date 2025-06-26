import * as quizDao from "./dao.js";

export default function QuizRoutes(app) {

  // ================================
  // MIDDLEWARE FOR DEBUGGING ALL QUIZ ROUTES
  // ================================
  
  // Add this middleware to log ALL requests to quiz routes
  app.use('/api/courses/:courseId/quizzes*', (req, res, next) => {
    console.log('🌐 QUIZ ROUTE HIT:', {
      method: req.method,
      url: req.url,
      params: req.params,
      query: req.query,
      hasBody: !!req.body && Object.keys(req.body).length > 0
    });
    next();
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

  // Publish/Unpublish quiz - SPECIFIC ROUTE
  app.patch("/api/courses/:courseId/quizzes/:quizId/publish", async (req, res) => {
    try {
      const { quizId, courseId } = req.params;
      const { published } = req.body;
      console.log('🚀 PATCH /publish:', { quizId, courseId, published });
      
      const updatedQuiz = await quizDao.updateQuiz(quizId, { published });
      if (!updatedQuiz) {
        console.log('❌ Quiz not found for publish:', quizId);
        return res.status(404).json({ 
          error: "Quiz not found",
          quizId: quizId,
          courseId: courseId 
        });
      }
      
      console.log('✅ Successfully updated publish status:', quizId, 'published:', published);
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

  // 🔧 FIXED: Enhanced Update quiz route with extensive debugging
  app.put("/api/courses/:courseId/quizzes/:quizId", async (req, res) => {
    try {
      const { quizId, courseId } = req.params;
      
      console.log('🎯 PUT route HIT!'); 
      console.log('📋 Params:', { quizId, courseId });
      console.log('📝 Body keys:', Object.keys(req.body));
      console.log('📄 Body sample:', {
        title: req.body.title,
        published: req.body.published,
        hasQuestions: !!req.body.questions
      });
      
      // Check if quiz exists BEFORE trying to update
      const existingQuiz = await quizDao.findQuizById(quizId);
      if (!existingQuiz) {
        console.error('❌ Quiz not found in route check:', quizId);
        return res.status(404).json({ 
          error: "Quiz not found in route check",
          quizId: quizId,
          courseId: courseId 
        });
      }
      
      console.log('✅ Quiz exists in route, calling DAO...');
      const updatedQuiz = await quizDao.updateQuiz(quizId, req.body);
      
      console.log('📊 DAO returned:', updatedQuiz ? 'QUIZ_OBJECT' : 'NULL');
      
      if (!updatedQuiz) {
        console.error('❌ DAO returned null - returning 404 from route');
        return res.status(404).json({ 
          error: "Quiz not found",
          quizId: quizId,
          courseId: courseId,
          message: "DAO updateQuiz returned null"
        });
      }
      
      console.log('✅ Successfully updated quiz in route:', quizId);
      res.json(updatedQuiz);
    } catch (error) {
      console.error('💥 Error in PUT route:', error);
      res.status(500).json({ error: error.message });
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

  console.log('✅ Quiz routes initialized successfully');
}
