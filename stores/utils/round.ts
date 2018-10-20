function round(precision: number = 1) {
  const divisor = 1 / precision;

  return (value: number) => Math.round(value * divisor) / divisor;
}

export default round;
