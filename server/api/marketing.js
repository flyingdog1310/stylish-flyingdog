import express from "express";
const router = express.Router();
import { getCampaign } from "../database/marketing.js";

//get------/marketing/campaigns

router.get("/campaigns", async (req, res) => {
    let campaigns = await getCampaign();
    res.json(campaigns);
});

export { router as marketingAPI };
