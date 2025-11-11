import * as yup from "yup";
import { normalizeEmail } from "#utils/normalize.js";

const emailField = yup.string().trim().lowercase().email("invalid email");
const nameField = yup.string().trim().min(1, "name is required");
const passwordField = yup
  .string()
  .min(6, "password must be at least 6 characters");
const profilePictureField = yup
  .string()
  .trim()
  .url("profilePicture must be a valid URL");

export default class AuthYup {
  static async signup(req, _res, next) {
    try {
      const schema = yup.object({
        name: nameField.required("name is required"),
        email: emailField.required("email is required"),
        password: passwordField.required("password is required"),
        profilePicture: profilePictureField.optional().default(""),
      });
      const valid = await schema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });
      valid.email = normalizeEmail(valid.email);
      req.body = valid;
      next();
    } catch (e) {
      e.code = 400;
      next(e);
    }
  }

  static async login(req, _res, next) {
    try {
      const schema = yup.object({
        email: emailField.required("email is required"),
        password: passwordField.required("password is required"),
      });
      const valid = await schema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });
      valid.email = normalizeEmail(valid.email);
      req.body = valid;
      next();
    } catch (e) {
      e.code = 400;
      next(e);
    }
  }

  static async updateSelf(req, _res, next) {
    try {
      const schema = yup
        .object({
          name: nameField.optional(),
          email: emailField.optional(),
          profilePicture: profilePictureField.optional(),
        })
        .test(
          "at-least-one",
          "provide at least one field to update",
          (obj) =>
            obj &&
            (obj.name !== undefined ||
              obj.email !== undefined ||
              obj.profilePicture !== undefined)
        );
      const valid = await schema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });
      if (valid.email !== undefined) valid.email = normalizeEmail(valid.email);
      req.body = valid;
      next();
    } catch (e) {
      e.code = 400;
      next(e);
    }
  }
}
