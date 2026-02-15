/** @jsxImportSource . */

interface OgTemplateData {
  title: string;
  summary: string;
  type: string;
  location: string;
  percentage: string;
  hours: string;
}

const svgProps = {
  xmlns: 'http://www.w3.org/2000/svg',
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: '#d97706',
  'stroke-width': 2,
  'stroke-linecap': 'round' as const,
  'stroke-linejoin': 'round' as const,
};

function BriefcaseIcon() {
  return (
    <svg {...svgProps} aria-label="Briefcase" role="img">
      <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      <rect height={14} rx={2} width={20} x={2} y={6} />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg {...svgProps} aria-label="Calendar" role="img">
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect height={18} rx={2} width={18} x={3} y={4} />
      <path d="M3 10h18" />
    </svg>
  );
}

export function renderOgTemplate(data: OgTemplateData): JSX.Element {
  const summary =
    data.summary.length > 120
      ? `${data.summary.slice(0, 117)}...`
      : data.summary;
  const meta = [data.type, data.location].filter(Boolean).join(' \u00B7 ');
  const titleFontSize = data.title.length > 60 ? 44 : 56;

  return (
    <div
      style={{
        display: 'flex',
        position: 'relative',
        width: 1200,
        height: 630,
        fontFamily: 'Playfair Display',
      }}
    >
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: '#0c0a09',
        }}
      />
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background:
            'radial-gradient(ellipse 60% 30% at 50% 100%, rgba(217,119,6,0.15), transparent 60%)',
        }}
      />

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          padding: '60px 80px',
          position: 'relative',
          gap: 24,
        }}
      >
        <div
          style={{
            display: 'flex',
            fontSize: 24,
            fontStyle: 'italic',
            color: '#fbbf24',
            textAlign: 'center',
          }}
        >
          {meta}
        </div>

        <div
          style={{
            display: 'flex',
            fontSize: titleFontSize,
            fontWeight: 700,
            fontStyle: 'italic',
            color: '#f59e0b',
            textAlign: 'center',
            lineHeight: 1.2,
            maxWidth: 1000,
          }}
        >
          {data.title}
        </div>

        <div
          style={{
            display: 'flex',
            fontSize: 22,
            color: '#b45309',
            textAlign: 'center',
            maxWidth: 900,
            lineHeight: 1.5,
          }}
        >
          {summary}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 32,
            marginTop: 8,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 20,
              color: '#d97706',
            }}
          >
            <BriefcaseIcon />
            <span>{data.percentage}</span>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 20,
              color: '#d97706',
            }}
          >
            <CalendarIcon />
            <span>{data.hours}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
