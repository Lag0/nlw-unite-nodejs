const { nanoid } = require("nanoid");

export const generateNanoId = (size: number = 10): string => {
  return nanoid(size);
};
