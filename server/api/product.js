import express from "express";
const router = express.Router();
import dotenv from "dotenv";
dotenv.config();
import { getProduct, getProductSearch, getProductDetail } from "../database/product.js";

async function productListAPI(target, page) {
    const ans = await getProduct(target, page);
    if (ans[1] - page * 6 <= 0) {
        return "no product on this page";
    }
    if (ans[1] - page * 6 <= 6) {
        let display = {};
        display.data = ans[0];
        return display;
    }
    if (ans[1] - page * 6 > 6) {
        let display = {};
        display.data = ans[0];
        display.next_paging = 1 + Number(page);
        return display;
    }
}

async function productSearchAPI(keyword, page) {
    const ans = await getProductSearch(keyword, page);
    if (ans[1] - page * 6 <= 0) {
        return "no product on this page";
    }
    if (ans[1] - page * 6 <= 6) {
        let display = {};
        display.data = ans[0];
        return display;
    }
    if (ans[1] - page * 6 > 6) {
        let display = {};
        display.data = ans[0];
        display.next_paging = 1 + Number(page);
        return display;
    }
}

//get ----/products/category

router.get("/all", async (req, res) => {
    let page = req.query.paging;
    if (page) {
        page = Math.floor(page);
        if (isNaN(page) || page < 0) {
            res.status(403).json("Use positive integer to search pages, please");
            return;
        }
        res.json(await productListAPI("all", page));
        return;
    }
    page = 0;
    res.json(await productListAPI("all", page));
    return;
});

router.get("/men", async (req, res) => {
    const category = req.route.path.slice(1);
    let page = req.query.paging;
    if (page) {
        page = Math.floor(page);
        if (isNaN(page) || page < 0) {
            res.status(403).json("Use positive integer to search pages, please");
        }
        res.json(await productListAPI(category, page));
        return;
    }
    page = 0;
    res.json(await productListAPI(category, page));
    return;
});

router.get("/women", async (req, res) => {
    const category = req.route.path.slice(1);
    let page = req.query.paging;
    if (page) {
        page = Math.floor(page);
        if (isNaN(page) || page < 0) {
            res.status(403).json("Use positive integer to search pages, please");
        }
        res.json(await productListAPI(category, page));
        return;
    }
    page = 0;
    res.json(await productListAPI(category, page));
    return;
});

router.get("/accessories", async (req, res) => {
    const category = req.route.path.slice(1);
    let page = req.query.paging;
    if (page) {
        page = Math.floor(page);
        if (isNaN(page) || page < 0) {
            res.status(403).json("Use positive integer to search pages, please");
        }
        res.json(await productListAPI(category, page));
        return;
    }
    page = 0;
    res.json(await productListAPI(category, page));
    return;
});

//get ------/products/search
router.get("/search", async (req, res) => {
    let keyword = req.query.keyword;
    let page = req.query.paging;
    if (keyword) {
        if (page) {
            page = Math.floor(page);
            if (isNaN(page) || page < 0) {
                res.status(403).json("Use positive integer to search pages, please");
                return;
            } else {
                res.json(await productSearchAPI(keyword, page));
                return;
            }
        }
        page = 0;
        res.json(await productSearchAPI(keyword, page));
        return;
    }
    res.status(400).json("Provide a keyword to search, please.");
    return;
});

//get------/products/details
router.get("/details", async (req, res) => {
    const id = req.query.id;
    if (id) {
        let search = await getProductDetail(id);
        if (search === 0) {
            res.status(400).json("This product does not exist.");
            return;
        } else {
            let result = {};
            result.data = search[0];
            res.json(result);
            return;
        }
    }
    res.status(400).json("Offer product id for detail, please.");
    return;
});

export { router as productAPI };
