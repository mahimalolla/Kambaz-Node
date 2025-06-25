import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema({
  _id: String,
  title: String,
  description: String,
  course: { type: String, ref: "CourseModel" }, // Reference to courses
  points: { type: Number, default: 100 },
  dueDate: String,
  availableDate: String,
  untilDate: String,
  group: { type: String, default: "ASSIGNMENTS" },
  gradeAs: { type: String, default: "Percentage" },
  submissionType: { type: String, default: "Online" },
  onlineOptions: {
    textEntry: { type: Boolean, default: false },
    websiteUrl: { type: Boolean, default: true },
    mediaRecordings: { type: Boolean, default: false },
    studentAnnotation: { type: Boolean, default: false },
    fileUploads: { type: Boolean, default: false }
  }
}, { collection: "assignments" });

export default assignmentSchema;
