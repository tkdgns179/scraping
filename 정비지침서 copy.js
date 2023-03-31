const { loginId, loginPass } = require('./env.js');
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');
const { totalmem } = require('os');

const _num = +process.argv[2];
let count = +process.argv[3] || 0;

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
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
  
  await page.goto('https://gsw.hyundai.com/manualV2/cnts/view/SHOP');

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

  

  
  console.log("completed!!")

  await print_list(1, list.length ,1, page)
  
  
  // console.log(dom);
  
  async function print_list(idx, list_length, preIdx, page) {
    for (; idx <= list_length; idx++) {
      
      const _preIdx = `${preIdx}_${idx}`
  
      await page.click(`#POS_${_preIdx}`)
      console.log(`#POS_${_preIdx}`)
      
      let content = await page.content();  
      let $ = cheerio.load(content)
  
      await page.waitForTimeout(2000);
  
      content = await page.content();  
      $ = cheerio.load(content)
  
      const dtList = $(`#SUB_${_preIdx} > dt`)
      const ddList = $(`#SUB_${_preIdx} > dd`)
  
      console.log(ddList.length);
      if (ddList.length > 0) {
        for (let i = 1; i <= ddList.length; i++) {
          await page.click(`#LEAF_${_preIdx}_${i}`)
          
          await page.waitForSelector('div.printbtn')
          await page.waitForSelector('#contentDatatable')
          await page.waitForSelector('.manual_content_view')
         
          let title = $(`#LEAF_${_preIdx}_${i}`).attr('title').trim();
          title = title.replace(/\//g, "");
          title = title.replace(/\:/g, "-");
          title = title.replace(/\"/g, "");
          await print(page, `${title} ${_preIdx}_${i}`)
          
  
        }
      }
  
      console.log(dtList.length)
      if (dtList.length > 0) {
        const start = 1 + ddList.length;
        const _list_length = dtList.length + ddList.length;
        // DFS 전위순회
        await print_list(start, _list_length, _preIdx, page)
      }
      await page.waitForTimeout(500);
  
  
     }
    
  }
  
  async function print(page, index) {
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
      path: path(`${index}`),
      format: "A4",
      margin: {
        top: "20px",
        right: "70px",
        bottom: "20px",
        left: "70px"
      }
      })  
    await popup.close();
    console.log(count);
  }

  // 테스트 종료
  await browser.close();
})();





function path(fileName) {
  // let numStr = (++count).toString().padStart(3, "0");
  return './정비지침서/'+fileName+'.pdf';
}

function delay(time) {
  return new Promise(function(resolve) { 
      setTimeout(resolve, time)
  });
}