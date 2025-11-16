const QRCode = require("qrcode");

const BASE_URL = "http://192.168.1.12:3000"; // your local IP
const tables = [1, 2, 3, 4, 5]; // number of tables

tables.forEach((t) => {
  const url = `${BASE_URL}/?table=${t}`;
  QRCode.toFile(`qr_table_${t}.png`, url, () => {
    console.log(`Generated QR for Table ${t}`);
  });
});
