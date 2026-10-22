import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ActionIcon,
  Alert,
  Badge,
  Button,
  Card,
  Center,
  Group,
  Menu,
  SegmentedControl,
  Select,
  Skeleton,
  Stack,
  Switch,
  Table,
  Text,
  TextInput,
  Tooltip,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import {
  IconAlertCircle,
  IconAlertTriangle,
  IconDots,
  IconEdit,
  IconListCheck,
  IconPlus,
  IconQrcode,
  IconSearch,
  IconTarget,
  IconTrash,
} from '@tabler/icons-react';
import { api } from '../api/client';
import { useFetch } from '../hooks/useFetch';
import PageHeader from '../components/PageHeader';
import { TIPOS, num, rotuloTipo } from '../utils/format';

const COR_DIFICULDADE = { 'Fácil': 'gray', 'Médio': 'yellow', 'Difícil': 'brand' };

export default function Missoes() {
  const navigate = useNavigate();
  const { data, error, loading, reload, setData } = useFetch(() => api.missoes(), []);
  const [status, setStatus] = useState('todas');
  const [busca, setBusca] = useState('');
  const [tipo, setTipo] = useState(null);
  const [alterando, setAlterando] = useState(null);

  const contagem = useMemo(() => {
    const l = data || [];
    return { todas: l.length, ativa: l.filter((m) => m.status === 'ativa').length, inativa: l.filter((m) => m.status === 'inativa').length };
  }, [data]);

  const lista = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return (data || []).filter(
      (m) =>
        (status === 'todas' || m.status === status) &&
        (!tipo || m.tipo === tipo) &&
        (!termo || m.titulo.toLowerCase().includes(termo) || (m.qr_code || '').toLowerCase().includes(termo))
    );
  }, [data, status, tipo, busca]);

  const substituir = (missao) => setData((l) => l.map((x) => (x.missao_id === missao.missao_id ? { ...x, ...missao } : x)));

  async function alternarStatus(m) {
    const novo = m.status === 'ativa' ? 'inativa' : 'ativa';
    setAlterando(m.missao_id);
    substituir({ ...m, status: novo }); // otimista
    try {
      await api.alterarStatus(m.missao_id, novo);
      notifications.show({ color: 'green', message: `“${m.titulo}” ${novo === 'ativa' ? 'ativada' : 'desativada'}.` });
    } catch (e) {
      substituir(m);
      notifications.show({ color: 'red', title: 'Não foi possível alterar o status', message: e.message });
    } finally {
      setAlterando(null);
    }
  }

  function confirmarExclusao(m) {
    modals.openConfirmModal({
      title: 'Excluir missão',
      centered: true,
      children: (
        <Text size="sm">
          Tem certeza que deseja excluir <b>“{m.titulo}”</b>?
          {m.quiz && m.total_perguntas > 0 && ` As ${m.total_perguntas} perguntas do quiz também serão excluídas.`} Esta ação não
          pode ser desfeita.
        </Text>
      ),
      labels: { confirm: 'Excluir missão', cancel: 'Cancelar' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          await api.excluirMissao(m.missao_id);
          setData((l) => l.filter((x) => x.missao_id !== m.missao_id));
          notifications.show({ color: 'green', message: `“${m.titulo}” foi excluída.` });
        } catch (e) {
          notifications.show({ color: 'red', title: 'Não foi possível excluir', message: e.message, autoClose: 8000 });
        }
      },
    });
  }

  return (
    <>
      <PageHeader
        title="Missões"
        description="Todas as missões cadastradas na plataforma."
        actions={
          <Button component={Link} to="/missoes/nova" leftSection={<IconPlus size={16} />}>
            Nova missão
          </Button>
        }
      />

      <Card p={0}>
        <Group p="md" gap="sm" justify="space-between" wrap="wrap">
          <SegmentedControl
            value={status}
            onChange={setStatus}
            aria-label="Filtrar por status"
            data={[
              { value: 'todas', label: `Todas (${contagem.todas})` },
              { value: 'ativa', label: `Ativas (${contagem.ativa})` },
              { value: 'inativa', label: `Inativas (${contagem.inativa})` },
            ]}
          />
          <Group gap="sm">
            <Select
              placeholder="Todos os tipos"
              data={TIPOS.map((t) => ({ value: t, label: rotuloTipo(t) }))}
              value={tipo}
              onChange={setTipo}
              clearable
              w={180}
              aria-label="Filtrar por tipo"
            />
            <TextInput
              placeholder="Buscar por título ou QR Code"
              leftSection={<IconSearch size={16} />}
              value={busca}
              onChange={(e) => setBusca(e.currentTarget.value)}
              w={280}
              aria-label="Buscar missões"
            />
          </Group>
        </Group>

        {error && !data ? (
          <Alert m="md" color="red" icon={<IconAlertCircle />} title="Não foi possível carregar as missões">
            {error.message}{' '}
            <Button size="xs" variant="white" color="red" onClick={reload}>Tentar de novo</Button>
          </Alert>
        ) : loading && !data ? (
          <Stack p="md" gap="xs">
            {Array.from({ length: 6 }, (_, i) => <Skeleton key={i} h={44} />)}
          </Stack>
        ) : !lista.length ? (
          <Center py={64}>
            <Stack align="center" gap="xs">
              <IconTarget size={40} stroke={1.3} color="var(--mantine-color-dimmed)" />
              <Text fw={600}>{data.length ? 'Nenhuma missão encontrada' : 'Nenhuma missão cadastrada'}</Text>
              <Text size="sm" c="dimmed">
                {data.length ? 'Ajuste os filtros ou a busca.' : 'Crie a primeira missão para os estudantes.'}
              </Text>
              {!data.length && (
                <Button mt="xs" component={Link} to="/missoes/nova" leftSection={<IconPlus size={16} />}>
                  Nova missão
                </Button>
              )}
            </Stack>
          </Center>
        ) : (
          <Table.ScrollContainer minWidth={900}>
            <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Missão</Table.Th>
                  <Table.Th>Tipo</Table.Th>
                  <Table.Th>Dificuldade</Table.Th>
                  <Table.Th ta="right">XP</Table.Th>
                  <Table.Th ta="right">Conclusões</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th w={90} ta="right">Ações</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {lista.map((m) => {
                  const podeExcluir = m.total_tentativas === 0;
                  const quizVazio = m.quiz && m.total_perguntas === 0;
                  return (
                    <Table.Tr key={m.missao_id} className="row-clickable" onClick={() => navigate(`/missoes/${m.missao_id}`)}>
                      <Table.Td>
                        <Text fw={600} c={m.status === 'inativa' ? 'dimmed' : undefined}>{m.titulo}</Text>
                        <Group gap={6} mt={4}>
                          {m.quiz && (
                            <Badge size="sm" variant="light" leftSection={<IconListCheck size={12} />}>
                              Quiz · {m.total_perguntas} pergunta(s)
                            </Badge>
                          )}
                          {m.qr_code && (
                            <Badge size="sm" variant="default" leftSection={<IconQrcode size={12} />} tt="none">
                              {m.qr_code}
                            </Badge>
                          )}
                          {quizVazio && (
                            <Tooltip label="Quizzes sem perguntas não podem ser respondidos pelos estudantes.">
                              <Badge size="sm" color="yellow" variant="light" leftSection={<IconAlertTriangle size={12} />}>
                                Sem perguntas
                              </Badge>
                            </Tooltip>
                          )}
                        </Group>
                      </Table.Td>
                      <Table.Td>{m.tipo}</Table.Td>
                      <Table.Td>
                        <Badge variant="light" color={COR_DIFICULDADE[m.dificuldade]}>{m.dificuldade}</Badge>
                      </Table.Td>
                      <Table.Td ta="right" fw={600}>+{m.xp}</Table.Td>
                      <Table.Td ta="right">
                        <Text fw={600} span>{num(m.total_conclusoes)}</Text>
                        <Text size="xs" c="dimmed">{num(m.total_tentativas)} tentativas</Text>
                      </Table.Td>
                      <Table.Td onClick={(e) => e.stopPropagation()}>
                        <Switch
                          checked={m.status === 'ativa'}
                          onChange={() => alternarStatus(m)}
                          disabled={alterando === m.missao_id}
                          label={m.status === 'ativa' ? 'Ativa' : 'Inativa'}
                          aria-label={`${m.status === 'ativa' ? 'Desativar' : 'Ativar'} ${m.titulo}`}
                        />
                      </Table.Td>
                      <Table.Td onClick={(e) => e.stopPropagation()}>
                        <Group gap={4} justify="flex-end" wrap="nowrap">
                          <Tooltip label="Editar">
                            <ActionIcon variant="subtle" color="gray" component={Link} to={`/missoes/${m.missao_id}`} aria-label={`Editar ${m.titulo}`}>
                              <IconEdit size={18} />
                            </ActionIcon>
                          </Tooltip>
                          <Menu position="bottom-end" withinPortal>
                            <Menu.Target>
                              <ActionIcon variant="subtle" color="gray" aria-label={`Mais ações para ${m.titulo}`}>
                                <IconDots size={18} />
                              </ActionIcon>
                            </Menu.Target>
                            <Menu.Dropdown>
                              <Menu.Item onClick={() => alternarStatus(m)}>
                                {m.status === 'ativa' ? 'Desativar' : 'Ativar'}
                              </Menu.Item>
                              <Menu.Divider />
                              <Tooltip
                                label="Missões com tentativas não podem ser excluídas (o XP dos estudantes depende delas). Desative-a."
                                multiline
                                w={260}
                                disabled={podeExcluir}
                                position="left"
                              >
                                <div>
                                  <Menu.Item
                                    color="red"
                                    leftSection={<IconTrash size={16} />}
                                    disabled={!podeExcluir}
                                    onClick={() => confirmarExclusao(m)}
                                  >
                                    Excluir
                                  </Menu.Item>
                                </div>
                              </Tooltip>
                            </Menu.Dropdown>
                          </Menu>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  );
                })}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        )}

        {data && lista.length > 0 && (
          <Text size="sm" c="dimmed" p="md" pt="xs">
            Exibindo {lista.length} de {data.length} missões.
          </Text>
        )}
      </Card>
    </>
  );
}
