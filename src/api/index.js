import app from "../app.js";
import { Scheme } from "../model/index.model.js";

let initialized = false;

export default async function handler(req, res) {
  if (!initialized) {
    await Scheme();
    initialized = true;
  }
  return app(req, res);
}