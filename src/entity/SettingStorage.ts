import fs from 'fs'
import path from 'path'
import electron from 'electron'


export class Setting {

  #filePath: string = ''

  static load<T extends Setting>(settingType: new() => T): T {
    let setting = new settingType();
    const userDataPath = (electron.app || electron.remote.app).getPath('userData');
    setting.#filePath = path.join(userDataPath, settingType.name + '.json');
    try {
      return Object.assign(setting, JSON.parse(fs.readFileSync(setting.#filePath, 'utf-8')));
    }
    catch {
      return setting;
    }
  }

  save() {
    fs.writeFileSync(this.#filePath, JSON.stringify(this));
  }
}

export class AppSetting extends Setting {

  windowSize = {
    width: 1350,
    height: 800
  }
}

export class UserSetting extends Setting {

  recentFiles: string[] = [];
}



