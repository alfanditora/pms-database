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

router.get('/:ipp', authMiddleware, ippController.findIppById);
router.put('/:ipp/update', authMiddleware, ippController.updateIpp);
router.delete('/:ipp/delete', authMiddleware, ippController.deleteIpp);

router.patch('/:ipp/submit', authMiddleware, ippController.submitIpp);
router.patch('/:ipp/unsubmit', authMiddleware, ippController.unsubmitIpp);
router.patch('/:ipp/approval', authMiddleware, operationMiddleware, ippController.ippApproval);
router.patch('/:ipp/verification', authMiddleware, operationMiddleware, ippController.IppVerification);


router.get('/:ipp/monthly-approvals', authMiddleware, ippController.findAllMonthlyAchievement);
router.patch('/monthly-approvals/:id', authMiddleware, operationMiddleware, ippController.monthlyAchievementApproval);


router.get('/:ipp/activities', authMiddleware, ippController.findAllIppActivity);
router.post('/:ipp/activities/add', authMiddleware, ippController.createActivity);
router.put('/:ipp/activities/:activity/update', authMiddleware, ippController.updateActivity);
router.delete('/:ipp/activities/:activity/delete', authMiddleware, ippController.deleteActivity);


router.get('/:ipp/activities/:activity/achievements', authMiddleware, ippController.findActivityAchievements);
router.put('/:ipp/activities/:activity/achievements/:month', authMiddleware, ippController.updateActivityAchievement);
router.patch('/:ipp/activities/:activity/achievements/:month/verification', authMiddleware, operationMiddleware, ippController.achievementVerification);


router.get('/:ipp/activities/:activity/achievements/:month/evidences', authMiddleware, ippController.findAchievementEvidences);

router.post(
    '/:ipp/activities/:activity/achievements/:month/evidences',
    authMiddleware,
    upload.single("file"),
    ippController.createAchievementEvidence
);

router.put(
    '/evidences/:id',
    authMiddleware,
    upload.single("file"),
    ippController.updateAchievementEvidence
);
router.delete('/evidences/:id', authMiddleware, ippController.deleteAchievementEvidence);



router.get('/:ipp/summary', authMiddleware, ippController.executiveSummary);


export default router;