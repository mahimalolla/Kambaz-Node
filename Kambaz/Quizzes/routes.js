import * as quizDao from "./dao.js";

export default function QuizRoutes(app) {

  // Get all quizzes for a course
  app.get("/api/courses/:courseId/quizzes", (req, res) => {
    try {
      const { courseId } = req.params;
      const quizzes = quizDao.findQuizzesByCourse(courseId);
      res.json(quizzes);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get specific quiz
  app.get("/api/courses/:courseId/quizzes/:quizId", (req, res) => {
    try {
      const { quizId } = req.params;
      const quiz = quizDao.findQuizById(quizId);
      if (!quiz) {
        return res.status(404).json({ error: "Quiz not found" });
      }
      res.json(quiz);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create new quiz
  app.post("/api/courses/:courseId/quizzes", (req, res) => {
    try {
      const { courseId } = req.params;
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
      
      const newQuiz = quizDao.createQuiz(quizData);
      res.status(201).json(newQuiz);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update quiz
  app.put("/api/courses/:courseId/quizzes/:quizId", (req, res) => {
    try {
      const { quizId } = req.params;
      const updatedQuiz = quizDao.updateQuiz(quizId, req.body);
      if (!updatedQuiz) {
        return res.status(404).json({ error: "Quiz not found" });
      }
      res.json(updatedQuiz);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Delete quiz
  app.delete("/api/courses/:courseId/quizzes/:quizId", (req, res) => {
    try {
      const { quizId } = req.params;
      const deleted = quizDao.deleteQuiz(quizId);
      if (!deleted) {
        return res.status(404).json({ error: "Quiz not found" });
      }
      res.json({ message: "Quiz deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Publish/Unpublish quiz
  app.patch("/api/courses/:courseId/quizzes/:quizId/publish", (req, res) => {
    try {
      const { quizId } = req.params;
      const { published } = req.body;
      const updatedQuiz = quizDao.updateQuiz(quizId, { published });
      if (!updatedQuiz) {
        return res.status(404).json({ error: "Quiz not found" });
      }
      res.json(updatedQuiz);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ================================
  // QUESTION ROUTES
  // ================================

  // Add question to quiz
  app.post("/api/courses/:courseId/quizzes/:quizId/questions", (req, res) => {
    try {
      const { quizId } = req.params;
      const questionData = {
        ...req.body,
        type: req.body.type || 'multiple-choice',
        points: req.body.points || 1,
        title: req.body.title || `Question ${Date.now()}`,
        question: req.body.question || ''
      };
      
      const newQuestion = quizDao.addQuestionToQuiz(quizId, questionData);
      if (!newQuestion) {
        return res.status(404).json({ error: "Quiz not found" });
      }
      res.status(201).json(newQuestion);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update question
  app.put("/api/courses/:courseId/quizzes/:quizId/questions/:questionId", (req, res) => {
    try {
      const { quizId, questionId } = req.params;
      const updatedQuestion = quizDao.updateQuestion(quizId, questionId, req.body);
      if (!updatedQuestion) {
        return res.status(404).json({ error: "Question or Quiz not found" });
      }
      res.json(updatedQuestion);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Delete question
  app.delete("/api/courses/:courseId/quizzes/:quizId/questions/:questionId", (req, res) => {
    try {
      const { quizId, questionId } = req.params;
      const deleted = quizDao.deleteQuestion(quizId, questionId);
      if (!deleted) {
        return res.status(404).json({ error: "Question or Quiz not found" });
      }
      res.json({ message: "Question deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ================================
  // QUIZ ATTEMPT ROUTES
  // ================================

  // Submit quiz attempt
  app.post("/api/courses/:courseId/quizzes/:quizId/attempts", (req, res) => {
    try {
      const { quizId } = req.params;
      const { userId, answers } = req.body;
      
      // Get quiz to calculate score
      const quiz = quizDao.findQuizById(quizId);
      if (!quiz) {
        return res.status(404).json({ error: "Quiz not found" });
      }
      
      // Check if student can take quiz (attempt limits, etc.)
      const existingAttempts = quizDao.findAttemptsByQuizAndUser(quizId, userId);
      if (!quiz.multipleAttempts && existingAttempts.length > 0) {
        return res.status(400).json({ error: "Multiple attempts not allowed" });
      }
      
      if (quiz.multipleAttempts && existingAttempts.length >= quiz.attemptLimit) {
        return res.status(400).json({ error: "Maximum attempts exceeded" });
      }
      
      // Calculate score
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
      
      const newAttempt = quizDao.createQuizAttempt(attemptData);
      res.status(201).json({
        ...newAttempt,
        ...scoreResult
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get user's attempts for a quiz
  app.get("/api/courses/:courseId/quizzes/:quizId/attempts/:userId", (req, res) => {
    try {
      const { quizId, userId } = req.params;
      const attempts = quizDao.findAttemptsByQuizAndUser(quizId, userId);
      res.json(attempts);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get all attempts for a quiz (Faculty only)
  app.get("/api/courses/:courseId/quizzes/:quizId/attempts", (req, res) => {
    try {
      const { quizId } = req.params;
      // TODO: Add authorization check for faculty
      const attempts = quizDao.findAllAttemptsByQuiz(quizId);
      res.json(attempts);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get quiz statistics (Faculty only)
  app.get("/api/courses/:courseId/quizzes/:quizId/stats", (req, res) => {
    try {
      const { quizId } = req.params;
      // TODO: Add authorization check for faculty
      const stats = quizDao.getQuizStats(quizId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Test route to verify quiz routes are working
  app.get("/api/quizzes/test", (req, res) => {
    res.json({ 
      message: "Quiz routes are working!", 
      timestamp: new Date().toISOString(),
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
}
