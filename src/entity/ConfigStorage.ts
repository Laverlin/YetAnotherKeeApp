import fs from 'fs'
import path from 'path'
import electron from 'electron'

export class SettingStorage<T extends Setting> {
  #defaults: T;
  #filePath: string;
  constructor(settingsType: new() => T) {
    const userDataPath = (electron.app || electron.remote.app).getPath('userData');
    this.#filePath = path.join(userDataPath, settingsType.name + '.json');
    this.#defaults = new settingsType();
  }

  loadSettings(): T {
    return this.parseDataFile();
  }

  saveSettings(settings: T): void {
    fs.writeFileSync(this.#filePath, JSON.stringify(settings));
  }

  private parseDataFile(): T {
    try {
      return JSON.parse(fs.readFileSync(this.#filePath, 'utf-8'));
    } catch(error) {
      // if there was some kind of error, return the passed in defaults instead.
      return this.#defaults;
    }
  }
}

export class Setting {

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

