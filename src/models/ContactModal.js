import mongoose from "mongoose";

const Schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
    },
    serviceRequired: {
      type: String,
      required: [true, "Service required field is required"],
    },
    message: {
      type: String,
      required: [true, "Message is required"],
    },
  },
  {
    timestamps: true,
  }
);

const ContactModal = mongoose.model("Contact", Schema);
export default ContactModal;
