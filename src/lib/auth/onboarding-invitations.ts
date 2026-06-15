import crypto from "crypto";
import { getAppBaseUrl } from "../app-url";

export const INVITATION_TTL_HOURS = 48;

export function createInvitationToken() {
  return crypto.randomBytes(32).toString("hex");
}

export function hashInvitationToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function createInvitationExpiry() {
  return new Date(Date.now() + INVITATION_TTL_HOURS * 60 * 60 * 1000);
}

export function buildStaffRegistrationUrl(token: string) {
  return `${getAppBaseUrl()}/register/staff?token=${encodeURIComponent(token)}`;
}
