import mongoose from "mongoose";

const Schema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
    },
    password: {
      type: String,
    },
    phone: {
      type: Number,
    },
    role: {
      enum: ["user", "admin"],
    },
  },
  {
    timestamps: true,
  },
);

const UserModal = mongoose.model("User", Schema);
export default UserModal;
