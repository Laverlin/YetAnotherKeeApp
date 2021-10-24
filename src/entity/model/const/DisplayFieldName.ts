const fields: Map<string, string> = new Map([
  ['UserName', 'User Name'],
  ['Password', 'Password'],
  ['URL', 'URL']
]);

export const displayFieldName = (fieldName: string) => {
  return fields.has(fieldName) ? fields.get(fieldName) : fieldName;
}
