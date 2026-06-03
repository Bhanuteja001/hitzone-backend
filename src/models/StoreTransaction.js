import mongoose from "mongoose";

const Schema = new mongoose.Schema(
  {
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
    type: {
      type: String,
      enum: ["CREDIT", "DEBIT"],
      required: true,
    },

    title: {
      type: String,
    },

    description: {
      type: String,
    },

    amount: {
      type: Number,
      required: true,
    },
    addedBy: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  },
);

const StoreTransactionModal = mongoose.model("StoreTransaction", Schema);
export default StoreTransactionModal;
