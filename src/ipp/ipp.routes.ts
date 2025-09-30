import express from 'express';
import { IppController } from './ipp.controller.js';
import { authMiddleware, operationMiddleware } from '../middleware/auth.middleware.js';
import { upload } from "../middleware/upload.js";

const router = express.Router();
const ippController = new IppController();


router.get('/all', authMiddleware, ippController.findAllIpps);
router.post('/create', authMiddleware, ippController.createIpp);

router.get('/user/:npk', authMiddleware, ippController.findAllIppsByNpk);
router.get('/user/:npk/active', authMiddleware, ippController.findActiveIppByNpk);
router.get('/user/:npk/approved', authMiddleware, ippController.findApprovedIppByNpk);

router.get('/active/all', authMiddleware, operationMiddleware, ippController.findActiveIpp);
router.get('/approved/all', authMiddleware, operationMiddleware, ippController.findApprovedIpp);

router.get('/:ipp', authMiddleware, ippController.findIppById);
router.put('/:ipp/update', authMiddleware, ippController.updateIpp);
router.delete('/:ipp/delete', authMiddleware, ippController.deleteIpp);

router.patch('/:ipp/submit', authMiddleware, ippController.submitIpp);
router.patch('/:ipp/unsubmit', authMiddleware, ippController.unsubmitIpp);
router.patch('/:ipp/approval', authMiddleware, operationMiddleware, ippController.ippApproval);
router.patch('/:ipp/verification', authMiddleware, operationMiddleware, ippController.IppVerification);


router.get('/:ipp/monthly-approvals', authMiddleware, ippController.findAllMonthlyAchievement);
router.get('/monthly-approvals/:id', authMiddleware, ippController.findMonthlyAchievementById);
router.patch('/monthly-approvals/:id', authMiddleware, operationMiddleware, ippController.monthlyAchievementApproval);


router.get('/:ipp/activities', authMiddleware, ippController.findAllIppActivity);
router.post('/:ipp/activities/add', authMiddleware, ippController.createActivity);
router.put('/:ipp/activities/:activity/update', authMiddleware, ippController.updateActivity);
router.delete('/:ipp/activities/:activity/delete', authMiddleware, ippController.deleteActivity);


router.get('/:ipp/activities/:activity/achievements', authMiddleware, ippController.findActivityAchievements);
router.put('/:ipp/activities/:activity/achievements/:month', authMiddleware, ippController.updateActivityAchievement);


// --- EVIDENCE ROUTES ---

// Get all evidences for an achievement
router.get(
    '/:ipp/activities/:activity/achievements/:month/evidences',
    authMiddleware,
    ippController.getAchievementEvidences
);

// Create new evidence
router.post(
    '/:ipp/activities/:activity/achievements/:month/evidences',
    authMiddleware,
    upload.single("file"),
    ippController.createAchievementEvidence
);

// Update evidence
router.put(
    '/evidences/:id',
    authMiddleware,
    upload.single("file"),
    ippController.updateAchievementEvidence
);

// Delete evidence
router.delete(
    '/evidences/:id',
    authMiddleware,
    ippController.deleteAchievementEvidence
);


router.get('/:ipp/summary', authMiddleware, ippController.executiveSummary);


export default router;