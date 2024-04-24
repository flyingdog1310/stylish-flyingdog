import express from "express";
import { rateLimit } from "./util/middleware.js";

const app = express();
const port = process.env.SERVER_PORT;
const apiVersion = process.env.API_VERSION;

app.set("view engine", "ejs");
app.set("trust proxy", true);
app.use("/public", express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(rateLimit);

app.get("/", async (req, res) => {
    res.render("index");
});

app.get("/product", async (req, res) => {
    res.render("product");
});

app.get("/profile", async (req, res) => {
    res.render("profile");
});

app.get("/cart", async (req, res) => {
    res.render("cart");
});

app.get("/facebook", async (req, res) => {
    res.render("facebook");
});

import { adminAPI } from "./controller/admin.js";
app.use("/admin", adminAPI);

import { productAPI } from "./controller/product.js";
app.use(`/api/${apiVersion}/products`, productAPI);

import { marketingAPI } from "./controller/marketing.js";
app.use(`/api/${apiVersion}/marketing`, marketingAPI);

import { userAPI } from "./controller/user.js";
app.use(`/api/${apiVersion}/user`, userAPI);

import { orderAPI } from "./controller/order.js";
app.use(`/api/${apiVersion}/order`, orderAPI);

import { reportAPI } from "./controller/report.js";
app.use(`/api/${apiVersion}/report`, reportAPI);

app.get("/health-check", async (req, res) => {
    res.status(200).json("ok");
});

//404error
app.use(function (req, res, next) {
    const ip = req.headers["x-forwarded-for"] || req.ip;
    console.log(`${ip} get ${req.originalUrl} not found`);
    res.status(404).json("404 Not Found");
});

app.use(function (err, req, res, next) {
    console.log(err);
    res.status(500).json("500 Internal Server Error");
});

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});
