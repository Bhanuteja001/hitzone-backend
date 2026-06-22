import mongoose from "mongoose";

const Schema = new mongoose.Schema(
  {
    projectName: {
      type: String,
      required: true,
    },

    projectRefId: {
      type: String,
      unique: true,
      required: true,
    },
    clientName: {
      type: String,
      required: true,
    },
    clientMobile: {
      type: String,
      required: true,
    },
    clientEmail: {
      type: String,
      required: true,
    },
    agreementAmount: {
      type: String,
      required: true,
    },
    quotationAmount: {
      type: String,
      required: true,
    },

    location: {
      type: String,
      required: true,
    },

    area: {
      type: String,
      required: true,
    },

    budget: {
      type: String,
      required: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: false,
    },

    projectDescription: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

const ProjectModal = mongoose.model("Project", Schema);
export default ProjectModal;
