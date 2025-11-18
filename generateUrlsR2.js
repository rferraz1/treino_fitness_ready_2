import fs from "fs";
import path from "path";

const BASE_URL = "https://pub-0173b7fd04854be5b34e1727d5fa1798.r2.dev/gifs/";

const gifsJsonPath = path.resolve("public/gifs.json");
const gifsOutputPath = path.resolve("public/gifsUrls.json");

const gifsData = JSON.parse(fs.readFileSync(gifsJsonPath, "utf8"));

function encodePath(str) {
  return str
    .split("/")
    .map((s) => encodeURIComponent(s))
    .join("/");
}

const output = {};

Object.keys(gifsData).forEach((folder) => {
  const normalizedFolder = folder.trim();

  output[normalizedFolder] = gifsData[folder].map((gif) => {
    const encodedFolder = encodePath(normalizedFolder);
    const encodedGif = encodePath(gif.trim());

    return `${BASE_URL}${encodedFolder}/${encodedGif}`;
  });
});

fs.writeFileSync(gifsOutputPath, JSON.stringify(output, null, 2), "utf8");

console.log("✔ gifsUrls.json gerado com sucesso!");
