export const generateNanoId = async (size: number = 10): Promise<string> => {
  const { nanoid } = await import("nanoid");
  return nanoid(size);
};
