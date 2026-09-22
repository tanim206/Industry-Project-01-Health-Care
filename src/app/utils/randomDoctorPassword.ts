import crypto from "crypto";
import httpStatus from "http-status";

import { AppError } from "./AppError";

export const generateRandomPassword = (length = 10) => {
  if (length < 8) {
    throw new AppError(httpStatus.CONFLICT, " Lenght must be at least 4");
  }

  const lower = "abcdefghijklmnopqrstuvwxyz";
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const digit = "0123456789";
  const specials = "!@#$%^&*_-?+=";

  const all = lower + upper + digit + specials;
  const pick = (chars: string) => chars[crypto.randomInt(chars.length)];

  const chars = [pick(lower), pick(upper), pick(digit), pick(specials)];
  for (let i = chars.length; i < length; i++) {
    chars.push(pick(all));
  }

  for (let i = chars.length - 1; i > 0; i--) {
    const j = crypto.randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
};
