
const fs = require("fs");
const path = require("path");
const [,, targetPath, base64Content] = process.argv;
const fullPath = path.resolve(process.cwd(), targetPath);
fs.mkdirSync(path.dirname(fullPath), { recursive: true });
fs.writeFileSync(fullPath, Buffer.from(base64Content, "base64").toString("utf-8"));
console.log("Wrote " + targetPath);
