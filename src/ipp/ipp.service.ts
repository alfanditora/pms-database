import { PrismaClient, type Category, type approval_status, type verify_status, type status_enum } from "@prisma/client";
import { supabaseAdmin } from "../lib/supabaseAdmin.js";
import type { Express } from "express";

const prisma = new PrismaClient();

// --- TYPE DEFINITIONS ---

type IppInput = {
    ipp: string;
    year: number;
    npk: string;
    categoryId: number;
}

type IppWithActivitiesInput = {
    ipp: string;
    year: number;
    npk: string;
    categoryId: number;
    activities: ActivityInput[]
}

type ActivityInput = {
    activity: string;
    activity_category: 'ROUTINE' | 'NON_ROUTINE' | 'PROJECT';
    activity_name: string;
    kpi: string;
    weight: number;
    target: string;
    deliverable: string;
}

type ActivityAchievementUpdateInput = {
    status?: status_enum;
    achievement_value?: number;
}

type ExecutiveSummary = {
    summary: {
        year: number;
        month: number;
        total_activity: number;
        count_activity: number;
        achieve: number;
        not_achieve: number;
        count_weight: number;
        achieve_weight: number;
        monthly_activity_achievement_count: number;
        monthly_approval: approval_status;
    }[];
    total_average: number;
}

export class IppService {

    // --- PRIVATE VALIDATION HELPERS ---

    private async _validateActivityBatch(
        tx: any,
        activities: ActivityInput[],
        category: { routine: number; non_routine: number; project: number }
    ) {
        const newWeightsByCategory = { ROUTINE: 0, NON_ROUTINE: 0, PROJECT: 0 };
        const activityNames = new Set<string>();

        for (const activity of activities) {
            if (activityNames.has(activity.activity)) {
                throw new Error(`Duplicate activity name "${activity.activity}" in the submission.`);
            }
            activityNames.add(activity.activity);

            if (activity.weight < 0 || activity.weight > 100) {
                throw new Error(`Weight for activity "${activity.activity}" must be between 0 and 100.`);
            }
            newWeightsByCategory[activity.activity_category] += activity.weight;
        }

        if (newWeightsByCategory.ROUTINE > category.routine) {
            throw new Error(`Total weight for ROUTINE activities exceeds the limit of ${category.routine * 100}%.`);
        }
        if (newWeightsByCategory.NON_ROUTINE > category.non_routine) {
            throw new Error(`Total weight for NON_ROUTINE activities exceeds the limit of ${category.non_routine * 100}%.`);
        }
        if (newWeightsByCategory.PROJECT > category.project) {
            throw new Error(`Total weight for PROJECT activities exceeds the limit of ${category.project * 100}%.`);
        }
    }

    private async _validateActivity(
        tx: any,
        activityData: ActivityInput,
        ipp: string,
        category: Category
    ) {
        if (await tx.activity.findUnique({ where: { ippId_activity: { ippId: ipp, activity: activityData.activity } } })) {
            throw new Error(`Activity with name "${activityData.activity}" already exists in this IPP.`);
        }

        if (activityData.weight < 0 || activityData.weight > 100) {
            throw new Error('Weight must be between 0 and 100');
        }

        let categoryWeightLimit: number;
        switch (activityData.activity_category) {
            case 'ROUTINE': categoryWeightLimit = category.routine; break;
            case 'NON_ROUTINE': categoryWeightLimit = category.non_routine; break;
            case 'PROJECT': categoryWeightLimit = category.project; break;
        }

        const aggregation = await tx.activity.aggregate({
            _sum: { weight: true },
            where: { ippId: ipp, activity_category: activityData.activity_category }
        });
        const currentTotalWeight = aggregation._sum.weight || 0;

        if ((currentTotalWeight + activityData.weight) > categoryWeightLimit) {
            throw new Error(`Adding this activity exceeds the weight limit of ${categoryWeightLimit}% for the '${activityData.activity_category}' category.`);
        }
    }

    // --- PRIVATE FINDER HELPER ---

    private async _findAchievement(ipp: string, activity_name: string, month: number) {
        const activity = await prisma.activity.findUnique({
            where: { ippId_activity: { ippId: ipp, activity: activity_name } },
        });

        if (!activity) {
            throw new Error(`Activity "${activity_name}" not found in IPP "${ipp}".`);
        }

        const achievement = await prisma.activityAchievement.findUnique({
            where: { activityId_month: { activityId: activity.id, month } },
        });

        if (!achievement) {
            throw new Error(`Achievement for month ${month} not found for this activity.`);
        }
        return achievement;
    }


    // --- IPP SERVICES ---

    async findIppById(ipp_id: string) {
        return prisma.ipp.findUniqueOrThrow({ where: { ipp: ipp_id } });
    }

    async findAllIpps() {
        return prisma.ipp.findMany();
    }

    async findAllIppsByNpk(npk: string) {
        await prisma.user.findUniqueOrThrow({ where: { npk } });
        return prisma.ipp.findMany({ where: { npk } });
    }

    async findActiveIppByNpk(npk: string) {
        await prisma.user.findUniqueOrThrow({ where: { npk } });
        const currentYear = new Date().getFullYear();
        return prisma.ipp.findFirst({ where: { npk, year: currentYear } });
    }

    async createIppwithActvities(data: IppWithActivitiesInput) {
        return prisma.$transaction(async (tx) => {
            if (await tx.ipp.findUnique({ where: { ipp: data.ipp } })) {
                throw new Error(`IPP with name "${data.ipp}" already exists.`);
            }
            const category = await tx.category.findUniqueOrThrow({ where: { category_id: data.categoryId } });
            await this._validateActivityBatch(tx, data.activities, category);

            return tx.ipp.create({
                data: {
                    ...data,
                    activities: { create: data.activities }
                },
                include: { activities: true }
            });
        });
    }

    async createIpp(data: IppInput) {
        if (await prisma.ipp.findUnique({ where: { ipp: data.ipp } })) {
            throw new Error('IPP already exists');
        }
        if (!await prisma.user.findUnique({ where: { npk: data.npk } })) {
            throw new Error('User not found');
        }
        if (!await prisma.category.findUnique({ where: { category_id: data.categoryId } })) {
            throw new Error('Category not found');
        }
        return prisma.ipp.create({ data });
    }

    async updateIpp(ipp: string, updateData: Partial<Omit<IppInput, 'ipp'>>) {
        const existingIpp = await prisma.ipp.findUniqueOrThrow({ where: { ipp } });
        if (existingIpp.submitAt) throw new Error('Cannot update a submitted IPP.');
        if (updateData.npk) await prisma.user.findUniqueOrThrow({ where: { npk: updateData.npk } });
        if (updateData.categoryId) await prisma.category.findUniqueOrThrow({ where: { category_id: updateData.categoryId } });

        return prisma.ipp.update({ where: { ipp }, data: updateData });
    }

    async deleteIpp(ipp: string) {
        const existingIpp = await prisma.ipp.findUniqueOrThrow({ where: { ipp } });
        if (existingIpp.submitAt) throw new Error('Cannot delete a submitted IPP.');
        return prisma.ipp.delete({ where: { ipp } });
    }

    async submitIpp(ipp: string) {
        const existingIpp = await prisma.ipp.findUniqueOrThrow({ where: { ipp } });
        if (existingIpp.submitAt) throw new Error('IPP has already been submitted.');
        return prisma.ipp.update({ where: { ipp }, data: { submitAt: new Date() } });
    }

    async unsubmitIpp(ipp: string) {
        const existingIpp = await prisma.ipp.findUniqueOrThrow({ where: { ipp } });
        if (!existingIpp.submitAt) throw new Error('IPP is not submitted yet.');
        return prisma.ipp.update({
            where: { ipp },
            data: { submitAt: null, verify: 'PENDING', approval: 'PENDING' }
        });
    }

    async IppVerification(ipp: string, verify_status: verify_status) {
        const existingIpp = await prisma.ipp.findUniqueOrThrow({ where: { ipp } });
        if (existingIpp.verify === verify_status) throw new Error(`IPP already "${verify_status}"`);
        return prisma.ipp.update({ where: { ipp }, data: { verify: verify_status } });
    }

    async ippApproval(ipp: string, approval_status: approval_status) {
        const existingIpp = await prisma.ipp.findUniqueOrThrow({ where: { ipp }, include: { activities: true } });
        if (existingIpp.approval === approval_status) throw new Error(`IPP is already in "${approval_status}" state.`);

        if (approval_status === 'APPROVED') {
            return prisma.$transaction(async (tx) => {
                if (existingIpp.activities.length === 0) {
                    throw new Error('Cannot approve an IPP with no activities.');
                }
                // create achievements for each activity for 12 months
                const achievementsToCreate = existingIpp.activities.flatMap(activity =>
                    Array.from({ length: 12 }, (_, i) => ({ activityId: activity.id, month: i + 1 }))
                );
                if (achievementsToCreate.length > 0) {
                    await tx.activityAchievement.createMany({ data: achievementsToCreate, skipDuplicates: true });
                }

                // create monthly approval for each ipp for 12 months
                const monthlyApprovalToCreate = Array.from({ length: 12 }, (_, i) => ({ ippId: existingIpp.ipp, month: i + 1 }));
                if (monthlyApprovalToCreate.length > 0) {
                    await tx.monthlyApproval.createMany({ data: monthlyApprovalToCreate, skipDuplicates: true });
                }

                return tx.ipp.update({ where: { ipp }, data: { approval: 'APPROVED' } });
            });
        } else {
            return prisma.ipp.update({ where: { ipp }, data: { approval: approval_status } });
        }
    }

    // --- MONTHLY ACHIEVEMENT APPROVAL SERVICES ---

    async findAllMonthlyAchievementApproval(ipp: string) {
        await prisma.ipp.findUniqueOrThrow({ where: { ipp } });
        return prisma.monthlyApproval.findMany({ where: { ippId: ipp } });
    }

    async findMonthlyAchievementById(id: number) {
        return prisma.monthlyApproval.findUnique({ where: { id } });
    }

    async monthlyAchievementApproval(id: number, approvalStatus: approval_status) {
        const monthlyApproval = await prisma.monthlyApproval.findUnique({
            where: { id },
        });

        if (!monthlyApproval) {
            throw new Error("ID is invalid. Monthly approval record not found.");
        }

        const ippWithActivities = await prisma.ipp.findUnique({
            where: { ipp: monthlyApproval.ippId },
            include: {
                activities: {
                    include: {
                        achievements: {
                            where: {
                                month: monthlyApproval.month,
                            },
                        },
                    },
                },
            },
        });

        if (!ippWithActivities) {
            throw new Error("IPP not found for this monthly approval.");
        }

        const allAchievements = ippWithActivities.activities.flatMap(activity => activity.achievements);

        const allVerified = allAchievements.every(
            (achievement) => achievement.verify === 'VERIFIED'
        );

        if (!allVerified) {
            throw new Error("Some achievements are not yet verified. Cannot approve.");
        }

        return prisma.monthlyApproval.update({
            where: { id },
            data: { approval: approvalStatus },
        });
    }

    // --- ACTIVITY SERVICES ---

    async findAllIppActivity(ipp: string) {
        await prisma.ipp.findUniqueOrThrow({ where: { ipp } });
        return prisma.activity.findMany({ where: { ippId: ipp } });
    }

    async createActivity(ipp: string, data: ActivityInput) {
        return prisma.$transaction(async (tx) => {
            const existingIpp = await tx.ipp.findUniqueOrThrow({ where: { ipp }, include: { category: true } });
            if (existingIpp.submitAt) throw new Error('Cannot add activity to a submitted IPP.');
            await this._validateActivity(tx, data, existingIpp.ipp, existingIpp.category);
            return tx.activity.create({ data: { ...data, ippId: existingIpp.ipp } });
        });
    }

    async updateActivity(ipp: string, activity: string, updateData: Partial<ActivityInput>) {
        return prisma.$transaction(async (tx) => {
            const existingActivity = await tx.activity.findUniqueOrThrow({
                where: { ippId_activity: { ippId: ipp, activity } },
                include: { ipp: { include: { category: true } } }
            });

            if (existingActivity.ipp.submitAt) {
                throw new Error('Cannot update activity in a submitted IPP.');
            }

            if (updateData.activity && updateData.activity !== activity) {
                const duplicate = await tx.activity.findUnique({
                    where: { ippId_activity: { ippId: ipp, activity: updateData.activity } }
                });
                if (duplicate) {
                    throw new Error(`Activity with name "${updateData.activity}" already exists in this IPP.`);
                }
            }

            const needsWeightValidation = updateData.weight !== undefined || updateData.activity_category !== undefined;

            if (needsWeightValidation) {
                const newWeight = updateData.weight ?? existingActivity.weight;
                const newCategory = updateData.activity_category ?? existingActivity.activity_category;

                if (newWeight < 0 || newWeight > 100) {
                    throw new Error(`Weight for activity "${updateData.activity || activity}" must be between 0 and 100.`);
                }

                const categoryLimits = existingActivity.ipp.category;
                let targetCategoryLimit: number;
                switch (newCategory) {
                    case 'ROUTINE': targetCategoryLimit = categoryLimits.routine; break;
                    case 'NON_ROUTINE': targetCategoryLimit = categoryLimits.non_routine; break;
                    case 'PROJECT': targetCategoryLimit = categoryLimits.project; break;
                    default: throw new Error("Invalid activity category specified.");
                }

                const aggregation = await tx.activity.aggregate({
                    _sum: { weight: true },
                    where: { ippId: ipp, activity_category: newCategory }
                });
                const currentWeightInTargetCategory = aggregation._sum.weight || 0;

                let projectedWeight: number;

                if (newCategory === existingActivity.activity_category) {
                    projectedWeight = (currentWeightInTargetCategory - existingActivity.weight) + newWeight;
                } else {
                    projectedWeight = currentWeightInTargetCategory + newWeight;
                }

                if (projectedWeight > targetCategoryLimit) {
                    throw new Error(`Updating this activity exceeds the weight limit of ${targetCategoryLimit}% for the '${newCategory}' category. Projected weight would be ${projectedWeight}%.`);
                }
            }

            return tx.activity.update({
                where: { id: existingActivity.id },
                data: updateData
            });
        });
    }

    async deleteActivity(ipp: string, activity: string) {
        const existingIpp = await prisma.ipp.findUniqueOrThrow({ where: { ipp } });
        if (existingIpp.submitAt) throw new Error('Cannot delete activity from a submitted IPP.');
        const existingActivity = await prisma.activity.findUniqueOrThrow({ where: { ippId_activity: { ippId: ipp, activity } } });
        return prisma.activity.delete({ where: { id: existingActivity.id } });
    }

    // --- ACHIEVEMENT SERVICES ---

    async findActivityAchievements(ipp: string, activity_name: string) {
        const activity = await prisma.activity.findUniqueOrThrow({
            where: { ippId_activity: { ippId: ipp, activity: activity_name } }
        });
        return prisma.activityAchievement.findMany({
            where: { activityId: activity.id },
            orderBy: { month: 'asc' }
        });
    }

    async updateActivityAchievement(ipp: string, activity_name: string, month: number, data: ActivityAchievementUpdateInput) {
        const achievement = await this._findAchievement(ipp, activity_name, month);
        const activity = await prisma.activity.findUniqueOrThrow({ where: { id: achievement.activityId } });

        const achievement_value = data.achievement_value ?? achievement.achievement_value;
        const weightxvalue = (activity.weight * achievement_value) / 100;

        return prisma.activityAchievement.update({
            where: { achievement_id: achievement.achievement_id },
            data: { ...data, weightxvalue }
        });
    }

    async achievementVerification(ipp: string, activity_name: string, month: number, status: verify_status) {
        const achievement = await this._findAchievement(ipp, activity_name, month);
        return prisma.activityAchievement.update({
            where: { achievement_id: achievement.achievement_id },
            data: { verify: status }
        });
    }

    // --- EVIDENCE SERVICES ---

    async findAchievementEvidences(ipp: string, activity_name: string, month: number) {
        const achievement = await this._findAchievement(ipp, activity_name, month);
        return prisma.achievementEvidence.findMany({ where: { achievementId: achievement.achievement_id } });
    }

    async createAchievementEvidence(
        ipp: string,
        activity_name: string,
        month: number,
        file: Express.Multer.File
    ) {
        const achievement = await this._findAchievement(ipp, activity_name, month);

        const filePath = `evidences/${achievement.achievement_id}/${Date.now()}-${file.originalname}`;

        const { error } = await supabaseAdmin.storage
            .from("evidences")
            .upload(filePath, file.buffer, {
                contentType: file.mimetype,
                upsert: false,
            });

        if (error) throw new Error(`Upload gagal: ${error.message}`);

        const { data } = supabaseAdmin.storage.from("evidences").getPublicUrl(filePath);

        return prisma.achievementEvidence.create({
            data: {
                file_path: data.publicUrl,
                achievementId: achievement.achievement_id,
            },
        });
    }

    async updateAchievementEvidence(evidence_id: number, file?: Express.Multer.File) {
        const existing = await prisma.achievementEvidence.findUniqueOrThrow({
            where: { evidence_id },
        });

        let newUrl = existing.file_path;

        if (file) {
            const oldKey = existing.file_path.split("/").slice(-2).join("/");
            await supabaseAdmin.storage.from("evidences").remove([oldKey]);

            const filePath = `evidences/${existing.achievementId}/${Date.now()}-${file.originalname}`;

            const { error } = await supabaseAdmin.storage
                .from("evidences")
                .upload(filePath, file.buffer, {
                    contentType: file.mimetype,
                    upsert: false,
                });

            if (error) throw new Error(`Upload gagal: ${error.message}`);

            const { data } = supabaseAdmin.storage.from("evidences").getPublicUrl(filePath);

            newUrl = data.publicUrl;
        }

        return prisma.achievementEvidence.update({
            where: { evidence_id },
            data: { file_path: newUrl },
        });
    }

    async deleteAchievementEvidence(evidence_id: number) {
        const existing = await prisma.achievementEvidence.findUniqueOrThrow({
            where: { evidence_id },
        });

        const fileKey = existing.file_path.split("/").slice(-2).join("/");
        await supabaseAdmin.storage.from("evidences").remove([fileKey]);

        return prisma.achievementEvidence.delete({ where: { evidence_id } });
    }

    // --- EXECUTIVE SUMMARY ---

    async executiveSummary(ippString: string): Promise<ExecutiveSummary> {
        const existingIpp = await prisma.ipp.findUnique({
            where: { ipp: ippString },
            include: {
                activities: {
                    include: {
                        achievements: true,
                    },
                },
                MonthlyApproval: true,
            },
        });

        if (!existingIpp) {
            throw new Error('IPP not found');
        }

        const summary = [];
        let totalAchievedWeights = 0;
        let totalWeights = 0;

        const year = existingIpp.year;

        const totalActivities = existingIpp.activities.length;
        const totalWeight = existingIpp.activities.reduce((sum, activity) => sum + activity.weight, 0);

        for (let month = 1; month <= 12; month++) {
            const monthlyAchievements = existingIpp.activities.flatMap(activity =>
                activity.achievements.filter(ach => ach.month === month)
            );

            const countActivity = monthlyAchievements.length;
            let achieveCount = 0;
            let notAchieveCount = 0;
            let achieveWeight = 0;

            // Get the monthly approval status for the current month
            const monthlyApproval = existingIpp.MonthlyApproval.find(
                (approval) => approval.month === month
            )?.approval || 'PENDING';

            for (const achievement of monthlyAchievements) {
                // Find the parent activity to get the target and weight
                const parentActivity = existingIpp.activities.find(
                    (act) => act.id === achievement.activityId
                );

                if (parentActivity) {
                    // Assuming target is a number; adjust if it's a string like "100%"
                    const target = parseFloat(parentActivity.target);

                    if (achievement.achievement_value >= target) {
                        achieveCount++;
                        achieveWeight += parentActivity.weight;
                    } else {
                        notAchieveCount++;
                    }
                }
            }

            summary.push({
                year,
                month,
                total_activity: totalActivities,
                count_activity: countActivity,
                achieve: achieveCount,
                not_achieve: notAchieveCount,
                count_weight: totalWeight,
                achieve_weight: achieveWeight,
                monthly_activity_achievement_count: countActivity,
                monthly_approval: monthlyApproval,
            });

            totalAchievedWeights += achieveWeight;
            totalWeights += totalWeight;
        }

        // Calculate the total average
        const totalAverage = totalWeights > 0 ? (totalAchievedWeights / totalWeights) * 100 : 0;

        return {
            summary,
            total_average: parseFloat(totalAverage.toFixed(2)),
        };
    }
}