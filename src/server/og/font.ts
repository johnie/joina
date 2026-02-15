const FONT_URL_REGEX = /src: url\((.+)\) format\('(opentype|truetype)'\)/;

export async function loadGoogleFontCustom(
  family: string,
  weight: number,
  italic: boolean
): Promise<ArrayBuffer> {
  const ital = italic ? 1 : 0;
  const cssUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:ital,wght@${ital},${weight}`;

  // Use old Safari UA to get TTF/OTF instead of WOFF2 (satori doesn't support WOFF2)
  const cssResponse = await fetch(cssUrl, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; de-at) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1',
    },
  });

  const css = await cssResponse.text();
  const match = css.match(FONT_URL_REGEX);

  if (!match?.[1]) {
    throw new Error(`Failed to extract font URL for ${family} ${weight}`);
  }

  const fontResponse = await fetch(match[1]);
  return fontResponse.arrayBuffer();
}
