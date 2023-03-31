const { loginId, loginPass } = require('./env/env')
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
let count = 0;
 
(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: [`--window-size=1920,1080`],
    defaultViewport: {
      width:1920,
      height:1080
    }
  });
  const page = await browser.newPage();
 
  // 페이지로 이동
  await page.goto('https://gsw.hyundai.com/hmc/login.tiles');
  await page.screenshot({path: path('login-screen')});
  // console.log(await page.content())
 
  // 로그인
  await page.evaluate((id, pw) => {
    document.querySelector('#Userid').value = id;
    document.querySelector('#Passwd').value = pw;
    }, loginId, loginPass);

  // 로그인 버튼 클릭
  await page.click('input[id ="LoginButton"]');
  await page.waitForSelector('html');
  
  await page.goto('https://gsw.hyundai.com/manualV2/cnts/view/DTC');

  await page.select('#vehlTypeCd', 'CA')
  await page.select('#mdlCd', '9655__PY51')
  await page.select('#year', '2022')
  await page.select('#engCd', 'EM330')
  await page.waitForSelector('html');
  
  await page.screenshot({path: path('after-login')});

  const content = await page.content();
  // console.log(content)
  const $ = cheerio.load(content)
  const list = $('#SUB_1').find('dt').each((index, ele) => {
    console.log(index)
  })
  
  console.log(list)

  list.each((index, list) => {
    console.log(index);
  });
  

  

  // 테스트 종료
  await browser.close();
})();
 
function path(fileName) {
  let numStr = (++count).toString().padStart(3, "0");
  return './'+numStr+"-"+fileName+'.png';
}