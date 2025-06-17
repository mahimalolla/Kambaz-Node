import * as dao from "./dao.js";
import * as courseDao from "../Courses/dao.js";
import * as enrollmentsDao from "../Enrollments/dao.js";

export default function UserRoutes(app) {
  // Sign in user
  const signin = (req, res) => {
    const { username, password } = req.body;
    const currentUser = dao.findUserByCredentials(username, password);
    if (currentUser) {
      req.session["currentUser"] = currentUser;
      res.json(currentUser);
    } else {
      res.status(401).json({ message: "Unable to login. Try again later." });
    }
  };

  // Sign up new user
  const signup = (req, res) => {
    const user = dao.findUserByUsername(req.body.username);
    if (user) {
      res.status(400).json({ message: "Username already taken" });
      return;
    }
    const currentUser = dao.createUser(req.body);
    req.session["currentUser"] = currentUser;
    res.json(currentUser);
  };

  // Get current user profile
  const profile = (req, res) => {
    const currentUser = req.session["currentUser"];
    if (!currentUser) {
      res.sendStatus(401);
      return;
    }
    res.json(currentUser);
  };

  // Update user profile
  const updateUser = (req, res) => {
    const userId = req.params.userId;
    const userUpdates = req.body;
    dao.updateUser(userId, userUpdates);
    const currentUser = dao.findUserById(userId);
    req.session["currentUser"] = currentUser;
    res.json(currentUser);
  };

  // Sign out user
  const signout = (req, res) => {
    req.session.destroy();
    res.sendStatus(200);
  };

  // Find courses for enrolled user
  const findCoursesForEnrolledUser = (req, res) => {
    let { userId } = req.params;
    if (userId === "current") {
      const currentUser = req.session["currentUser"];
      if (!currentUser) {
        res.sendStatus(401);
        return;
      }
      userId = currentUser._id;
    }
    const courses = courseDao.findCoursesForEnrolledUser(userId);
    res.json(courses);
  };

  // Create course for current user
  const createCourse = (req, res) => {
    const currentUser = req.session["currentUser"];
    if (!currentUser) {
      res.sendStatus(401);
      return;
    }
    const newCourse = courseDao.createCourse(req.body);
    enrollmentsDao.enrollUserInCourse(currentUser._id, newCourse._id);
    res.json(newCourse);
  };

  // Get all users (for admin/faculty)
  const findAllUsers = (req, res) => {
    const users = dao.findAllUsers();
    res.json(users);
  };

  // Get user by ID
  const findUserById = (req, res) => {
    const userId = req.params.userId;
    const user = dao.findUserById(userId);
    res.json(user);
  };

  // Create user (admin only)
  const createUser = (req, res) => {
    const user = dao.createUser(req.body);
    res.json(user);
  };

  // Delete user (admin only)
  const deleteUser = (req, res) => {
    const userId = req.params.userId;
    dao.deleteUser(userId);
    res.sendStatus(200);
  };

  // Enrollment routes
  const enrollUserInCourse = (req, res) => {
    const { userId, courseId } = req.params;
    const currentUser = req.session["currentUser"];
    
    // Check if user is enrolling themselves or if they're faculty/admin
    if (currentUser._id !== userId && currentUser.role !== "FACULTY" && currentUser.role !== "ADMIN") {
      res.sendStatus(403);
      return;
    }
    
    enrollmentsDao.enrollUserInCourse(userId, courseId);
    res.sendStatus(200);
  };

  const unenrollUserFromCourse = (req, res) => {
    const { userId, courseId } = req.params;
    const currentUser = req.session["currentUser"];
    
    // Check if user is unenrolling themselves or if they're faculty/admin
    if (currentUser._id !== userId && currentUser.role !== "FACULTY" && currentUser.role !== "ADMIN") {
      res.sendStatus(403);
      return;
    }
    
    enrollmentsDao.unenrollUserFromCourse(userId, courseId);
    res.sendStatus(200);
  };

  // Routes
  app.post("/api/users/signin", signin);
  app.post("/api/users/signup", signup);
  app.post("/api/users/profile", profile);
  app.post("/api/users/signout", signout);
  app.put("/api/users/:userId", updateUser);
  app.get("/api/users/:userId/courses", findCoursesForEnrolledUser);
  app.post("/api/users/current/courses", createCourse);
  app.get("/api/users", findAllUsers);
  app.get("/api/users/:userId", findUserById);
  app.post("/api/users", createUser);
  app.delete("/api/users/:userId", deleteUser);
  app.post("/api/users/:userId/courses/:courseId", enrollUserInCourse);
  app.delete("/api/users/:userId/courses/:courseId", unenrollUserFromCourse);
}
