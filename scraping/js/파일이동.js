const testFolder = 'C:\\Users\\NB28\\Desktop\\DTC\\ABS EBS - EBS(KNORR)';
const fs = require('fs');

fs.readdir(testFolder, (err, files) => {
  files.forEach(file => {
    let dirpath = testFolder + "\\" + file +"\\세부사항";
    fs.rmdirSync(dirpath)
  });
});

// for (let i = 13; i < 37; i++) {
//     fs.mkdirSync(`./${i}`);
// }