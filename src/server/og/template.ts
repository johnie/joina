interface OgTemplateData {
  title: string;
  type: string;
  location: string;
  percentage: string;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function renderOgTemplate(data: OgTemplateData): string {
  const title = escapeHtml(data.title);
  const meta = [data.type, data.location, data.percentage]
    .filter(Boolean)
    .map(escapeHtml)
    .join(' · ');

  return `
    <div style="display: flex; flex-direction: column; justify-content: space-between; width: 100vw; height: 100vh; padding: 60px; background: #1c1917; font-family: 'Geist Mono';">
      <div style="display: flex; flex-direction: column; gap: 24px;">
        <div style="display: flex; font-size: 48px; font-weight: 700; color: #fafaf9; line-height: 1.2; max-width: 1000px;">${title}</div>
        <div style="display: flex; font-size: 24px; color: #a8a29e;">${meta}</div>
      </div>
      <div style="display: flex; justify-content: space-between; align-items: flex-end;">
        <div style="display: flex; font-size: 28px; color: #d97706; font-weight: 600;">joina.johnie.se</div>
        <div style="display: flex; font-size: 36px;">💪</div>
      </div>
    </div>
  `;
}
