import { Card, Group, Progress, Stack, Text, ThemeIcon, Tooltip } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';

/** Cartão de indicador: rótulo, número em destaque, contexto e (opcional) barra de progresso. */
export default function StatCard({ icon: Icon, label, value, hint, info, progress }) {
  return (
    <Card>
      <Stack gap={6}>
        <Group justify="space-between" wrap="nowrap" align="flex-start">
          <Group gap={6} wrap="nowrap">
            <Text size="sm" c="dimmed" fw={600}>{label}</Text>
            {info && (
              <Tooltip label={info} multiline w={260}>
                <IconInfoCircle size={15} style={{ color: 'var(--mantine-color-dimmed)' }} aria-label={info} />
              </Tooltip>
            )}
          </Group>
          <ThemeIcon variant="light" size={36} radius="md">
            <Icon size={20} stroke={1.7} />
          </ThemeIcon>
        </Group>
        <Text fz={32} fw={800} lh={1.1}>{value}</Text>
        {progress !== undefined && <Progress value={progress} size="sm" radius="xl" aria-label={label} />}
        {hint && <Text size="sm" c="dimmed">{hint}</Text>}
      </Stack>
    </Card>
  );
}
