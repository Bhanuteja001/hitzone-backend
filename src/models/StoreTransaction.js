import mongoose from "mongoose";

const Schema = new mongoose.Schema(
  {
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
    type: {
      enum: ["CREDIT", "DEBIT"],
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
  },
  {
    timestamps: true,
  },
);

const StoreTransactionModal = mongoose.model("StoreTransaction", Schema);
export default StoreTransactionModal;
