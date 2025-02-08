export const truncate = (str: string, length: number = 56) =>
  str.length > length ? `${str.substring(0, length)}...` : str;
