import mongoose from "mongoose";

const Schema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    type: {
      enum: ["CREDIT", "DEBIT"],
    },

    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
    },

    amount: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const ProjectTransactionModal = mongoose.model("ProjectTransaction", Schema);
export default ProjectTransactionModal;
