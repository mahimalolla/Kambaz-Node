import express from "express";
import * as enrollmentsDao from "./dao.js";

const router = express.Router();

// Get all enrollments
router.get("/", (req, res) => {
    try {
        const enrollments = enrollmentsDao.findAllEnrollments();
        res.json(enrollments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get enrollments for a specific user
router.get("/user/:userId", (req, res) => {
    try {
        const { userId } = req.params;
        const enrollments = enrollmentsDao.findEnrollmentsForUser(userId);
        res.json(enrollments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get courses for a user (with course details)
router.get("/user/:userId/courses", (req, res) => {
    try {
        const { userId } = req.params;
        const courses = enrollmentsDao.getCoursesForUser(userId);
        res.json(courses);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get enrollments for a specific course
router.get("/course/:courseId", (req, res) => {
    try {
        const { courseId } = req.params;
        const enrollments = enrollmentsDao.findEnrollmentsForCourse(courseId);
        res.json(enrollments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get users enrolled in a course (with user details)
router.get("/course/:courseId/users", (req, res) => {
    try {
        const { courseId } = req.params;
        const users = enrollmentsDao.getUsersEnrolledInCourse(courseId);
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Check if user is enrolled in course
router.get("/check/:userId/:courseId", (req, res) => {
    try {
        const { userId, courseId } = req.params;
        const isEnrolled = enrollmentsDao.isUserEnrolledInCourse(userId, courseId);
        res.json({ isEnrolled });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Enroll user in course
router.post("/", (req, res) => {
    try {
        const { userId, courseId } = req.body;
        
        if (!userId || !courseId) {
            return res.status(400).json({ error: "userId and courseId are required" });
        }
        
        const enrollment = enrollmentsDao.enrollUserInCourse(userId, courseId);
        res.status(201).json(enrollment);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Unenroll user from course
router.delete("/:userId/:courseId", (req, res) => {
    try {
        const { userId, courseId } = req.params;
        const removedEnrollment = enrollmentsDao.unenrollUserFromCourse(userId, courseId);
        
        if (!removedEnrollment) {
            return res.status(404).json({ error: "Enrollment not found" });
        }
        
        res.json({ message: "Successfully unenrolled", enrollment: removedEnrollment });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete enrollment by ID
router.delete("/:enrollmentId", (req, res) => {
    try {
        const { enrollmentId } = req.params;
        const removedEnrollment = enrollmentsDao.deleteEnrollment(enrollmentId);
        
        if (!removedEnrollment) {
            return res.status(404).json({ error: "Enrollment not found" });
        }
        
        res.json({ message: "Enrollment deleted", enrollment: removedEnrollment });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});
