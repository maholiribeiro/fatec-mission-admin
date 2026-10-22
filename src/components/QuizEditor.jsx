import { useState } from 'react';
import {
  ActionIcon,
  Alert,
  Badge,
  Button,
  Card,
  Group,
  List,
  Skeleton,
  Stack,
  Text,
  ThemeIcon,
  Title,
  Tooltip,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { IconAlertTriangle, IconCheck, IconEdit, IconPlus, IconTrash } from '@tabler/icons-react';
import { api } from '../api/client';
import { useFetch } from '../hooks/useFetch';
import PerguntaModal from './PerguntaModal';
import { dec } from '../utils/format';

/** Lista e gerencia as perguntas de um quiz (cadastrar, editar, definir correta, excluir). */
export default function QuizEditor({ missaoId }) {
  const { data, error, loading, reload } = useFetch(() => api.perguntas(missaoId), [missaoId]);
  const [modal, setModal] = useState(null); // null | { pergunta?: objeto }

  function excluir(p, numero) {
    modals.openConfirmModal({
      title: `Excluir pergunta ${numero}`,
      centered: true,
      children: <Text size="sm">Excluir “{p.enunciado}” e suas alternativas?</Text>,
      labels: { confirm: 'Excluir', cancel: 'Cancelar' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          await api.excluirPergunta(p.pergunta_id);
          notifications.show({ color: 'green', message: 'Pergunta excluída.' });
          reload();
        } catch (e) {
          notifications.show({ color: 'red', message: e.message });
        }
      },
    });
  }

  return (
    <Card>
      <Stack gap="md">
        <Group justify="space-between" align="flex-start">
          <div>
            <Title order={4}>Perguntas do quiz</Title>
            {data && (
              <Text size="sm" c="dimmed">
                {data.total_perguntas} pergunta(s)
                {data.total_perguntas > 0 && ` · cada acerto vale ${dec(data.xp_por_pergunta)} XP (de ${data.xp_total})`}
              </Text>
            )}
          </div>
          <Button leftSection={<IconPlus size={16} />} variant="light" onClick={() => setModal({})}>
            Adicionar pergunta
          </Button>
        </Group>

        {error && !data ? (
          <Alert color="red">{error.message}</Alert>
        ) : loading && !data ? (
          <Stack gap="xs">{[1, 2].map((i) => <Skeleton key={i} h={90} />)}</Stack>
        ) : !data.perguntas.length ? (
          <Alert color="yellow" variant="light" icon={<IconAlertTriangle />} title="Este quiz ainda não tem perguntas">
            Enquanto não houver perguntas, os estudantes não conseguem responder o quiz.
          </Alert>
        ) : (
          <Stack gap="sm">
            {data.perguntas.map((p, i) => (
              <Card key={p.pergunta_id} withBorder padding="md" radius="md" bg="var(--mantine-color-default-hover)">
                <Group justify="space-between" align="flex-start" wrap="nowrap">
                  <Stack gap={8} style={{ flex: 1, minWidth: 0 }}>
                    <Group gap="xs" wrap="nowrap" align="flex-start">
                      <Badge variant="filled" size="lg" radius="sm">{i + 1}</Badge>
                      <Text fw={600}>{p.enunciado}</Text>
                    </Group>
                    <List spacing={4} size="sm" center>
                      {p.alternativas.map((a, j) => (
                        <List.Item
                          key={a.alternativa_id}
                          icon={
                            a.correta ? (
                              <ThemeIcon color="green" size={20} radius="xl" aria-label="Alternativa correta">
                                <IconCheck size={13} />
                              </ThemeIcon>
                            ) : (
                              <ThemeIcon color="gray" variant="light" size={20} radius="xl">
                                <Text size="10px" fw={700}>{String.fromCharCode(65 + j)}</Text>
                              </ThemeIcon>
                            )
                          }
                        >
                          <Text size="sm" fw={a.correta ? 700 : 400} c={a.correta ? undefined : 'dimmed'}>
                            {a.texto}
                          </Text>
                        </List.Item>
                      ))}
                    </List>
                  </Stack>
                  <Group gap={4} wrap="nowrap">
                    <Tooltip label="Editar pergunta">
                      <ActionIcon variant="subtle" color="gray" onClick={() => setModal({ pergunta: p })} aria-label={`Editar pergunta ${i + 1}`}>
                        <IconEdit size={18} />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Excluir pergunta">
                      <ActionIcon variant="subtle" color="red" onClick={() => excluir(p, i + 1)} aria-label={`Excluir pergunta ${i + 1}`}>
                        <IconTrash size={18} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                </Group>
              </Card>
            ))}
          </Stack>
        )}
      </Stack>

      <PerguntaModal
        aberto={Boolean(modal)}
        pergunta={modal?.pergunta}
        missaoId={missaoId}
        onClose={() => setModal(null)}
        onSalvo={() => {
          setModal(null);
          reload();
        }}
      />
    </Card>
  );
}
