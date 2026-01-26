import InviteService from "../services/inviteService.js";

class InviteController {
  static async createInvite(req, res) {
    try {
      const { email, name } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      const result = await InviteService.createInvite({ email, name });
      
      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }

      res.status(201).json({ 
        success: true, 
        message: "Invitation sent successfully",
        invite: result.invite 
      });
    } catch (error) {
      console.error("createInvite error:", error);
      res.status(500).json({ error: "Failed to create invitation" });
    }
  }

  static async getInvites(req, res) {
    try {
      const invites = await InviteService.getPendingInvites();
      res.status(200).json({ invites });
    } catch (error) {
      console.error("getInvites error:", error);
      res.status(500).json({ error: "Failed to fetch invitations" });
    }
  }

  static async cancelInvite(req, res) {
    try {
      const { id } = req.params;
      const result = await InviteService.cancelInvite(id);
      
      if (!result.success) {
        return res.status(404).json({ error: result.error });
      }

      res.status(200).json({ success: true, message: "Invitation cancelled" });
    } catch (error) {
      console.error("cancelInvite error:", error);
      res.status(500).json({ error: "Failed to cancel invitation" });
    }
  }

  static async resendInvite(req, res) {
    try {
      const { id } = req.params;
      const result = await InviteService.resendInvite(id);
      
      if (!result.success) {
        return res.status(404).json({ error: result.error });
      }

      res.status(200).json({ success: true, message: "Invitation resent" });
    } catch (error) {
      console.error("resendInvite error:", error);
      res.status(500).json({ error: "Failed to resend invitation" });
    }
  }

  static async acceptInvite(req, res) {
    try {
      const { token, password, name } = req.body;
      
      if (!token || !password) {
        return res.status(400).json({ error: "Token and password are required" });
      }

      const result = await InviteService.acceptInvite({ token, password, name });
      
      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }

      res.status(200).json({ 
        success: true, 
        message: "Account created successfully",
        user: result.user 
      });
    } catch (error) {
      console.error("acceptInvite error:", error);
      res.status(500).json({ error: "Failed to accept invitation" });
    }
  }

  static async validateInvite(req, res) {
    try {
      const { token } = req.params;
      const result = await InviteService.validateInviteToken(token);
      
      if (!result.valid) {
        return res.status(400).json({ valid: false, error: result.error });
      }

      res.status(200).json({ 
        valid: true, 
        email: result.email,
        name: result.name 
      });
    } catch (error) {
      console.error("validateInvite error:", error);
      res.status(500).json({ valid: false, error: "Failed to validate invitation" });
    }
  }
}

export default InviteController;
