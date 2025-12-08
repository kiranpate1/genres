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
