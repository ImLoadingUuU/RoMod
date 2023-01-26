import { mergeDirs } from '@nooooooom/merge-dirs';
import fs from "fs";
import {
  QPixmap,
  ButtonRole,
  QMessageBox,
  QProgressBar,
  QButtonGroup,
  QFont,
  QListWidgetItem,
  QListWidget,
  QMainWindow,
  QWidget,
  QLabel,
  FlexLayout,
  QPushButton,
  QIcon,
  QLineEdit,
  QTextEdit,
} from "@nodegui/nodegui";
import { SingleEntryPlugin } from "webpack";
function error(message:string){
  const messageBox = new QMessageBox();
  messageBox.setText(message);
  const accept = new QPushButton();
  accept.setText('Okay');
  messageBox.addButton(accept, ButtonRole.AcceptRole);
  messageBox.exec();
}

const getFileList:Function = (dirName:string) => {
  let files:any = [];
  const items =fs.readdirSync(dirName, { withFileTypes: true });

  for (const item of items) {
      if (item.isDirectory()) {
          files = [...files, ...getFileList(`${dirName}/${item.name}`)];
      } else {
          files.push(`${dirName}/${item.name}`);
      }
  }

  return files;
};
const robloxPath = {
  mac: `/Applications/Roblox.app/Contents/Resources`,
  windows: `${process.env.HOME}/AppData/Local/Roblox`,
};
let path = robloxPath.mac;
module.exports = (folder: string) => {
  if (process.platform === "win32") {
    path = robloxPath.windows;
  }
  // read all files


  console.log("Roblox File Found")
  // write gui
  const win = new QMainWindow();
  win.setMaximumSize(350, 350);
  win.setMinimumSize(350, 350);
  win.setWindowTitle("RoMod - Installer");
  const centralWidget = new QWidget();
  centralWidget.setObjectName("myroot");
  const rootLayout = new FlexLayout();
  centralWidget.setLayout(rootLayout);
  const label = new QLabel();
  label.setText("Installing...");
  label.setFont(new QFont("", 20));
  
  const PB = new QProgressBar();
  PB.setRange(0,100)
  
 console.log("UI")
  win.setCentralWidget(centralWidget);
  centralWidget.setLayout(rootLayout)
  rootLayout.addWidget(label)
  rootLayout.addWidget(PB)
  win.show()
 try {
  let modDir = folder
  if (!fs.existsSync(folder + "/Content") && !fs.existsSync(folder + "/PlatformContent") && !fs.existsSync(folder + "/Pc") && !fs.existsSync(folder + "/pc")){
    error("Content folder not found!")
    win.close()
    return
  }
  if (fs.existsSync(folder + "/Pc")) {
    modDir = folder + "/Pc"
  } else if (fs.existsSync(folder + "/pc")){
    modDir = folder + "/pc"
  }
  mergeDirs({
    dest: path,
    paths: [modDir],
  });
 } catch(err) {
  console.log(err)
 
  win.setWindowTitle("Failed to apply mod.")
 }
 PB.setValue(100)
  win.setWindowTitle("Mod Applied!")
  setTimeout(() => {
    win.close()
  },1000)



};
