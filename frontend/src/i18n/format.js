export function formatPriceRange(min, max) {
  return `${formatNumber(min)} - ${formatNumber(max)}`;
}

export function formatNumber(n) {
  return new Intl.NumberFormat("en-US").format(n);
}
