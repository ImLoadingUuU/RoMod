import { createExtractorFromFile } from 'node-unrar-js'

async function extractRarArchive(file:string, destination:string) {
  try {
    // Create the extractor with the file information (returns a promise)
    const extractor = await createExtractorFromFile({
      filepath: file,
      targetPath: destination
    });

    // Extract the files
    [...extractor.extract().files];
  } catch (err) {
    // May throw UnrarError, see docs
    console.error(err);
  }
}

// Files are put directly into the destination
// The full path of folders are created if they are missing

//
let mainFolder =`${process.env.HOME}/RoModAssets`
import {QPixmap,ButtonRole,QMessageBox,QProgressBar,QButtonGroup,QFont,QListWidgetItem, QListWidget,QMainWindow, QWidget, QLabel, FlexLayout, QPushButton, QIcon,QLineEdit,QTextEdit,QListWidgetSignals } from '@nodegui/nodegui';
import axios from 'axios';
import { clear } from 'console';
import fs from "fs"
import { removeAllListeners } from 'process';
var AdmZip = require("adm-zip");
let currentPage = 1

module.exports = function(){
  function error(message:string){
    const messageBox = new QMessageBox();
    messageBox.setText(message);
    const accept = new QPushButton();
    accept.addEventListener("clicked",() => {
      process.exit(0)
    })
    accept.setText('Restart Applicationn');
    messageBox.addButton(accept, ButtonRole.AcceptRole);
    messageBox.exec();
}
async function getPixmap(url:string) {
    const { data } = await axios.get(url, { responseType: 'arraybuffer' });
    const pixmap = new QPixmap();
    pixmap.loadFromData(data);
    return pixmap;
}

async function createWindow(id:Number) {
    const centralWidget = new QWidget();
centralWidget.setObjectName("myroot");
const rootLayout = new FlexLayout();
centralWidget.setLayout(rootLayout);
    const win = new QMainWindow();
win.setMaximumSize(300, 300);
win.setMinimumSize(300, 300);
win.setWindowTitle("Loading...")
win.show()
axios({
    method: 'get',
    url: `https://gamebanana.com/apiv10/Mod/${id}/ProfilePage`  
}).then((result) => {
    win.setWindowTitle(result.data._sName)
    const title = new QLabel();
    title.setText(result.data._sName)
    title.setFont(new QFont("System Font", 20));
    title.move(10,10)
    const description = new QTextEdit();
    description.setText(result.data._sText)
    description.setReadOnly(true)
    const button = new QPushButton()
    button.setText("Download")
    // Download Part
    button.addEventListener("clicked",() => {
        button.setDisabled(true)
        button.setText("Cancel 0/0MiB 0MiB/s")
     
        axios({
            method: 'get',
            url: result.data._aFiles[0]._sDownloadUrl,
            responseType: 'stream'
          })
            .then(function (response) {
                let type = response.headers["content-type"]
                let fname = `${mainFolder}/Temp/temp.zip`
                if (type == "application/x-rar-compressed") {
                  fname = `${mainFolder}/Temp/temp.rar`
                }
                const writeStream = fs.createWriteStream(fname);
               
            let  startTime = Date.now();
            let downloaded = 0;
              const total = parseInt(response.headers['content-length'], 10);
              response.data.on('data', (chunk: any) => {
                downloaded += chunk.length;
                let text = ` ${(downloaded / total * 100).toFixed(2)}% (${(downloaded / 1024 / 1024).toFixed(2)}MB/${(total / 1024 / 1024).toFixed(2)}MB)`
                win.setWindowTitle(`Downloading ${text}`)
                button.setText(`Cancel ${text}`)
              });
              response.data.pipe(writeStream);
              writeStream.on('finish',  function () {
               
                  let endTime = Date.now();
                  let diffTime = (endTime - startTime) / 1000;
                  button.setText("Downloaded,Extracting")
                  button.setDisabled(true)
                  writeStream.end()
                try  {
                   if(type == "application/x-rar-compressed"){
                    fs.mkdir(`${mainFolder}/Mods/${result.data._sName}`,(err) => {
                      if (err) { console.error("Failed to install ")}
                  })
                    extractRarArchive(fname, `${mainFolder}/Mods/${result.data._sName}`);
                   } else {
                    let zip = new AdmZip(fname);
                    fs.mkdir(`${mainFolder}/Mods/${result.data._sName}`,(err) => {
                        if (err) { console.error("Failed to install ")}
                    })
                    zip.extractAllTo(`${mainFolder}/Mods/${result.data._sName}`, true);
                   }
                   button.setText("Installed,Deleting Temp..")
                   fs.rm(fname,() => {
                      button.setText("Installed")
                   })
                    
                } catch (err) {
                    button.setText("Failed to extract")
                    console.log(err)
                }
              });
            });
    })
    rootLayout.addWidget(title);
    rootLayout.addWidget(description)
    rootLayout.addWidget(button);
    win.setCentralWidget(centralWidget)
   
}).catch((msg) => {
  error(msg.data)
})
}
const win = new QMainWindow();
win.setWindowTitle("Library");
win.setMaximumSize(500, 600);
win.setMinimumSize(500, 600);
const title = new QLabel();
title.setText("RoMod Library")
title.setFont(new QFont("System Font", 20));
title.setAlignment(0x84)
const status=  new QLabel();
status.setText("Status: Idle")
status.setAlignment(0x84)
const next = new QPushButton()
next.setText("Next Page")
const back = new QPushButton()
back.setText("Previous Page")

const nbgroup = new QButtonGroup()
nbgroup.addButton(next)
nbgroup.addButton(back)
const pt = new QLineEdit()
pt.setPlaceholderText("Search Mod/Texture Packs")
pt.setAlignment(0x84)
const list = new QListWidget()
let currentResult:any
list.addEventListener("itemActivated",(item) => {
  let index = list.currentIndex().row()
  console.log(index)
  let i =   currentResult.data._aRecords[index]
  createWindow(i._idRow)
  
})
let currentListener:QListWidgetSignals
function load(page:number){
 
  axios({
    method: 'get',
    url: `https://gamebanana.com/apiv10/Mod/Index?_nPage=${page}&_nPerpage=50&_aFilters%5BGeneric_Category%5D=598`,
}).then((result) => {
currentResult = result.data._aRecords
  result.data._aRecords.forEach((mod:any) => {
    const item = new QListWidgetItem();
    item.setText(mod._sName)
    
    // when item activatred
   
    list.addItem(item)
   
  })
}).catch((msg) => {
  console.log(msg)
  error(msg.data)
})
}
load(1)
back.addEventListener("clicked",() => {
  console.log("back")
  if (currentPage - 1 == 0) {
   return
  }
  currentPage = currentPage - 1
  list.clear()
  load(currentPage)
})
next.addEventListener("clicked",() => {
 console.log("next")
  currentPage = currentPage + 1
  list.clear()
  load(currentPage)
})
const centralWidget = new QWidget();
centralWidget.setObjectName("myroot");
const rootLayout = new FlexLayout();
centralWidget.setLayout(rootLayout);
rootLayout.addWidget(title);
rootLayout.addWidget(status);
rootLayout.addWidget(list);
rootLayout.addWidget(back)
rootLayout.addWidget(next)
rootLayout.setContentsMargins(10,10,10,10);

win.setCentralWidget(centralWidget);
// make window with a empty border 5px

win.show()

}