export const PrismaClient = function () {
  return {
    $connect: async () => {},
    $disconnect: async () => {},
    // add minimal methods used by tests if known
  };
};