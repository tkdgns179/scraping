const { loginId, loginPass } = require('./env.js');
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');

const _num = +process.argv[2];
let count = +process.argv[3] || 0;

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    // executablePath : "C:/Program Files/Google/Chrome/Application/chrome.exe",
    args: [`--window-size=1920,1080`],
    defaultViewport: {
      width:1920,
      height:1080
    }
  });
  const page = await browser.newPage();
 
  // 페이지로 이동
  await page.goto('https://gsw.hyundai.com/hmc/login.tiles');
  // await page.screenshot({path: path('login-screen')});
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
  
  

  await page.waitForTimeout(500)
  await page.waitForSelector(`#IN_${_num}`)

  // console.log(content)
  await page.click(`#IN_${_num}`)
  await page.waitForSelector(`#POS_${_num}_1`)

  const content = await page.content();  

  const $ = cheerio.load(content)
  const list = $(`#SUB_${_num} > dt`)

  console.log(list.length)
  let idx = (count + 1);

  

  for (; idx <= list.length; idx++) {


    await page.click(`#POS_${_num}_${idx}`)
    
    await page.waitForSelector(`#LEAF_${_num}_${idx}_1`)
    await page.waitForSelector(`#SUB_${_num}_${idx} > dd`)
    const content = await page.content();
    const $ = cheerio.load(content)
    
    let list = $(`#SUB_${_num}_${idx} > dd`)
   

    if (list.length != 2) continue;


    
    await page.click(`#LEAF_${_num}_${idx}_2`) 

    

    let now; page_idx = 0;
    while (true) {
      await page.waitForSelector('div.printbtn')
      await page.waitForSelector('#contentDatatable')
      await page.waitForSelector('.manual_content_view')
      await page.waitForSelector(`#dispPageView`);
      await page.evaluate((page_idx) => {
        drawEtmImg(page_idx);
      }, page_idx)
      page_idx++;
      await page.waitForSelector('div.printbtn')
      await page.waitForSelector('#contentDatatable')
      await page.waitForSelector('.manual_content_view')

      const content = await page.content();
      const $ = cheerio.load(content)

      now = +$(`#dispPageView > .on`).text()
  
      if (now != page_idx) break;

      await print(page, browser, `${idx}-${page_idx}`)
    }
    count++;
  }
  console.log(_num + " completed!!")


  
  
  // console.log(dom);
  
  
  
  
  // 테스트 종료
  await browser.close();
})();

async function print(page, browser, index) {
  const newPagePromise = new Promise(x => browser.once('targetcreated', target => x(target.page()))); 
  await page.$eval('#contentArea', (element) => {
    return printClick();
  }) // Get DOM HTML
  const popup = await newPagePromise;
  await popup.on('dialog', async dialog => {
    
    await dialog.dismiss();
    
  });
  await popup.waitForTimeout(4000);
  await popup.pdf({
    path: path(`회로도-${index}`),
    margin: {
      top: "20px",
      right: "70px",
      bottom: "20px",
      left: "70px"
    }
    })  
  await popup.close();
  console.log(_num+ ' - ' +count);
}

function path(fileName) {
  // let numStr = (++count).toString().padStart(3, "0");
  return './'+ _num +'/'+fileName+'.pdf';
}

function delay(time) {
  return new Promise(function(resolve) { 
      setTimeout(resolve, time)
  });
}