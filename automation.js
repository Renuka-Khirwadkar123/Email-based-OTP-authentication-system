const { chromium } = require("playwright");
const { spawn } = require("child_process");

(async () => {

  const server = spawn("node", ["server.js"]);

  let otp = null;

  server.stdout.on("data", (data) => {
    const text = data.toString();

    const match = text.match(/OTP_GENERATED:\s*(\d+)/);

    if (match) {
      otp = match[1];
      console.log("OTP captured:", otp);
    }
  });

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto("http://localhost:3000/login.html");

  await page.fill('input[name="email"]', "test@test.com");

  await page.click('button[type="submit"]');

  // wait for verify page
  await page.waitForSelector('input[name="otp"]');

  // wait for otp to be captured
  while (!otp) {
    await page.waitForTimeout(500);
  }

  await page.fill('input[name="otp"]', otp);

  await page.click('button[type="submit"]');

})();