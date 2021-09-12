import fs from 'fs'
import path from 'path'
import electron from 'electron'

/**
 * Base object to manipulate with application settings
 */
export class Setting {

  #filePath: string | undefined

  /** load setting data from file and return new entity of settings object
   * if file not found then defauld objec returns
   * @param settingType setting type object, must be derived from Setting
   */
  static load<T extends Setting>(settingType: new() => T): T {
    let setting = new settingType();
    const userDataPath = (electron.app || electron.remote.app).getPath('userData');
    setting.#filePath = path.join(userDataPath, settingType.name + '.json');
    return fs.existsSync(setting.#filePath)
      ? Object.assign(setting, JSON.parse(fs.readFileSync(setting.#filePath, 'utf-8')))
      : setting;
  }

  /** save setting data to file
   */
  save() {
    if (!this.#filePath)
      throw 'file path must be initialised, call load before save'

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



