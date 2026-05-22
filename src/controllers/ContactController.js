import ContactModal from "../models/ContactModal.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createContact = asyncHandler(async (req, res, next) => {
  const { name, email, phone, message, serviceRequired } = req.body;

  if (!name || !email || !phone || !message || !serviceRequired) {
    return next(new AppError("Name, email, phone number, message, and service required are required", 400));
  }

  const contact = await ContactModal.create({
    name,
    email,
    phone,
    serviceRequired,
    message,
  });

  res.status(201).json({
    message: "Contact request submitted successfully",
    contact,
  });
});

export const getAllContacts = asyncHandler(async (req, res) => {
  const contacts = await ContactModal.find().sort({ createdAt: -1 });
  res.json(contacts);
});

export const getPaginatedContacts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const total = await ContactModal.countDocuments();
  const contacts = await ContactModal.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.json({
    contacts,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  });
});

export const deleteContact = asyncHandler(async (req, res, next) => {
  const contact = await ContactModal.findByIdAndDelete(req.params.id);
  if (!contact) {
    return next(new AppError("Contact submission not found", 404));
  }
  res.json({ message: "Contact submission deleted" });
});


