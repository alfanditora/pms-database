import type { Request, Response, NextFunction } from 'express';
import { IppService } from './ipp.service.js';
import type { approval_status, verify_status } from '@prisma/client';

const ippService = new IppService();

export class IppController {

    // --- IPP CONTROLLERS ---

    async findIppById(req: Request, res: Response, next: NextFunction) {
        try {
            const { ipp } = req.params;
            if (!ipp) {
                return res.status(400).json({ message: 'IPP parameter is required.' });
            }
            const ippRecord = await ippService.findIppById(ipp);
            res.status(200).json(ippRecord);
        } catch (error) {
            next(error);
        }
    }

    async findAllIpps(req: Request, res: Response, next: NextFunction) {
        try {
            const ipps = await ippService.findAllIpps();
            res.status(200).json(ipps);
        } catch (error) {
            next(error);
        }
    }

    async findAllIppsByNpk(req: Request, res: Response, next: NextFunction) {
        try {
            const { npk } = req.params;
            if (!npk) {
                return res.status(400).json({ message: 'IPP parameter is required.' });
            }
            const ippRecords = await ippService.findAllIppsByNpk(npk);
            res.status(200).json(ippRecords);
        } catch (error) {
            next(error);
        }
    }

    async findActiveIppByNpk(req: Request, res: Response, next: NextFunction) {
        try {
            const { npk } = req.params;
            if (!npk) {
                return res.status(400).json({ message: 'IPP parameter is required.' });
            }
            const ippRecord = await ippService.findActiveIppByNpk(npk);
            res.status(200).json(ippRecord);
        } catch (error) {
            next(error);
        }
    }

    async createIpp(req: Request, res: Response, next: NextFunction) {
        try {
            // Membedakan antara createIpp biasa dan with activities
            if (req.body.activities && Array.isArray(req.body.activities)) {
                const newIpp = await ippService.createIppwithActvities(req.body);
                res.status(201).json(newIpp);
            } else {
                const newIpp = await ippService.createIpp(req.body);
                res.status(201).json(newIpp);
            }
        } catch (error) {
            next(error);
        }
    }

    async updateIpp(req: Request, res: Response, next: NextFunction) {
        try {
            const { ipp } = req.params;
            if (!ipp) {
                return res.status(400).json({ message: 'IPP parameter is required.' });
            }
            const updatedIpp = await ippService.updateIpp(ipp, req.body);
            res.status(200).json(updatedIpp);
        } catch (error) {
            next(error);
        }
    }

    async deleteIpp(req: Request, res: Response, next: NextFunction) {
        try {
            const { ipp } = req.params;
            if (!ipp) {
                return res.status(400).json({ message: 'IPP parameter is required.' });
            }
            await ippService.deleteIpp(ipp);
            res.status(204).send(); // No Content
        } catch (error) {
            next(error);
        }
    }

    async submitIpp(req: Request, res: Response, next: NextFunction) {
        try {
            const { ipp } = req.params;
            if (!ipp) {
                return res.status(400).json({ message: 'IPP parameter is required.' });
            }
            const submittedIpp = await ippService.submitIpp(ipp);
            res.status(200).json(submittedIpp);
        } catch (error) {
            next(error);
        }
    }

    async unsubmitIpp(req: Request, res: Response, next: NextFunction) {
        try {
            const { ipp } = req.params;
            if (!ipp) {
                return res.status(400).json({ message: 'IPP parameter is required.' });
            }
            const unsubmittedIpp = await ippService.unsubmitIpp(ipp);
            res.status(200).json(unsubmittedIpp);
        } catch (error) {
            next(error);
        }
    }

    async IppVerification(req: Request, res: Response, next: NextFunction) {
        try {
            const { ipp } = req.params;
            if (!ipp) {
                return res.status(400).json({ message: 'IPP parameter is required.' });
            }
            const { status } = req.body as { status: verify_status };
            const verifiedIpp = await ippService.IppVerification(ipp, status);
            res.status(200).json(verifiedIpp);
        } catch (error) {
            next(error);
        }
    }

    async ippApproval(req: Request, res: Response, next: NextFunction) {
        try {
            const { ipp } = req.params;
            if (!ipp) {
                return res.status(400).json({ message: 'IPP parameter is required.' });
            }
            const { status } = req.body as { status: approval_status };
            const approvedIpp = await ippService.ippApproval(ipp, status);
            res.status(200).json(approvedIpp);
        } catch (error) {
            next(error);
        }
    }

    // --- MONTHLY ACHIEVEMENT APPROVAL SERVICES ---

    async findAllMonthlyAchievement(req: Request, res: Response, next: NextFunction) {
        try {
            const { ipp } = req.params;
            if (!ipp) {
                return res.status(400).json({ message: 'IPP parameter is required.' });
            }
            const monthlyApproval = await ippService.findAllMonthlyAchievementApproval(ipp);
            res.status(200).json(monthlyApproval);
        } catch (error) {
            next(error);
        }
    }

    async findMonthlyAchievementById(req: Request, res: Response, next: NextFunction) {
        try {
            const { paramsid } = req.params;
            if (!paramsid) {
                return res.status(400).json({ message: 'ID parameter is required.' });
            }
            const id = parseInt(paramsid);
            const monthlyApproval = await ippService.findMonthlyAchievementById(id);
            res.status(200).json(monthlyApproval);
        } catch (error) {
            next(error);
        }
    }

    async monthlyAchievementApproval(req: Request, res: Response, next: NextFunction) {
        try {
            const { paramsid } = req.params;
            const approval_status = req.body;
            if (!paramsid) {
                return res.status(400).json({ message: 'ID parameter is required.' });
            }
            const id = parseInt(paramsid);
            if (!approval_status) {
                return res.status(400).json({ message: 'Status parameter is required' });
            }
            const monthlyApproval = await ippService.monthlyAchievementApproval(id, approval_status);
            res.status(200).json(monthlyApproval);
        } catch (error) {
            next(error);
        }
    }

    // --- ACTIVITY CONTROLLERS ---

    async findAllIppActivity(req: Request, res: Response, next: NextFunction) {
        try {
            const { ipp } = req.params;
            if (!ipp) {
                return res.status(400).json({ message: 'IPP parameter is required.' });
            }
            const activities = await ippService.findAllIppActivity(ipp);
            res.status(200).json(activities);
        } catch (error) {
            next(error);
        }
    }

    async createActivity(req: Request, res: Response, next: NextFunction) {
        try {
            const { ipp } = req.params;
            if (!ipp) {
                return res.status(400).json({ message: 'IPP parameter is required.' });
            }
            const newActivity = await ippService.createActivity(ipp, req.body);
            res.status(201).json(newActivity);
        } catch (error) {
            next(error);
        }
    }

    async updateActivity(req: Request, res: Response, next: NextFunction) {
        try {
            const { ipp, activity } = req.params;
            if (!ipp) {
                return res.status(400).json({ message: 'IPP parameter is required.' });
            }
            if (!activity) {
                return res.status(400).json({ message: 'Activity parameter is required.' });
            }
            const updatedActivity = await ippService.updateActivity(ipp, activity, req.body);
            res.status(200).json(updatedActivity);
        } catch (error) {
            next(error);
        }
    }

    async deleteActivity(req: Request, res: Response, next: NextFunction) {
        try {
            const { ipp, activity } = req.params;
            if (!ipp) {
                return res.status(400).json({ message: 'IPP parameter is required.' });
            }
            if (!activity) {
                return res.status(400).json({ message: 'Activity parameter is required.' });
            }
            await ippService.deleteActivity(ipp, activity);
            res.status(204).send(); // No Content
        } catch (error) {
            next(error);
        }
    }


    // --- ACHIEVEMENT CONTROLLERS ---

    async findActivityAchievements(req: Request, res: Response, next: NextFunction) {
        try {
            const { ipp, activity } = req.params;
            if (!ipp) {
                return res.status(400).json({ message: 'IPP parameter is required.' });
            }
            if (!activity) {
                return res.status(400).json({ message: 'Activity parameter is required.' });
            }
            const achievements = await ippService.findActivityAchievements(ipp, activity);
            res.status(200).json(achievements);
        } catch (error) {
            next(error);
        }
    }

    async updateActivityAchievement(req: Request, res: Response, next: NextFunction) {
        try {
            const { ipp, activity, month } = req.params;
            if (!ipp) {
                return res.status(400).json({ message: 'IPP parameter is required.' });
            }
            if (!activity) {
                return res.status(400).json({ message: 'Activity parameter is required.' });
            }
            if (!month) {
                return res.status(400).json({ message: 'Month parameter is required.' });
            }
            const monthNumber = parseInt(month, 10);
            const updatedAchievement = await ippService.updateActivityAchievement(ipp, activity, monthNumber, req.body);
            res.status(200).json(updatedAchievement);
        } catch (error) {
            next(error);
        }
    }

    async achievementVerification(req: Request, res: Response, next: NextFunction) {
        try {
            const { ipp, activity, month } = req.params;
            if (!ipp) {
                return res.status(400).json({ message: 'IPP parameter is required.' });
            }
            if (!activity) {
                return res.status(400).json({ message: 'Activity parameter is required.' });
            }
            if (!month) {
                return res.status(400).json({ message: 'Month parameter is required.' });
            }
            const monthNumber = parseInt(month, 10);
            const { status } = req.body as { status: verify_status };
            const verifiedAchievement = await ippService.achievementVerification(ipp, activity, monthNumber, status);
            res.status(200).json(verifiedAchievement);
        } catch (error) {
            next(error);
        }
    }

    // --- EVIDENCE CONTROLLERS ---

    async findAchievementEvidences(req: Request, res: Response, next: NextFunction) {
        try {
            const { ipp, activity, month } = req.params;
            if (!ipp || !activity || !month) {
                return res.status(400).json({ message: "IPP, activity, and month are required." });
            }
            const monthNumber = parseInt(month, 10);
            const evidences = await ippService.findAchievementEvidences(ipp, activity, monthNumber);
            res.status(200).json(evidences);
        } catch (error) {
            next(error);
        }
    }

    async createAchievementEvidence(req: Request, res: Response, next: NextFunction) {
        try {
            const { ipp, activity, month } = req.params;
            if (!ipp || !activity || !month) {
                return res.status(400).json({ message: "IPP, activity, and month are required." });
            }
            if (!req.file) {
                return res.status(400).json({ message: "File is required." });
            }

            const monthNumber = parseInt(month, 10);

            const newEvidence = await ippService.createAchievementEvidence(
                ipp,
                activity,
                monthNumber,
                req.file
            );

            res.status(201).json(newEvidence);
        } catch (error) {
            next(error);
        }
    }

    async updateAchievementEvidence(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({ message: "Evidence ID is required." });
            }

            const evidenceId = parseInt(id, 10);

            const updatedEvidence = await ippService.updateAchievementEvidence(
                evidenceId,
                req.file
            );

            res.status(200).json(updatedEvidence);
        } catch (error) {
            next(error);
        }
    }

    async deleteAchievementEvidence(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({ message: "Evidence ID is required." });
            }

            const evidenceId = parseInt(id, 10);
            await ippService.deleteAchievementEvidence(evidenceId);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }

    // --- EXECUTIVE SUMMARY ---

    async executiveSummary(req: Request, res: Response, next: NextFunction) {
        try {
            const { ipp } = req.params;
            if (!ipp) {
                return res.status(400).json({ message: "IPP ID is required." });
            }
            const executiveSummary = await ippService.executiveSummary(ipp);
            res.status(200).json(executiveSummary);
        } catch (error) {
            next(error);
        }
    }
}