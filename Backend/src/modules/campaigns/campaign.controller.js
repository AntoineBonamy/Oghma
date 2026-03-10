import * as CampaignModel from "./campaign.model.js";

// CREATE CAMPAIGN CONTROLLER

export const createCampaignController = async (req, res) => {
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
    res
      .status(500)
      .json({ error: "Erreur lors de la création de la campagne" });
  }
};

// GET CAMPAIGNS BY WORLD ID CONTROLLER

export const getCampaignsController = async (req, res) => {
  try {
    const { worldId } = req.params;

    const campaigns = await CampaignModel.getCampaignsByWorldId({ worldId });

    res.json(campaigns);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erreur lors de la récupération des campagnes" });
  }
};

// GET CAMPAIGN BY ID CONTROLLER

export const getCampaignController = async (req, res) => {
  try {
    const { worldId, campaignId } = req.params;

    const campaign = await CampaignModel.getCampaignById({
      campaignId,
      worldId,
    });

    if (!campaign) {
      return res.status(404).json({ error: "Campagne non trouvée" });
    }

    res.json(campaign);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erreur lors de la récupération de la campagne" });
  }
};

// GET ACTIVATE CAMPAIGN CONTROLLER

export const getActiveCampaignController = async (req, res) => {
  try {
    const { worldId } = req.params;

    const campaign = await CampaignModel.getActiveCampaign({
      worldId,
    });

    if (!campaign) {
      return res.status(404).json({
        error: "Campagne active non trouvée",
      });
    }

    res.json(campaign);
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Erreur lors de la récupération de la campagne active" });
  }
};

// UPDATE CAMPAIGN CONTROLLER

export const updateCampaignController = async (req, res) => {
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
    res
      .status(500)
      .json({ error: "Erreur lors de la mise à jour de la campagne" });
  }
};

// ACTIVATE CAMPAIGN CONTROLLER

export const activateCampaignController = async (req, res) => {
  try {
    const { worldId, campaignId } = req.params;

    await CampaignModel.activateCampaign({
      campaignId,
      worldId,
    });

    res.json({ message: "Campagne activée" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erreur lors de l'activation de la campagne" });
  }
};

// DELETE CAMPAIGN CONTROLLER

export const deleteCampaignController = async (req, res) => {
  try {
    const { worldId, campaignId } = req.params;

    await CampaignModel.deleteCampaign({
      campaignId,
      worldId,
    });

    res.json({ message: "Campagne supprimée avec succès" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erreur lors de la suppression de la campagne" });
  }
};
