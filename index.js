const express = require("express");
const line = require("@line/bot-sdk");
const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");

const app = express();
app.use(express.json());

// ================= CONFIG =================
const PORT = process.env.PORT || 3000;
const LINE_TOKEN = process.env.LINE_TOKEN;

if (!LINE_TOKEN) {
  console.error("❌ ไม่พบ LINE_TOKEN");
  process.exit(1);
}

const client = new line.Client({
  channelAccessToken: LINE_TOKEN
});

// ================= UTIL =================
const readJSON = (path, def = []) =>
  fs.existsSync(path) ? JSON.parse(fs.readFileSync(path)) : def;

const writeJSON = (path, data) =>
  fs.writeFileSync(path, JSON.stringify(data, null, 2));

// ================= MARKETS =================
// 👉 แก้เวลาได้ตามต้องการ
const MARKETS = [
  {
    name: "🇯🇵 นิเคอิเช้า vip",
    time: "09:05",
    url: "https://www.investing.com/indices/japan-ni225",
    selector: '[data-test="instrument-price-last"]'
  },
  {
    name: "🇯🇵 นิเคอิ vip",
    time: "09:30",
    url: "https://www.investing.com/indices/japan-ni225",
    selector: '[data-test="instrument-price-last"]'
  },
  {
    name: "🇨🇳 จีนเช้า vip",
    time: "10:05",
    url: "https://www.investing.com/indices/china-a50",
    selector: '[data-test="instrument-price-last"]'
  }
];

// ================= FLEX (สไตล์ภาพตัวอย่าง) =================
function resultFlex(market, time, top, bottom) {
  return {
    type: "flex",
    altText: `[bot] ${market} ${top}-${bottom}`,
    contents: {
      type: "bubble",
      size: "mega",
      body: {
        type: "box",
        layout: "vertical",
        backgroundColor: "#FFFFFF",
        paddingAll: "lg",
        contents: [
          {
            type: "text",
            text: "[bot] ประกาศผล",
            weight: "bold",
            size: "md",
            color: "#000000"
          },
          {
            type: "text",
            text: market,
            size: "md",
            color: "#000000",
            margin: "sm"
          },
          {
            type: "text",
            text: `เวลา ${time} น.`,
            size: "sm",
            color: "#666666",
            margin: "