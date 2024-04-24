import dotenv from "dotenv";
dotenv.config();
import { pool } from "../util/mysql.js";
import { redis } from "../util/redis.js";

const workingUrl = process.env.AWS_CLOUDFRONT;

//---------------Create Campaign---------------------------------------
async function setCampaignCache() {
    let [campaigns] = await pool.query(
        `
          SELECT product_id, picture , story
          FROM campaigns
          `
    );

    const campaignList = await addUrlForCampaign(campaigns);
    await cacheCampaign(campaignList);
}

export async function createCampaign(product_id, picture, story) {
    try {
        const [campaignResult] = await pool.query(
            `
        INSERT INTO campaigns (product_id,picture,story)
        VALUES(?,?,?);
        `,
            [product_id, picture, story]
        );

        setCampaignCache();

        return campaignResult;
    } catch (err) {
        console.log(err);
        if (err.errno === 1452) {
            return false;
        }
        return false;
    }
}

//------------- Marketing Campaigns API-------------------------------
async function getCampaignFromCache() {
    try {
        const cachedData = await redis.get("campaigns");
        if (cachedData) {
            return JSON.parse(cachedData);
        } else {
            return null;
        }
    } catch (err) {
        console.log(err);
        return;
    }
}
async function cacheCampaign(campaigns) {
    try {
        await redis.set("campaigns", JSON.stringify(campaigns), "EX", 86400);
        return;
    } catch (err) {
        console.log(err);
        return;
    }
}

function addUrlForCampaign(arr) {
    arr.map((element) => (element.picture = `${workingUrl}${element.picture}`));
    return arr;
}

let cachePromise = null;
export async function getCampaign() {
    const cachedData = await getCampaignFromCache();
    if (cachedData) {
        let final = {};
        final.data = cachedData;
        return final;
    }

    if (!cachePromise) {
        cachePromise = (async () => {
            let [campaigns] = await pool.query(
                `
      SELECT product_id, picture , story
      FROM campaigns
      `
            );
            const campaignList = await addUrlForCampaign(campaigns);
            cacheCampaign(campaignList);
            let final = {};
            final.data = campaignList;
            return final;
        })();
    }
    const data = await cachePromise;
    cachePromise = null;
    return data;
}
