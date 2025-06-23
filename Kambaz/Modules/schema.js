import mongoose from "mongoose";

const moduleSchema = new mongoose.Schema({
  _id: String,
  name: String,
  description: String,
  course: { type: String, ref: "CourseModel" },
  lessons: [String], // Array of lesson IDs if you have lessons
  editing: { type: Boolean, default: false },
}, { collection: "modules" });

export default moduleSchema;
