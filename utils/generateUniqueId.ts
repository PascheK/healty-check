// utils/generateUniqueId.ts

export const generateUniqueId = (): string => {
  const timestamp = Date.now().toString(36); // base 36 pour raccourcir
  const randomPart = Math.random().toString(36).substring(2, 8); // 6 caractères aléatoires
  return `anon-${timestamp}-${randomPart}`; // exemple : anon-k4lzv8-p5q7r9
};
