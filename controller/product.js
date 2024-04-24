import express from "express";
const router = express.Router();
import { getProduct, getProductSearch, getProductDetail } from "../model/product.js";
import { staticUrlFixer } from "../util/url.js";

async function productListAPI(target, page) {
    const productList = await getProduct(target, page);
    if (productList[1] - page * 6 <= 0) {
        return "no product on this page";
    }
    if (productList[1] - page * 6 <= 6) {
        productList[0] = staticUrlFixer(productList[0], "main_image");
        return { data: productList[0] };
    }
    if (productList[1] - page * 6 > 6) {
        productList[0] = staticUrlFixer(productList[0], "main_image");
        display.next_paging = 1 + Number(page);
        return { data: productList[0] };
    }
}

async function productSearchAPI(keyword, page) {
    const productList = await getProductSearch(keyword, page);
    if (productList[1] - page * 6 <= 0) {
        return "no product on this page";
    }
    if (productList[1] - page * 6 <= 6) {
        productList[0] = staticUrlFixer(productList[0], "main_image");
        return { data: productList[0] };
    }
    if (productList[1] - page * 6 > 6) {
        productList[0] = staticUrlFixer(productList[0], "main_image");
        display.next_paging = 1 + Number(page);
        return { data: productList[0] };
    }
}

//get ----/products/category
router.get(["/all", "/men", "/women", "/accessories"], async (req, res) => {
    const category = req.path.slice(1);
    let page = Math.floor(req.query.paging) || 0;
    if (isNaN(page) || page < 0) {
        res.status(403).json("Page number should be positive integer");
        return;
    }
    res.json(await productListAPI(category, page));
    return;
});

//get ------/products/search
router.get("/search", async (req, res) => {
    let keyword = req.query.keyword;
    let page = Math.floor(req.query.paging) || 0;
    if (keyword) {
        if (isNaN(page) || page < 0) {
            res.status(403).json("Page number should be positive integer");
            return;
        }
        res.json(await productSearchAPI(keyword, page));
        return;
    }
    res.status(400).json("keyword is required.");
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
            search = staticUrlFixer(search, "main_image");
            res.json({ data: search[0] });
            return;
        }
    }
    res.status(400).json("Offer product id for detail, please.");
    return;
});

export { router as productAPI };
