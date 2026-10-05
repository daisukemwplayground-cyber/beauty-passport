export function formatPriceRange(min, max) {
  return `${formatNumber(min)} - ${formatNumber(max)}`;
}

export function formatNumber(n) {
  return new Intl.NumberFormat("en-US").format(n);
}

// VND を「K」(千)単位で短く表記する。例: 350000 → "350K", 1500000 → "1,500K", 125000 → "125K"
export function formatVndK(n) {
  return `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(n / 1000)}K`;
}

export function formatVndRangeK(min, max) {
  return min === max ? formatVndK(min) : `${formatVndK(min)} - ${formatVndK(max)}`;
}

// VND を円に換算して10円単位に丸めた数値表記にする。例: (350000, 0.00609) → "2,130"
export function formatJpyFromVnd(vnd, jpyPerVnd) {
  return formatNumber(Math.round((vnd * jpyPerVnd) / 10) * 10);
}

export function formatJpyRangeFromVnd(min, max, jpyPerVnd) {
  return min === max
    ? formatJpyFromVnd(min, jpyPerVnd)
    : `${formatJpyFromVnd(min, jpyPerVnd)} - ${formatJpyFromVnd(max, jpyPerVnd)}`;
}
