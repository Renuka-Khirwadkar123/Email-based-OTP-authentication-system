const { test, expect } = require('@playwright/test');
const locators = require('./locators');
const data = require('./data.json');
const gmailUtil = require('./gmailUtility');


test('Verify email authentication flow', async ({ page }) => {

    

    await page.goto(data.url);
    await page.fill(locators.email, data.email);
    await page.click(locators.sendOTPButton);
    const otp = await gmailUtil.getOTP();
    await page.fill(locators.enterOTP, otp);
    await page.click(locators.verifyOTPButton);
    await expect(page).toHaveURL(/success\.html/);

});