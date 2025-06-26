import * as quizDao from "./dao.js";

export default function QuizRoutes(app) {  // 👈 Your routes must be INSIDE this function

  // ================================
  // MIDDLEWARE FOR DEBUGGING ALL QUIZ ROUTES
  // ================================
  
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
  // DEBUG ROUTES - PROPERLY INSIDE THE FUNCTION
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
      
      const healthData = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: dbResult,
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

  // Test network connectivity
  app.get("/api/debug/network-test", (req, res) => {
    const testData = {
      timestamp: new Date().toISOString(),
      server: {
        nodejs: process.version,
        platform: process.platform,
        uptime: process.uptime()
      },
      request: {
        method: req.method,
        url: req.url,
        origin: req.headers.origin
      }
    };
    
    console.log('🌐 Network test requested from:', req.headers.origin);
    res.json(testData);
  });

  // ================================
  // ENHANCED QUIZ ROUTES
  // ================================

  // Enhanced Update Quiz Route
  app.put("/api/courses/:courseId/quizzes/:quizId", async (req, res) => {
    try {
      const { quizId, courseId } = req.params;
      
      console.log('🎯 PUT QUIZ ROUTE HIT!'); 
      console.log('📋 Params:', { quizId, courseId });
      console.log('📝 Body keys:', Object.keys(req.body));
      
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
      
      console.log('✅ Quiz exists, calling DAO...');
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
      
      console.log('✅ Successfully updated quiz in route:', quizId);
      res.json(updatedQuiz);
      
    } catch (error) {
      console.error('💥 Error in PUT route:', error);
      res.status(500).json({ 
        error: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  });

  // Enhanced Publish/Unpublish Route
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
  // EXISTING QUIZ ROUTES (keep your current routes here)
  // ================================

  // Get all quizzes for a course
  app.get("/api/courses/:courseId/quizzes", async (req, res) => {
    try {
      const { courseId } = req.params;
      console.log('🔍 GET /quizzes for course:', courseId);
      
      const quizzes = await quizDao.findQuizzesByCourse(courseId);
      console.log('📋 Found quizzes:', Array.isArray(quizzes) ? quizzes.length : 'NOT_ARRAY');
      
      const safeQuizzes = Array.isArray(quizzes) ? quizzes : [];
      res.json(safeQuizzes);
    } catch (error) {
      console.error('💥 Error getting quizzes for course:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get specific quiz
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

  // Create new quiz
  app.post("/api/courses/:courseId/quizzes", async (req, res) => {
    try {
      const { courseId } = req.params;
      console.log('➕ POST /quizzes for course:', courseId);
      
      const quizData = {
        ...req.body,
        courseId,
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
      
      const newQuiz = await quizDao.createQuiz(quizData);
      console.log('✅ Successfully created quiz:', newQuiz._id);
      
      res.status(201).json(newQuiz);
    } catch (error) {
      console.error('💥 Error creating quiz:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Delete quiz
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
  // QUESTION ROUTES
  // ================================

  // Add question to quiz
  app.post("/api/courses/:courseId/quizzes/:quizId/questions", async (req, res) => {
    try {
      const { quizId, courseId } = req.params;
      
      console.log('🎯 POST /questions:', { quizId, courseId });
      
      if (!quizId || !courseId) {
        return res.status(400).json({ 
          error: "Missing required parameters",
          details: { quizId: !!quizId, courseId: !!courseId }
        });
      }

      const existingQuiz = await quizDao.findQuizById(quizId);
      if (!existingQuiz) {
        return res.status(404).json({ 
          error: "Quiz not found",
          quizId: quizId,
          courseId: courseId
        });
      }

      const questionData = {
        ...req.body,
        type: req.body.type || 'multiple-choice',
        points: req.body.points || 1,
        title: req.body.title || `Question ${Date.now()}`,
        question: req.body.question || ''
      };
      
      const newQuestion = await quizDao.addQuestionToQuiz(quizId, questionData);
      
      if (!newQuestion) {
        return res.status(500).json({ 
          error: "Failed to create question",
          quizId: quizId,
          courseId: courseId
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

  // Update question
  app.put("/api/courses/:courseId/quizzes/:quizId/questions/:questionId", async (req, res) => {
    try {
      const { quizId, questionId, courseId } = req.params;
      console.log('🔄 PUT /question:', { quizId, questionId, courseId });
      
      const updatedQuestion = await quizDao.updateQuestion(quizId, questionId, req.body);
      if (!updatedQuestion) {
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

  // Delete question
  app.delete("/api/courses/:courseId/quizzes/:quizId/questions/:questionId", async (req, res) => {
    try {
      const { quizId, questionId, courseId } = req.params;
      console.log('🗑️ DELETE /question:', { quizId, questionId, courseId });
      
      const deleted = await quizDao.deleteQuestion(quizId, questionId);
      if (!deleted) {
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
  // QUIZ ATTEMPT ROUTES
  // ================================

  // Submit quiz attempt
  app.post("/api/courses/:courseId/quizzes/:quizId/attempts", async (req, res) => {
    try {
      const { quizId, courseId } = req.params;
      const { userId, answers } = req.body;
      
      console.log('📝 POST /attempts:', { quizId, courseId, userId });
      
      const quiz = await quizDao.findQuizById(quizId);
      if (!quiz) {
        return res.status(404).json({ 
          error: "Quiz not found",
          quizId: quizId,
          courseId: courseId
        });
      }
      
      const existingAttempts = await quizDao.findAttemptsByQuizAndUser(quizId, userId);
      
      if (!quiz.multipleAttempts && existingAttempts.length > 0) {
        return res.status(400).json({ error: "Multiple attempts not allowed" });
      }
      
      if (quiz.multipleAttempts && existingAttempts.length >= quiz.attemptLimit) {
        return res.status(400).json({ error: "Maximum attempts exceeded" });
      }
      
      const scoreResult = quizDao.calculateScore(quiz.questions, answers);
      
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
      
      res.status(201).json({
        ...newAttempt,
        ...scoreResult
      });
    } catch (error) {
      console.error('💥 Error creating quiz attempt:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get user attempts
  app.get("/api/courses/:courseId/quizzes/:quizId/attempts/:userId", async (req, res) => {
    try {
      const { quizId, userId, courseId } = req.params;
      const attempts = await quizDao.findAttemptsByQuizAndUser(quizId, userId);
      res.json(attempts);
    } catch (error) {
      console.error('💥 Error getting user attempts:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get all attempts
  app.get("/api/courses/:courseId/quizzes/:quizId/attempts", async (req, res) => {
    try {
      const { quizId, courseId } = req.params;
      const attempts = await quizDao.findAllAttemptsByQuiz(quizId);
      res.json(attempts);
    } catch (error) {
      console.error('💥 Error getting all attempts:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get quiz stats
  app.get("/api/courses/:courseId/quizzes/:quizId/stats", async (req, res) => {
    try {
      const { quizId, courseId } = req.params;
      const stats = await quizDao.getQuizStats(quizId);
      res.json(stats);
    } catch (error) {
      console.error('💥 Error getting quiz stats:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Test route
  app.get("/api/quizzes/test", (req, res) => {
    res.json({ 
      message: "Quiz routes are working!", 
      timestamp: new Date().toISOString(),
      database: "MongoDB"
    });
  });

  console.log('✅ Quiz routes initialized successfully');

} // 👈 CLOSING BRACE FOR QuizRoutes FUNCTION - VERY IMPORTANT!
