import crypto from "crypto";
import bcrypt from "bcrypt";
import InviteModel from "../models/inviteModel.js";
import Register from "../models/register.js";
import { sendInviteEmail } from "../invite_email/sendInviteEmail.js";

const TOKEN_EXPIRY_HOURS = 72;

class InviteService {
  static generateToken() {
    return crypto.randomBytes(32).toString("hex");
  }

  static getExpiryDate() {
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + TOKEN_EXPIRY_HOURS);
    return expiry;
  }

  static async createInvite({ email, name }) {
    const existingUser = await Register.getByEmail({ user_email: email });
    if (existingUser.length > 0) {
      return { success: false, error: "A user with this email already exists" };
    }

    const existingInvite = await InviteModel.findByEmail(email);
    if (existingInvite && existingInvite.status === "pending") {
      return { success: false, error: "An invitation has already been sent to this email" };
    }

    const token = this.generateToken();
    const expiresAt = this.getExpiryDate();

    const invite = await InviteModel.create({
      email,
      name: name || "",
      token,
      expires_at: expiresAt,
      status: "pending"
    });

    try {
      await sendInviteEmail({
        email,
        name,
        token,
        expiresAt
      });

      await InviteModel.updateLastSent(invite.id);
    } catch (emailError) {
      console.error("Failed to send invite email:", emailError);
    }

    return { 
      success: true, 
      invite: {
        id: invite.id,
        email: invite.email,
        name: invite.name,
        status: invite.status,
        created_at: invite.created_at
      }
    };
  }

  static async getPendingInvites() {
    return await InviteModel.findAllPending();
  }

  static async cancelInvite(id) {
    const invite = await InviteModel.findById(id);
    if (!invite) {
      return { success: false, error: "Invitation not found" };
    }

    await InviteModel.updateStatus(id, "cancelled");
    return { success: true };
  }

  static async resendInvite(id) {
    const invite = await InviteModel.findById(id);
    if (!invite) {
      return { success: false, error: "Invitation not found" };
    }

    if (invite.status !== "pending") {
      return { success: false, error: "Cannot resend non-pending invitation" };
    }

    const token = this.generateToken();
    const expiresAt = this.getExpiryDate();

    await InviteModel.updateToken(id, token, expiresAt);

    try {
      await sendInviteEmail({
        email: invite.email,
        name: invite.name,
        token,
        expiresAt
      });

      await InviteModel.updateLastSent(id);
    } catch (emailError) {
      console.error("Failed to send invite email:", emailError);
    }

    return { success: true };
  }

  static async validateInviteToken(token) {
    const invite = await InviteModel.findByToken(token);
    
    if (!invite) {
      return { valid: false, error: "Invalid invitation token" };
    }

    if (invite.status !== "pending") {
      return { valid: false, error: "This invitation has already been used or cancelled" };
    }

    if (new Date(invite.expires_at) < new Date()) {
      await InviteModel.updateStatus(invite.id, "expired");
      return { valid: false, error: "This invitation has expired" };
    }

    return { 
      valid: true, 
      email: invite.email,
      name: invite.name 
    };
  }

  static async acceptInvite({ token, password, name }) {
    const validation = await this.validateInviteToken(token);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    const invite = await InviteModel.findByToken(token);

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userData = {
      user_email: invite.email,
      user_name: name || invite.name || invite.email.split("@")[0],
      pwd: hashedPassword
    };

    const newUser = await Register.postNewUser(userData);

    await InviteModel.updateStatus(invite.id, "accepted");

    return { 
      success: true, 
      user: {
        user_id: newUser.insertId,
        user_email: userData.user_email,
        user_name: userData.user_name
      }
    };
  }
}

export default InviteService;
