export const formatApr = (_apr?: string) => {
  if (!_apr) {
    return "N/A";
  }
  try {
    const apr = Number(_apr);
    if (Number.isNaN(apr)) {
      return "N/A";
    }
    if (apr <= 0) {
      return "N/A";
    }
    return `${apr}%`;
  } catch (error) {
    return "N/A";
  }
};
