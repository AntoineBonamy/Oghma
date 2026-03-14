import * as CampaignModel from "./campaign.model.js";
import { NotFoundError } from "../../lib/errors.js";

// CREATE CAMPAIGN CONTROLLER

export const createCampaignController = async (req, res, next) => {
  try {
    const { worldId } = req.params;
    const { name, description } = req.body;

    const campaign = await CampaignModel.createCampaign({
      name,
      description,
      worldId,
    });

    res.status(201).json(campaign);
  } catch (error) {
    next(error);
  }
};

// GET CAMPAIGNS BY WORLD ID CONTROLLER

export const getCampaignsController = async (req, res, next) => {
  try {
    const { worldId } = req.params;

    const campaigns = await CampaignModel.getCampaignsByWorldId({ worldId });

    res.json(campaigns);
  } catch (error) {
    next(error);
  }
};

// GET CAMPAIGN BY ID CONTROLLER

export const getCampaignController = async (req, res, next) => {
  try {
    const { worldId, campaignId } = req.params;

    const campaign = await CampaignModel.getCampaignById({
      campaignId,
      worldId,
    });

    if (!campaign) throw new NotFoundError("Campagne non trouvée.");

    res.json(campaign);
  } catch (error) {
    next(error);
  }
};

// GET ACTIVATE CAMPAIGN CONTROLLER

export const getActiveCampaignController = async (req, res, next) => {
  try {
    const { worldId } = req.params;

    const campaign = await CampaignModel.getActiveCampaign({
      worldId,
    });

    if (!campaign) throw new NotFoundError("Aucune campagne active.");

    res.json(campaign);
  } catch (error) {
    next(error);
  }
};

// UPDATE CAMPAIGN CONTROLLER

export const updateCampaignController = async (req, res, next) => {
  try {
    const { worldId, campaignId } = req.params;
    const { name, description } = req.body;

    const campaign = await CampaignModel.updateCampaign({
      campaignId,
      worldId,
      data: { name, description },
    });

    res.json(campaign);
  } catch (error) {
    next(error);
  }
};

// ACTIVATE CAMPAIGN CONTROLLER

export const activateCampaignController = async (req, res, next) => {
  try {
    const { worldId, campaignId } = req.params;

    await CampaignModel.activateCampaign({
      campaignId,
      worldId,
    });

    res.json({ message: "Campagne activée" });
  } catch (error) {
    next(error);
  }
};

// DELETE CAMPAIGN CONTROLLER

export const deleteCampaignController = async (req, res, next) => {
  try {
    const { worldId, campaignId } = req.params;

    await CampaignModel.deleteCampaign({
      campaignId,
      worldId,
    });

    res.json({ message: "Campagne supprimée avec succès" });
  } catch (error) {
    next(error);
  }
};
