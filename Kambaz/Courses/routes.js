import * as dao from "./dao.js";
import * as modulesDao from "../Modules/dao.js";
import * as quizzesDao from "../Quizzes/dao.js"; // Add this import
import Database from "../Database/index.js";
import { v4 as uuidv4 } from "uuid";

export default function CourseRoutes(app) {
  
  // Get all courses
  app.get("/api/courses", (req, res) => {
    const courses = dao.findAllCourses();
    res.json(courses);
  });

  // Get course by ID
  app.get("/api/courses/:courseId", (req, res) => {
    const { courseId } = req.params;
    const course = dao.findCourseById(courseId);
    if (course) {
      res.json(course);
    } else {
      res.status(404).json({ message: `Course with ID ${courseId} not found` });
    }
  });

  // Create new course
  app.post("/api/courses", (req, res) => {
    const course = dao.createCourse(req.body);
    res.json(course);
  });

  // Update course
  app.put("/api/courses/:courseId", (req, res) => {
    const { courseId } = req.params;
    const courseUpdates = req.body;
    const updatedCourse = dao.updateCourse(courseId, courseUpdates);
    if (updatedCourse) {
      res.json(updatedCourse);
    } else {
      res.status(404).json({ message: `Unable to update Course with ID ${courseId}` });
    }
  });

  // Delete course
  app.delete("/api/courses/:courseId", (req, res) => {
    const { courseId } = req.params;
    const success = dao.deleteCourse(courseId);
    if (success) {
      res.sendStatus(200);
    } else {
      res.status(404).json({ message: `Unable to delete Course with ID ${courseId}` });
    }
  });

  // ================================
  // MODULE ROUTES (nested under courses)
  // ================================

  // Get all modules for a course
  app.get("/api/courses/:courseId/modules", (req, res) => {
    const { courseId } = req.params;
    const modules = modulesDao.findModulesForCourse(courseId);
    res.json(modules);
  });

  // Create module for a course
  app.post("/api/courses/:courseId/modules", (req, res) => {
    const { courseId } = req.params;
    const module = {
      ...req.body,
      course: courseId,
    };
    const newModule = modulesDao.createModule(module);
    res.json(newModule);
  });

  // ================================
  // ASSIGNMENT ROUTES (nested under courses) - Optional
  // ================================

  // Get all assignments for a course
  app.get("/api/courses/:courseId/assignments", (req, res) => {
    const { courseId } = req.params;
    const { assignments } = Database;
    const courseAssignments = assignments.filter(assignment => assignment.course === courseId);
    res.json(courseAssignments);
  });

  // Create assignment for a course
  app.post("/api/courses/:courseId/assignments", (req, res) => {
    const { courseId } = req.params;
    const assignment = {
      ...req.body,
      course: courseId,
      _id: uuidv4()
    };
    Database.assignments = [...Database.assignments, assignment];
    res.json(assignment);
  });

  // ================================
  // QUIZ ROUTES (nested under courses)
  // ================================

  // Get all quizzes for a course
  app.get("/api/courses/:courseId/quizzes", (req, res) => {
    const { courseId } = req.params;
    const quizzes = quizzesDao.findQuizzesByCourse(courseId);
    res.json(quizzes);
  });

  // Get a specific quiz
  app.get("/api/courses/:courseId/quizzes/:quizId", (req, res) => {
    const { quizId } = req.params;
    const quiz = quizzesDao.findQuizById(quizId);
    if (quiz) {
      res.json(quiz);
    } else {
      res.status(404).json({ message: `Quiz with ID ${quizId} not found` });
    }
  });

  // Create a new quiz for a course
  app.post("/api/courses/:courseId/quizzes", (req, res) => {
    const { courseId } = req.params;
    const quiz = {
      ...req.body,
      courseId: courseId,
    };
    const newQuiz = quizzesDao.createQuiz(quiz);
    res.json(newQuiz);
  });

  // Update a quiz
  app.put("/api/courses/:courseId/quizzes/:quizId", (req, res) => {
    const { quizId } = req.params;
    const quizUpdates = req.body;
    const updatedQuiz = quizzesDao.updateQuiz(quizId, quizUpdates);
    if (updatedQuiz) {
      res.json(updatedQuiz);
    } else {
      res.status(404).json({ message: `Unable to update Quiz with ID ${quizId}` });
    }
  });

  // Delete a quiz
  app.delete("/api/courses/:courseId/quizzes/:quizId", (req, res) => {
    const { quizId } = req.params;
    const success = quizzesDao.deleteQuiz(quizId);
    if (success) {
      res.sendStatus(200);
    } else {
      res.status(404).json({ message: `Unable to delete Quiz with ID ${quizId}` });
    }
  });

  // Publish/Unpublish a quiz
  app.patch("/api/courses/:courseId/quizzes/:quizId/publish", (req, res) => {
    const { quizId } = req.params;
    const { published } = req.body;
    const updatedQuiz = quizzesDao.updateQuiz(quizId, { published });
    if (updatedQuiz) {
      res.json(updatedQuiz);
    } else {
      res.status(404).json({ message: `Unable to update Quiz with ID ${quizId}` });
    }
  });

  // ================================
  // QUIZ QUESTION ROUTES
  // ================================

  // Add a question to a quiz
  app.post("/api/courses/:courseId/quizzes/:quizId/questions", (req, res) => {
    const { quizId } = req.params;
    const question = quizzesDao.addQuestionToQuiz(quizId, req.body);
    if (question) {
      res.json(question);
    } else {
      res.status(404).json({ message: `Unable to add question to Quiz with ID ${quizId}` });
    }
  });

  // Update a question
  app.put("/api/courses/:courseId/quizzes/:quizId/questions/:questionId", (req, res) => {
    const { quizId, questionId } = req.params;
    const updatedQuestion = quizzesDao.updateQuestion(quizId, questionId, req.body);
    if (updatedQuestion) {
      res.json(updatedQuestion);
    } else {
      res.status(404).json({ message: `Unable to update question ${questionId} in Quiz ${quizId}` });
    }
  });

  // Delete a question
  app.delete("/api/courses/:courseId/quizzes/:quizId/questions/:questionId", (req, res) => {
    const { quizId, questionId } = req.params;
    const success = quizzesDao.deleteQuestion(quizId, questionId);
    if (success) {
      res.sendStatus(200);
    } else {
      res.status(404).json({ message: `Unable to delete question ${questionId} from Quiz ${quizId}` });
    }
  });

  // ================================
  // QUIZ ATTEMPT ROUTES
  // ================================

  // Submit a quiz attempt
  app.post("/api/courses/:courseId/quizzes/:quizId/attempts", (req, res) => {
    const { courseId, quizId } = req.params;
    const { answers, timeSpent } = req.body;
    const userId = req.session?.currentUser?._id; // Assuming you have user in session

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Get the quiz to calculate score
    const quiz = quizzesDao.findQuizById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    // Calculate score
    const { score, maxScore, percentage } = quizzesDao.calculateScore(quiz.questions, answers);

    // Get existing attempts to determine attempt number
    const existingAttempts = quizzesDao.findAttemptsByQuizAndUser(quizId, userId);
    const attemptNumber = existingAttempts.length + 1;

    // Check if user has exceeded attempt limit
    if (quiz.multipleAttempts && quiz.attemptLimit && existingAttempts.length >= quiz.attemptLimit) {
      return res.status(400).json({ message: "Maximum attempts exceeded" });
    }

    const attempt = {
      quizId,
      userId,
      courseId,
      answers,
      score,
      maxScore,
      percentage,
      timeSpent: timeSpent || 0,
      attemptNumber
    };

    const newAttempt = quizzesDao.createQuizAttempt(attempt);
    res.json(newAttempt);
  });

  // Get user's attempts for a quiz
  app.get("/api/courses/:courseId/quizzes/:quizId/attempts", (req, res) => {
    const { quizId } = req.params;
    const userId = req.session?.currentUser?._id;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const attempts = quizzesDao.findAttemptsByQuizAndUser(quizId, userId);
    res.json(attempts);
  });

  // Get all attempts for a quiz (Faculty only)
  app.get("/api/courses/:courseId/quizzes/:quizId/attempts/all", (req, res) => {
    const { quizId } = req.params;
    const currentUser = req.session?.currentUser;

    if (!currentUser) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Check if user is faculty/admin
    if (currentUser.role !== 'FACULTY' && currentUser.role !== 'ADMIN') {
      return res.status(403).json({ message: "Access denied. Faculty only." });
    }

    const attempts = quizzesDao.findAllAttemptsByQuiz(quizId);
    res.json(attempts);
  });

  // Get quiz statistics (Faculty only)
  app.get("/api/courses/:courseId/quizzes/:quizId/stats", (req, res) => {
    const { quizId } = req.params;
    const currentUser = req.session?.currentUser;

    if (!currentUser) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Check if user is faculty/admin
    if (currentUser.role !== 'FACULTY' && currentUser.role !== 'ADMIN') {
      return res.status(403).json({ message: "Access denied. Faculty only." });
    }

    const stats = quizzesDao.getQuizStats(quizId);
    res.json(stats);
  });
}
