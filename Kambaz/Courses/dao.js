import Database from "../Database/index.js";
import { v4 as uuidv4 } from "uuid";

export function findAllCourses() {
  return Database.courses;
}

export function findCourseById(courseId) {
  return Database.courses.find((course) => course._id === courseId);
}

export function createCourse(course) {
  const newCourse = { ...course, _id: uuidv4() };
  Database.courses = [...Database.courses, newCourse];
  return newCourse;
}

export function updateCourse(courseId, courseUpdates) {
  const { courses } = Database;
  const courseIndex = courses.findIndex((course) => course._id === courseId);
  if (courseIndex !== -1) {
    const updatedCourse = { ...courses[courseIndex], ...courseUpdates };
    Database.courses[courseIndex] = updatedCourse;
    return updatedCourse;
  }
  return null;
}

export function deleteCourse(courseId) {
  const { courses, enrollments } = Database;
  const courseIndex = courses.findIndex((course) => course._id === courseId);
  if (courseIndex !== -1) {
    // Remove the course
    Database.courses = courses.filter((course) => course._id !== courseId);
    // Remove all enrollments for this course
    Database.enrollments = enrollments.filter(
      (enrollment) => enrollment.course !== courseId
    );
    return true;
  }
  return false;
}

export function findCoursesForEnrolledUser(userId) {
  const { courses, enrollments } = Database;
  const enrolledCourses = courses.filter((course) =>
    enrollments.some((enrollment) => enrollment.user === userId && enrollment.course === course._id)
  );
  return enrolledCourses;
}
