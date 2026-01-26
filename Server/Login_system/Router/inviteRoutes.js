import express from 'express';
import InviteController from '../controllers/inviteController.js';

const router = express.Router();

router.post("/invite", InviteController.createInvite);
router.get("/invites", InviteController.getInvites);
router.delete("/invite/:id", InviteController.cancelInvite);
router.post("/invite/:id/resend", InviteController.resendInvite);
router.post("/accept-invite", InviteController.acceptInvite);
router.get("/validate-invite/:token", InviteController.validateInvite);

export default router;
