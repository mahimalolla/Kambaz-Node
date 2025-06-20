// Kambaz/Enrollments/routes.js
import * as enrollmentsDao from "./dao.js";

export default function EnrollmentRoutes(app) {
    // Get all enrollments
    app.get("/api/enrollments", (req, res) => {
        try {
            const enrollments = enrollmentsDao.findAllEnrollments();
            res.json(enrollments);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // Get enrollments for a specific user
    app.get("/api/enrollments/user/:userId", (req, res) => {
        try {
            const { userId } = req.params;
            const enrollments = enrollmentsDao.findEnrollmentsForUser(userId);
            res.json(enrollments);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // Get courses for a user (with course details)
    app.get("/api/enrollments/user/:userId/courses", (req, res) => {
        try {
            const { userId } = req.params;
            const courses = enrollmentsDao.getCoursesForUser(userId);
            res.json(courses);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // Get enrollments for a specific course
    app.get("/api/enrollments/course/:courseId", (req, res) => {
        try {
            const { courseId } = req.params;
            const enrollments = enrollmentsDao.findEnrollmentsForCourse(courseId);
            res.json(enrollments);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // Get users enrolled in a course (with user details)
    app.get("/api/enrollments/course/:courseId/users", (req, res) => {
        try {
            const { courseId } = req.params;
            const users = enrollmentsDao.getUsersEnrolledInCourse(courseId);
            res.json(users);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // Check if user is enrolled in course
    app.get("/api/enrollments/check/:userId/:courseId", (req, res) => {
        try {
            const { userId, courseId } = req.params;
            const isEnrolled = enrollmentsDao.isUserEnrolledInCourse(userId, courseId);
            res.json({ isEnrolled });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // Enroll user in course
    app.post("/api/enrollments", (req, res) => {
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
    app.delete("/api/enrollments/:userId/:courseId", (req, res) => {
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
    app.delete("/api/enrollments/:enrollmentId", (req, res) => {
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
}
