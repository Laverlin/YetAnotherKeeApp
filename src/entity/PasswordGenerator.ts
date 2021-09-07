/** Wrapper to limit keyof type options to fields of specified type
 *  E.g. KeysOfType<T, boolean> will return only boolean fields of T
 */
export type KeysOfType<T, U> = {[k in keyof T]: T[k] extends U ? k : never }[keyof T];

/** Class to describe set of source symbols
 *  for password generation
 */
 class PasswordSymbolSet {
  public constructor(init?:Partial<PasswordSymbolSet>) {
    Object.assign(this, init);
  }

  optionId: KeysOfType<PasswordGenerationOptions, boolean> = 'isUpperInclude';
  label: string = '';
  data: string = '';
}

export class PasswordGenerationOptions {
  passwordLength: number = 20;
  customChars: string = '';
  isUpperInclude: boolean = true;
  isLowerInclude: boolean = true;
  isDigitsInclude: boolean = true;
  isSpecialInclude: boolean = true;
  isBracketInclude: boolean = false;
  isQuoteInclude: boolean = false;
}

/** Class for holding generation password methods
 */
export class PasswordGenerator {

  static passwordSource = [
    new PasswordSymbolSet({optionId:'isUpperInclude', label: 'Upper-case (A, B, C, ...)', data:'ABCDEFGHIJKLMNOPQRSTUVWXYZ'}),
    new PasswordSymbolSet({optionId:'isSpecialInclude', label: 'Special symbols (!, @, #, $, %, ...)', data:'!@#$%^&*_+-=,./?;:~\\'}),
    new PasswordSymbolSet({optionId:'isLowerInclude', label: 'Lower-case (a, b, c, ...)', data:'abcdefghijklmnopqrstuvwxyz'}),
    new PasswordSymbolSet({optionId:'isBracketInclude', label: 'Brackets ([, ], {, }, (, ), <, >)', data:'(){}[]<>'}),
    new PasswordSymbolSet({optionId:'isDigitsInclude', label: 'Digits (0, 1, 2, ...)', data:'0123456789'}),
    new PasswordSymbolSet({optionId:'isQuoteInclude', label: 'Quotation (`, \', ", )', data:'\'`"'}),
  ]

  /** Generate new password based on provided options
   *  @see PasswordGenerationOptions
   */
  static generatePassword(options: PasswordGenerationOptions): string {
    let source = this.passwordSource
      .map(i => options[i.optionId] ? i.data : '')
      .concat(options.customChars)
      .join('');

    if (!source)
      return '';

    const randomNumbers = window.crypto.getRandomValues(new Uint8Array(options.passwordLength));
    let generated: string = '';
    randomNumbers.forEach(number => {
      const index = Math.floor(number/(0xFF + 1) * source.length);
      generated = generated.concat(source[index]);
    });
    return generated;
  }
}






