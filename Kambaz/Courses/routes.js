import * as dao from "./dao.js";
import * as modulesDao from "../Modules/dao.js";
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
}
