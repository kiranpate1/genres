export function positionScore(position: number): number {
  if (position === 1) {
    return 7.5;
  } else if (position === 2) {
    return 6;
  } else if (position === 3) {
    return 4.95;
  } else if (position === 4) {
    return 4.35;
  } else if (position === 5) {
    return 3.9;
  } else if (position === 6) {
    return 3.6;
  } else if (position === 7) {
    return 3.45;
  } else if (position === 8) {
    return 3.3;
  } else if (position === 9) {
    return 3.15;
  } else if (position === 10) {
    return 3;
  }
  return 0; // default fallback
}

export function multiplier(year: string): number {
  if (year >= "1980" && year <= "1984") {
    return 1.6;
  } else if (year >= "1985" && year <= "1991") {
    return 2;
  } else if (year >= "1992" && year <= "2011") {
    return 1;
  } else if (year >= "2012" && year <= "2013") {
    return 0.9;
  } else if (year >= "2014" && year <= "2016") {
    return 0.85;
  } else if (year >= "2017" && year <= "2018") {
    return 0.8;
  } else if (year >= "2019" && year <= "2020") {
    return 0.75;
  } else if (year >= "2021" && year <= "2024") {
    return 0.65;
  } else if (year >= "2025") {
    return 0.5;
  }
  return 1; // default fallback
}

export const MONTHS = [
  { name: "Jan", days: 31 },
  { name: "Feb", days: 28 },
  { name: "Mar", days: 31 },
  { name: "Apr", days: 30 },
  { name: "May", days: 31 },
  { name: "Jun", days: 30 },
  { name: "Jul", days: 31 },
  { name: "Aug", days: 31 },
  { name: "Sep", days: 30 },
  { name: "Oct", days: 31 },
  { name: "Nov", days: 30 },
  { name: "Dec", days: 31 },
];
