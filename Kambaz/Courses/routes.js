import * as dao from "./dao.js";
import * as modulesDao from "../Modules/dao.js";
import * as enrollmentsDao from "../Enrollments/dao.js";
 import * as quizzesDao from "../Quizzes/dao.js"; 
import { v4 as uuidv4 } from "uuid";

export default function CourseRoutes(app) {
  
  // Get all courses
  app.get("/api/courses", async (req, res) => {
    try {
      const courses = await dao.findAllCourses();
      res.json(courses);
    } catch (error) {
      console.error("Error fetching courses:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get course by ID
  app.get("/api/courses/:courseId", async (req, res) => {
    try {
      const { courseId } = req.params;
      const course = await dao.findCourseById(courseId);
      if (course) {
        res.json(course);
      } else {
        res.status(404).json({ message: `Course with ID ${courseId} not found` });
      }
    } catch (error) {
      console.error("Error fetching course:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Create new course
  app.post("/api/courses", async (req, res) => {
    try {
      const course = await dao.createCourse(req.body);
      const currentUser = req.session["currentUser"];
      if (currentUser) {
        await enrollmentsDao.enrollUserInCourse(currentUser._id, course._id);
      }
      res.json(course);
    } catch (error) {
      console.error("Error creating course:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Update course
  app.put("/api/courses/:courseId", async (req, res) => {
    try {
      const { courseId } = req.params;
      const courseUpdates = req.body;
      const result = await dao.updateCourse(courseId, courseUpdates);
      res.json(result);
    } catch (error) {
      console.error("Error updating course:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Delete course
  app.delete("/api/courses/:courseId", async (req, res) => {
    try {
      const { courseId } = req.params;
      const result = await dao.deleteCourse(courseId);
      res.json(result);
    } catch (error) {
      console.error("Error deleting course:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get users for a course (enrolled students)
  app.get("/api/courses/:cid/users", async (req, res) => {
    try {
      const { cid } = req.params;
      const users = await enrollmentsDao.findUsersForCourse(cid);
      res.json(users);
    } catch (error) {
      console.error("Error fetching course users:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // ================================
  // MODULE ROUTES (nested under courses)
  // ================================

  // Get all modules for a course
  app.get("/api/courses/:courseId/modules", async (req, res) => {
    try {
      const { courseId } = req.params;
      const modules = await modulesDao.findModulesForCourse(courseId);
      res.json(modules);
    } catch (error) {
      console.error("Error fetching modules:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Create module for a course
  app.post("/api/courses/:courseId/modules", async (req, res) => {
    try {
      const { courseId } = req.params;
      const module = {
        ...req.body,
        course: courseId,
      };
      const newModule = await modulesDao.createModule(module);
      res.json(newModule);
    } catch (error) {
      console.error("Error creating module:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // ================================
  // ASSIGNMENT ROUTES (temporarily disabled)
  // ================================

  // Get all assignments for a course - TEMPORARILY RETURN EMPTY ARRAY
  app.get("/api/courses/:courseId/assignments", (req, res) => {
    res.json([]); // Return empty array until you implement assignments in MongoDB
  });

  // Create assignment for a course - TEMPORARILY RETURN ERROR
  app.post("/api/courses/:courseId/assignments", (req, res) => {
    res.status(501).json({ message: "Assignments not yet implemented with MongoDB" });
  });

 
  app.get("/api/courses/:courseId/quizzes", async (req, res) => {
    try {
      const { courseId } = req.params;
      const quizzes = await quizzesDao.findQuizzesByCourse(courseId);
      res.json(quizzes);
    } catch (error) {
      console.error("Error fetching quizzes:", error);
      res.status(500).json({ error: error.message });
    }
  });
  

  // Temporarily return empty array for quizzes
  app.get("/api/courses/:courseId/quizzes", (req, res) => {
    res.json([]);
  });
}
