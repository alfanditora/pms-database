import express from 'express';
import { IppController } from './ipp.controller.js';
import { authMiddleware, operationMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();
const ippController = new IppController();


// IPP Routes
// Routes for managing the main IPP (Individual Performance Plan) records.

router.get('/ipp', authMiddleware, ippController.findAllIpps);
router.post('/ipp', authMiddleware, ippController.createIpp);

router.get('/ipp/user/:npk', authMiddleware, operationMiddleware, ippController.findAllIppsByNpk);
router.get('/ipp/user/:npk/active', authMiddleware, ippController.findActiveIppByNpk);

router.get('/ipp/:ipp', authMiddleware, ippController.findIppById);
router.put('/ipp/:ipp', authMiddleware, ippController.updateIpp);
router.delete('/ipp/:ipp', authMiddleware, ippController.deleteIpp);

router.patch('/ipp/:ipp/submit', authMiddleware, ippController.submitIpp);
router.patch('/ipp/:ipp/unsubmit', authMiddleware, ippController.unsubmitIpp);
router.patch('/ipp/:ipp/approval', authMiddleware, operationMiddleware, ippController.ippApproval);
router.patch('/ipp/:ipp/verification', authMiddleware, operationMiddleware, ippController.IppVerification);



// Activity Routes
// Routes for managing activities within a specific IPP.

router.get('/ipp/:ipp/activities', authMiddleware, ippController.findAllIppActivity);
router.post('/ipp/:ipp/activities', authMiddleware, ippController.createActivity);

router.put('/ipp/:ipp/activities/:activity', authMiddleware, ippController.updateActivity);
router.delete('/ipp/:ipp/activities/:activity', authMiddleware, ippController.deleteActivity);


// Ahievement Routes
// Routes for managing monthly achievements for a specific activity.

router.get('/ipp/:ipp/activities/:activity/achievements', authMiddleware, ippController.findActivityAchievements);
router.put('/ipp/:ipp/activities/:activity/achievements/:month', authMiddleware, ippController.updateActivityAchievement);

router.patch('/ipp/:ipp/activities/:activity/achievements/:month/verification', authMiddleware, operationMiddleware,ippController.achievementVerification);
router.patch('/ipp/:ipp/activities/:activity/achievements/:month/approval', authMiddleware, operationMiddleware,ippController.achievementApproval);



// Evidence Routes
// Routes for managing evidences for a specific achievement.

router.get('/ipp/:ipp/activities/:activity/achievements/:month/evidences', authMiddleware, ippController.findAchievementEvidences);
router.post('/ipp/:ipp/activities/:activity/achievements/:month/evidences', authMiddleware, ippController.createAchievementEvidence);

// Note: Evidence update/delete typically uses its own unique ID.
router.put('/evidences/:id', authMiddleware, ippController.updateAchievementEvidence);
router.delete('/evidences/:id', authMiddleware, ippController.deleteAchievementEvidence);


export default router;