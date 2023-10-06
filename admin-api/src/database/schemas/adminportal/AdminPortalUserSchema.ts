
import { Schema } from "mongoose";
import AdminPortalUser from "src/datacontext/dtos/AdminPortalUser";

export const AdminPortalUserSchema = new Schema<AdminPortalUser>(
  {
    email:
    {
      type: String,
      unique: true,
      required: [true, "Email address is required"]
    },
    firstName: {
      type: String
    },
    lastName: {
      type: String
    }
  });

