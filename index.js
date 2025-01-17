import fs from "fs";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import readline from "readline/promises";
import { stdin as input, stdout as output } from "node:process";

puppeteer.use(StealthPlugin());

const getUserInput = async () => {
  const rl = readline.createInterface({ input, output });

  const estabelecimento = await rl.question("Digite o estabelecimento a ser procurado: ");
  const localidade = await rl.question("Digite a localidade: ");

  rl.close();
  return { estabelecimento, localidade };
};

const extractPhoneNumber = async (page) => {
  try {
    await page.waitForSelector('button[aria-label*="Telefone"]', { timeout: 5000 });
    await page.click('button[aria-label*="Telefone"]');

    const phoneNumber = await page.evaluate(() => {
      const phoneElement = document.querySelector('button[aria-label*="Telefone"]');
      return phoneElement ? phoneElement.getAttribute("aria-label").replace(/\D/g, "") : null;
    });

    return phoneNumber;
  } catch (error) {
    return null;
  }
};

const main = async () => {
  const { estabelecimento, localidade } = await getUserInput();

  const browser = await puppeteer.launch({
    headless: false,
  });

  const page = await browser.newPage();

  await page.goto(`https://www.google.com/maps/search/${estabelecimento}+${localidade}/`);

  try {
    const acceptCookiesSelector = "form:nth-child(2)";
    await page.waitForSelector(acceptCookiesSelector, { timeout: 5000 });
    await page.click(acceptCookiesSelector);
  } catch (error) {}

  await page.evaluate(async () => {
    const searchResultsSelector = 'div[role="feed"]';
    const wrapper = document.querySelector(searchResultsSelector);

    await new Promise((resolve, reject) => {
      var totalHeight = 0;
      var distance = 1000;
      var scrollDelay = 3000;

      var timer = setInterval(async () => {
        var scrollHeightBefore = wrapper.scrollHeight;
        wrapper.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeightBefore) {
          totalHeight = 0;
          await new Promise((resolve) => setTimeout(resolve, scrollDelay));

          var scrollHeightAfter = wrapper.scrollHeight;

          if (scrollHeightAfter > scrollHeightBefore) {
            return;
          } else {
            clearInterval(timer);
            resolve();
          }
        }
      }, 200);
    });
  });

  const results = await page.evaluate(() => {
    const items = Array.from(
      document.querySelectorAll('div[role="feed"] > div > div[jsaction]')
    );

    return items.map((item) => {
      let data = {};

      try {
        data.title = item.querySelector(".fontHeadlineSmall").textContent;
      } catch (error) {}

      try {
        data.link = item.querySelector("a").getAttribute("href");
      } catch (error) {}

      try {
        data.website = item
          .querySelector('[data-value="Website"]')
          .getAttribute("href");
      } catch (error) {}

      try {
        const ratingText = item
          .querySelector('.fontBodyMedium > span[role="img"]')
          .getAttribute("aria-label")
          .split(" ")
          .map((x) => x.replace(",", "."))
          .map(parseFloat)
          .filter((x) => !isNaN(x));

        data.stars = ratingText[0];
        data.reviews = ratingText[1];
      } catch (error) {}

      return data;
    });
  });

  for (let result of results) {
    if (result.link) {
      await page.goto(result.link);

      result.phone = await extractPhoneNumber(page);

      await page.goBack();
    }
  }

  const filteredResults = results.filter((result) => result.title);
  fs.writeFileSync("results.json", JSON.stringify(filteredResults, null, 2));

  console.log("Completed");

  await browser.close();
};

main();
