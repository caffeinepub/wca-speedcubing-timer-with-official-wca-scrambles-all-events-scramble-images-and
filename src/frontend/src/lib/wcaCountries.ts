export function getCountryName(countryCode: string): string {
  try {
    const displayNames = new Intl.DisplayNames(['en'], { type: 'region' });
    return displayNames.of(countryCode) || countryCode;
  } catch {
    return countryCode;
  }
}

export function getUniqueCountries(competitions: Array<{ country_iso2: string }>): Array<{ code: string; name: string }> {
  const countryMap = new Map<string, string>();
  
  competitions.forEach(comp => {
    if (comp.country_iso2 && !countryMap.has(comp.country_iso2)) {
      countryMap.set(comp.country_iso2, getCountryName(comp.country_iso2));
    }
  });
  
  return Array.from(countryMap.entries())
    .map(([code, name]) => ({ code, name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
