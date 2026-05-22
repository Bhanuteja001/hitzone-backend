import mongoose from "mongoose";

const Schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    address: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  },
);

const StoreModal = mongoose.model("Store", Schema);
export default StoreModal;
