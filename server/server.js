import express from "express";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import dotenv from "dotenv";
dotenv.config();
import { redis } from "./util/redis.js";
const app = express();
const port = process.env.SERVER_PORT;
import { Server } from "socket.io";
const io = new Server(3000);

app.set("view engine", "pug");
app.use("/images", express.static("images"));
app.use("/public", express.static(__dirname + "/public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", async function (req, res, next) {
  let ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

  async function isOverLimit(ip) {
    let res;
    try {
      res = await redis.incr(ip);
    } catch (err) {
      console.error("isOverLimit: could not increment key");
      return;
    }
    console.log(`${ip} has value: ${res}`);
    if (res > 10) {
      return true;
    }
    redis.expire(ip, 1);
  }

  let overLimit = await isOverLimit(ip);
  if (overLimit) {
    res.status(429).send("Too many requests - try again later");
    return;
  }

  next();
});

import { root } from "./root.js";
app.use("/", root);

import { adminAPI } from "./api/admin.js";
app.use("/admin", adminAPI);

import { productAPI } from "./api/product.js";
app.use("/api/1.0/products", productAPI);

import { marketingAPI } from "./api/marketing.js";
app.use("/api/1.0/marketing", marketingAPI);

import { userAPI } from "./api/user.js";
app.use("/api/1.0/user", userAPI);

import { orderAPI } from "./api/order.js";
app.use("/api/1.0/order", orderAPI);

import { reportAPI } from "./api/report.js";
app.use("/api/1.0/report", reportAPI);

//404error
app.use((req, res, next) => {
  const err = new Error("The page requested is not available");
  err.status = 404;
  next(err);
});

app.listen(port, () => {
  console.log(`App is currently running on port ${port}`);
});
