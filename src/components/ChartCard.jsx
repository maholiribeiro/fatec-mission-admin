import { useState } from 'react';
import { Card, Group, SegmentedControl, Stack, Text, Title } from '@mantine/core';
import { IconChartBar, IconTable } from '@tabler/icons-react';

/**
 * Moldura de gráfico com alternância Gráfico/Tabela — a tabela é a visão acessível
 * dos mesmos dados (leitores de tela, impressão, valores exatos).
 */
export default function ChartCard({ title, description, controls, chart, table }) {
  const [visao, setVisao] = useState('grafico');
  return (
    <Card>
      <Stack gap="md">
        <Group justify="space-between" align="flex-start" wrap="wrap" gap="sm">
          <div>
            <Title order={4}>{title}</Title>
            {description && <Text size="sm" c="dimmed">{description}</Text>}
          </div>
          <Group gap="sm">
            {controls}
            <SegmentedControl
              size="xs"
              value={visao}
              onChange={setVisao}
              aria-label="Modo de visualização"
              data={[
                { value: 'grafico', label: <Group gap={4} wrap="nowrap"><IconChartBar size={14} />Gráfico</Group> },
                { value: 'tabela', label: <Group gap={4} wrap="nowrap"><IconTable size={14} />Tabela</Group> },
              ]}
            />
          </Group>
        </Group>
        {visao === 'grafico' ? chart : table}
      </Stack>
    </Card>
  );
}
