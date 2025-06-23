import * as dao from "./dao.js";
import * as courseDao from "../Courses/dao.js";
import * as enrollmentsDao from "../Enrollments/dao.js";

export default function UserRoutes(app) {
  // Sign in user
  const signin = async (req, res) => {
    const { username, password } = req.body;
    const currentUser = await dao.findUserByCredentials(username, password);
    if (currentUser) {
      req.session["currentUser"] = currentUser;
      res.json(currentUser);
    } else {
      res.status(401).json({ message: "Unable to login. Try again later." });
    }
  };

  // Sign up new user
  const signup = async (req, res) => {
    const user = await dao.findUserByUsername(req.body.username);
    if (user) {
      res.status(400).json({ message: "Username already taken" });
      return;
    }
    const currentUser = await dao.createUser(req.body);
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
  const updateUser = async (req, res) => {
    const { userId } = req.params;
    const userUpdates = req.body;
    await dao.updateUser(userId, userUpdates);
    const currentUser = req.session["currentUser"];
    if (currentUser && currentUser._id === userId) {
      req.session["currentUser"] = { ...currentUser, ...userUpdates };
    }
    res.json(currentUser);
  };

  // Sign out user
  const signout = (req, res) => {
    req.session.destroy();
    res.sendStatus(200);
  };

  // Find courses for enrolled user
  const findCoursesForEnrolledUser = async (req, res) => {
    let { userId } = req.params;
    const currentUser = req.session["currentUser"];
    
    if (!currentUser) {
      res.sendStatus(401);
      return;
    }

    if (userId === "current") {
      userId = currentUser._id;
    }

    if (currentUser.role === "ADMIN") {
      const courses = await courseDao.findAllCourses();
      res.json(courses);
      return;
    }

    const courses = await enrollmentsDao.findCoursesForUser(userId);
    res.json(courses);
  };

  // Create course for current user
  const createCourse = async (req, res) => {
    const currentUser = req.session["currentUser"];
    if (!currentUser) {
      res.sendStatus(401);
      return;
    }
    const newCourse = await courseDao.createCourse(req.body);
    await enrollmentsDao.enrollUserInCourse(currentUser._id, newCourse._id);
    res.json(newCourse);
  };

  // Get all users (for admin/faculty)
  const findAllUsers = async (req, res) => {
    const { role, name } = req.query;
    if (role) {
      const users = await dao.findUsersByRole(role);
      res.json(users);
      return;
    }
    if (name) {
      const users = await dao.findUsersByPartialName(name);
      res.json(users);
      return;
    }
    const users = await dao.findAllUsers();
    res.json(users);
  };

  // Get user by ID
  const findUserById = async (req, res) => {
    const userId = req.params.userId;
    const user = await dao.findUserById(userId);
    res.json(user);
  };

  // Create user (admin only)
  const createUser = async (req, res) => {
    const user = await dao.createUser(req.body);
    res.json(user);
  };

  // Delete user (admin only)
  const deleteUser = async (req, res) => {
    const userId = req.params.userId;
    const status = await dao.deleteUser(userId);
    res.json(status);
  };

  // Enrollment routes
  const enrollUserInCourse = async (req, res) => {
    let { userId, courseId } = req.params;
    const currentUser = req.session["currentUser"];
    
    if (userId === "current") {
      userId = currentUser._id;
    }
    
    // Check if user is enrolling themselves or if they're faculty/admin
    if (currentUser._id !== userId && currentUser.role !== "FACULTY" && currentUser.role !== "ADMIN") {
      res.sendStatus(403);
      return;
    }
    
    const status = await enrollmentsDao.enrollUserInCourse(userId, courseId);
    res.json(status);
  };

  const unenrollUserFromCourse = async (req, res) => {
    let { userId, courseId } = req.params;
    const currentUser = req.session["currentUser"];
    
    if (userId === "current") {
      userId = currentUser._id;
    }
    
    // Check if user is unenrolling themselves or if they're faculty/admin
    if (currentUser._id !== userId && currentUser.role !== "FACULTY" && currentUser.role !== "ADMIN") {
      res.sendStatus(403);
      return;
    }
    
    const status = await enrollmentsDao.unenrollUserFromCourse(userId, courseId);
    res.json(status);
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
