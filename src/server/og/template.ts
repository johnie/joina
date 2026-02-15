interface OgTemplateData {
  title: string;
  summary: string;
  type: string;
  location: string;
  percentage: string;
  hours: string;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const briefcaseIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="14" x="2" y="6" rx="2"/></svg>`;

const calendarIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>`;

export function renderOgTemplate(data: OgTemplateData): string {
  const title = escapeHtml(data.title);
  const summary = escapeHtml(
    data.summary.length > 120
      ? `${data.summary.slice(0, 117)}...`
      : data.summary
  );
  const meta = [data.type, data.location]
    .filter(Boolean)
    .map(escapeHtml)
    .join(' \u00B7 ');
  const titleFontSize = data.title.length > 60 ? 44 : 56;

  return `
    <div style="display: flex; position: relative; width: 1200px; height: 630px; font-family: 'Playfair Display';">
      <!-- Base background -->
      <div style="display: flex; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: #0c0a09;"></div>
      <!-- Bottom glow -->
      <div style="display: flex; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: radial-gradient(ellipse 60% 30% at 50% 100%, rgba(217,119,6,0.15), transparent 60%);"></div>

      <!-- Content -->
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; padding: 60px 80px; position: relative; gap: 24px;">
        <!-- Meta line -->
        <div style="display: flex; font-size: 24px; font-style: italic; color: #fbbf24; text-align: center;">${meta}</div>

        <!-- Title -->
        <div style="display: flex; font-size: ${titleFontSize}px; font-weight: 700; font-style: italic; color: #f59e0b; text-align: center; line-height: 1.2; max-width: 1000px;">${title}</div>

        <!-- Summary -->
        <div style="display: flex; font-size: 22px; color: #b45309; text-align: center; max-width: 900px; line-height: 1.5;">${summary}</div>

        <!-- Badges -->
        <div style="display: flex; align-items: center; gap: 32px; margin-top: 8px;">
          <div style="display: flex; align-items: center; gap: 8px; font-size: 20px; color: #d97706;">
            ${briefcaseIcon}
            <span>${escapeHtml(data.percentage)}</span>
          </div>
          <div style="display: flex; align-items: center; gap: 8px; font-size: 20px; color: #d97706;">
            ${calendarIcon}
            <span>${escapeHtml(data.hours)}</span>
          </div>
        </div>
      </div>
    </div>
  `;
}
