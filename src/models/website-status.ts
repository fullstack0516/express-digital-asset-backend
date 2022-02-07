import * as Joi from "joi";

export interface WebsiteStatus {
    uid: string;
    mode: 'online' | 'offline';
    isUnderMaintenance: boolean;
    maintenanceMessageForUsers: string
}

export const websiteStatusSchema = Joi.object({
    uid: Joi.string().required(),
    mode: Joi.string().required(),
    isUnderMaintenance: Joi.bool().required(),
    maintenanceMessageForUsers: Joi.string().required()
})
