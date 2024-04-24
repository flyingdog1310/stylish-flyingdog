import express from "express";
const router = express.Router();

//directory render

//get----------/
router.get("/", async (req, res) => {
  res.render("index");
});

//get----------/product
router.get("/product", async (req, res) => {
  res.render("product");
});
//get----------/profile
router.get("/profile", async (req, res) => {
  res.render("profile");
});
//get----------/cart
router.get("/cart", async (req, res) => {
  res.render("cart");
});

//get----------/facebook sign up
router.get("/facebook", async (req, res) => {
  res.render("facebook");
});

//-----/
export { router as root };
