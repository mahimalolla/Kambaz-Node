import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
  _id: String,
  name: String,
  number: String,
  credits: Number,
  description: String,
  startDate: Date,
  endDate: Date,
  image: String,
  semester: String,
  year: Number,
  instructor: String,
}, { collection: "courses" });

export default courseSchema;
