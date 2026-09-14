import Contact from "../models/Contact.js";
import { notifyWhatsApp } from "../services/whatsapp.js";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const clean = (value) =>
  String(value ?? "")
    .replace(/[<>]/g, "")
    .trim();

function validateContact(body) {
  const data = {
    name: clean(body.name),
    email: clean(body.email).toLowerCase(),
    subject: clean(body.subject),
    message: clean(body.message),
  };
  const errors = {};
  if (data.name.length < 2 || data.name.length > 80)
    errors.name = "Name must be between 2 and 80 characters.";
  if (!emailPattern.test(data.email) || data.email.length > 160)
    errors.email = "Enter a valid email address.";
  if (data.subject.length < 3 || data.subject.length > 160)
    errors.subject = "Subject must be between 3 and 160 characters.";
  if (data.message.length < 10 || data.message.length > 5000)
    errors.message = "Message must be between 10 and 5000 characters.";
  return { data, errors };
}

export async function createContact(request, response, next) {
  try {
    const { data, errors } = validateContact(request.body);
    if (Object.keys(errors).length)
      return response
        .status(400)
        .json({ message: "Please correct the highlighted fields.", errors });
    let contact;
    try {
      contact = await Contact.create(data);
    } catch (databaseError) {
      databaseError.statusCode = 503;
      databaseError.message =
        "Contact service unavailable. Configure MongoDB and try again.";
      throw databaseError;
    }
    try {
      await notifyWhatsApp(data);
    } catch (notificationError) {
      console.error(notificationError.message);
    }
    response.status(201).json({ message: "Message received.", id: contact.id });
  } catch (error) {
    next(error);
  }
}
