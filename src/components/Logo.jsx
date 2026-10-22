import { Group, Text } from '@mantine/core';

/** Símbolo da marca (mira + bandeira + caminho) — mesma arte do app mobile. */
export function LogoIcon({ size = 32, color = '#B63A45' }) {
  const arco = (a1, a2) => {
    const p = (a) => {
      const r = ((a - 90) * Math.PI) / 180;
      return `${50 + 34 * Math.cos(r)} ${50 + 34 * Math.sin(r)}`;
    };
    return `M${p(a1)}A34 34 0 0 1 ${p(a2)}`;
  };
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true">
      <g fill="none" stroke={color} strokeWidth="7">
        {[0, 90, 180, 270].map((a) => (
          <path key={a} d={arco(a + 12, a + 78)} />
        ))}
      </g>
      <g stroke={color} strokeWidth="3.5">
        <path d="M50 8v12M50 80v12M8 50h12M80 50h12M50 60V26" />
      </g>
      <path fill={color} d="M50 25l17 4-6 5 6 5-17 2z" />
      <path fill={color} d="M22 84l16-13-5-3 17-9 7 3-14 7 5 4-21 14z" />
    </svg>
  );
}

export default function Logo({ subtitle = 'Administração' }) {
  return (
    <Group gap={10} wrap="nowrap">
      <LogoIcon size={34} />
      <div style={{ lineHeight: 1.1 }}>
        <Text fw={800} size="md" style={{ letterSpacing: '0.04em' }}>
          FATEC <Text span inherit c="brand">MISSION</Text>
        </Text>
        <Text size="xs" c="dimmed">{subtitle}</Text>
      </div>
    </Group>
  );
}
