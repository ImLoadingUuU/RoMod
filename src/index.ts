import {QMessageBox,ButtonRole,QButtonGroup,QFont,QListWidgetItem, QListWidget,QMainWindow, QWidget, QLabel, FlexLayout, QPushButton, QIcon } from '@nodegui/nodegui';


let modPacks:Array<{
  name: string,
  enabled: boolean,
  noInstall: boolean
}> = []
function error(message:string){
  const messageBox = new QMessageBox();
  messageBox.setText(message);
  const accept = new QPushButton();
  accept.addEventListener("clicked",() => {
    process.exit(0)
  })
  accept.setText('Close App');
  messageBox.addButton(accept, ButtonRole.AcceptRole);
  messageBox.exec();
}
const win = new QMainWindow();
win.setMaximumSize(350, 600);
win.setMinimumSize(350, 600);
import fs from "fs"
// create directory using fs in document called RoMod
if (!fs.existsSync(`${process.env.HOME}/RoModAssets`)){
 fs.mkdir(`${process.env.HOME}/RoModAssets`, (err) => {
 if(err){
  console.log(err)
  const messageBox = new QMessageBox();
  messageBox.setText("Error! RoMod Directory could not be created!");
  const accept = new QPushButton();
  accept.addEventListener("clicked",() => {
    process.exit(0)
  })
  accept.setText('Restart Applicationn');
  messageBox.addButton(accept, ButtonRole.AcceptRole);
  messageBox.exec();
 }
 })
 fs.mkdir(`${process.env.HOME}/RoModAssets/Temp`,(err) => {
    
 })
 fs.mkdir(`${process.env.HOME}/RoModAssets/Mods`,(err) => {
    
 })
 fs.mkdir(`${process.env.HOME}/RoModAssets/Recovery`,(err) => {
    
 })
}
const dir = `${process.env.HOME}/RoModAssets/`

win.setWindowTitle("RoMod");

const centralWidget = new QWidget();
centralWidget.setObjectName("myroot");
const rootLayout = new FlexLayout();
centralWidget.setLayout(rootLayout);

const label = new QLabel();
label.setObjectName("Title");
label.setText("Welcome to RoMod");

const warning = new QLabel();
warning.setObjectName("Warn");
warning.setText("We dont recommended enable 2 mod. The Texture Might be broken.");
warning.setFont(new QFont("System Font", 10));


const directory = new QPushButton();
directory.setText("Open Mod Pack Directory")
const store = new QPushButton();
store.setText("RoMod Store")
store.addEventListener("clicked", () => {
 require("./library")()
})


const applybutton = new QPushButton();
applybutton.setText("Apply Mod (Please Backup folder)")
applybutton.addEventListener("clicked", () => {
  
  for (let i =0; i< modPacks.length; i++) {
    if(modPacks[i].enabled){
      require("./applyer")(`${dir}/Mods/${modPacks[i].name}`)
    };
  
  }
})
const label2 = new QLabel();
label2.setText("Mod Pack Installed");
label2.setFont(new QFont("System Font", 20));
const list = new QListWidget();
function reload(){
  
  list.clear()
  if (modPacks.length == 0){
    label2.setText("No Mod Packs Installed");
  } else {
    for (let i = 0; i < modPacks.length; i++) {
      console.log(modPacks[i])
      const item = new QListWidgetItem();
      const itemname = modPacks[i].name
      if (modPacks[i].enabled == true){
        item.setText(`${itemname} (Enabled)`);
        list.addItem(item);
      } else {
        item.setText(`${itemname} (Disabled)`);
        list.addItem(item);
      }
    }
  }
}
list.addEventListener("itemActivated",(item) => {
  let index = list.currentIndex().row()
  modPacks[index].enabled = !modPacks[index].enabled
  reload()

})
function reloadFiles(){
  fs.readdir(`${dir}/Mods`,(err,files) => {
    if(err){
       error("Failed to load mods")
       console.log(err)
       return
    }
    files.forEach((file) => {
      console.log(file)
     if ( fs.lstatSync(`${dir}/Mods/${file}`).isFile() ) {
     return
     }
      modPacks.push({
        name: file,
        enabled: false,
        noInstall: false
      })
      reload()
      console.log("Pushed")
    })
  })
}
reloadFiles()



rootLayout.addWidget(label);
rootLayout.addWidget(label2);
rootLayout.addWidget(warning);
rootLayout.addWidget(list);
rootLayout.addWidget(directory);
rootLayout.addWidget(store);
rootLayout.addWidget(applybutton);
win.setCentralWidget(centralWidget);


win.show();

(global as any).win = win;

