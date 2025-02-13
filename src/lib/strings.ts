export const truncate = (str: string, length: number = 56) =>
  str.length > length ? `${str.substring(0, length)}...` : str;

export const createLabelSelector = (matchLabels?: Record<string, string>) => {
  return matchLabels
    ? Object.entries(matchLabels)
        .map(([k, v]) => `${k}=${v}`)
        .join(',')
    : '';
};
