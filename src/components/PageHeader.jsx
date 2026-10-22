import { Group, Stack, Text, Title } from '@mantine/core';

export default function PageHeader({ title, description, actions, above }) {
  return (
    <Group justify="space-between" align="flex-end" mb="xl" wrap="wrap" gap="md">
      <Stack gap={4}>
        {above}
        <Title order={2}>{title}</Title>
        {description && <Text c="dimmed">{description}</Text>}
      </Stack>
      {actions && <Group gap="sm">{actions}</Group>}
    </Group>
  );
}
