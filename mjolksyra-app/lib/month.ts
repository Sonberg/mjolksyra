type Month = {
  year: number;
  month: number;
};

export function incrementMonth({ month, year }: Month) {
  return {
    year: month === 11 ? year + 1 : year,
    month: month === 11 ? 0 : month + 1,
  };
}

export function decrementMonth({ month, year }: Month) {
  return {
    year: month === 0 ? year - 1 : year,
    month: month === 0 ? 11 : month - 1,
  };
}
