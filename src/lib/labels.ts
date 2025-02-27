export const labelSelectorToArray = (selector: string) =>
  selector.split(',').filter(Boolean);

export const arrayToLabelSelector = (array: string[]) =>
  array.join(',');