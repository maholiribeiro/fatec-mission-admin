import { useMemo, useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  Center,
  Grid,
  Group,
  ScrollArea,
  SegmentedControl,
  SimpleGrid,
  Skeleton,
  Stack,
  Table,
  Text,
} from '@mantine/core';
import { BarChart } from '@mantine/charts';
import { notifications } from '@mantine/notifications';
import {
  IconAlertCircle,
  IconChecks,
  IconDownload,
  IconPercentage,
  IconRefresh,
  IconTarget,
  IconUserCheck,
  IconUsers,
  IconBolt,
} from '@tabler/icons-react';
import { api } from '../api/client';
import { useFetch } from '../hooks/useFetch';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import ChartCard from '../components/ChartCard';
import { num, pct, rotuloTipo } from '../utils/format';

const METRICAS_CURSO = [
  { value: 'estudantes', label: 'Estudantes' },
  { value: 'ativos', label: 'Ativos' },
  { value: 'conclusoes', label: 'Conclusões' },
  { value: 'xp_total', label: 'XP' },
];

/** Altura proporcional ao número de barras (barras com espessura constante). */
const alturaBarras = (n) => Math.max(160, n * 38 + 48);

export default function Dashboard() {
  const { data: d, error, loading, reload } = useFetch(() => api.dashboard(), []);
  const [exportando, setExportando] = useState(false);
  const [metricaCurso, setMetricaCurso] = useState('estudantes');

  async function exportar() {
    setExportando(true);
    try {
      const arquivo = await api.exportarUsuarios();
      notifications.show({ color: 'green', title: 'Exportação concluída', message: `Arquivo ${arquivo} baixado.` });
    } catch (e) {
      notifications.show({ color: 'red', title: 'Não foi possível exportar', message: e.message });
    } finally {
      setExportando(false);
    }
  }

  const cursos = useMemo(
    () => [...(d?.participacao_por_curso || [])].sort((a, b) => b[metricaCurso] - a[metricaCurso]),
    [d, metricaCurso]
  );
  const rotuloMetrica = METRICAS_CURSO.find((m) => m.value === metricaCurso).label;

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Visão geral do engajamento dos estudantes nas missões."
        actions={
          <>
            <Button variant="default" leftSection={<IconRefresh size={16} />} onClick={reload} loading={loading && !!d}>
              Atualizar
            </Button>
            <Button leftSection={<IconDownload size={16} />} onClick={exportar} loading={exportando}>
              Exportar usuários (CSV)
            </Button>
          </>
        }
      />

      {error && !d ? (
        <Alert color="red" icon={<IconAlertCircle />} title="Não foi possível carregar o dashboard">
          {error.message}
          <Button mt="sm" size="xs" variant="white" color="red" onClick={reload}>Tentar de novo</Button>
        </Alert>
      ) : !d ? (
        <DashboardSkeleton />
      ) : (
        <Stack gap="xl">
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
            <StatCard
              icon={IconUsers}
              label="Estudantes cadastrados"
              value={num(d.usuarios.estudantes)}
              hint={`${num(d.usuarios.administradores)} administrador(es) · ${num(d.usuarios.total)} usuários no total`}
            />
            <StatCard
              icon={IconUserCheck}
              label="Usuários ativos"
              info="Estudantes com ao menos uma tentativa de missão registrada."
              value={num(d.usuarios.ativos)}
              progress={d.usuarios.percentual_ativos}
              hint={`${pct(d.usuarios.percentual_ativos)} dos estudantes já participaram`}
            />
            <StatCard
              icon={IconChecks}
              label="Missões concluídas"
              info="Total de conclusões com sucesso, somando todos os estudantes."
              value={num(d.conclusoes)}
              hint={`${num(d.tentativas.total)} tentativas · ${pct(d.tentativas.taxa_acerto)} de acerto`}
            />
            <StatCard
              icon={IconBolt}
              label="XP distribuído"
              info="Soma do XP ganho em conclusões. As penalidades por erro aparecem à parte."
              value={num(d.xp.distribuido)}
              hint={`${num(d.xp.penalidades)} em penalidades · saldo ${num(d.xp.saldo)}`}
            />
            <StatCard
              icon={IconPercentage}
              label="Taxa de conclusão"
              info="Percentual de combinações estudante × missão ativa já concluídas."
              value={pct(d.taxa_conclusao)}
              progress={d.taxa_conclusao}
              hint="das missões ativas concluídas pelos estudantes"
            />
            <StatCard
              icon={IconTarget}
              label="Missões"
              value={num(d.missoes.total)}
              hint={`${num(d.missoes.ativas)} ativas · ${num(d.missoes.inativas)} inativas`}
            />
          </SimpleGrid>

          <Grid gutter="lg" align="stretch">
            <Grid.Col span={{ base: 12, xl: 7 }}>
              <ChartCard
                title="Missões realizadas"
                description="Conclusões por missão, da mais realizada para a menos realizada."
                chart={
                  d.conclusoes === 0 ? (
                    <Center h={160}><Text c="dimmed">Nenhuma missão foi concluída ainda.</Text></Center>
                  ) : (
                    <BarChart
                      h={alturaBarras(d.missoes_realizadas.length)}
                      data={d.missoes_realizadas}
                      dataKey="titulo"
                      orientation="vertical"
                      series={[{ name: 'conclusoes', label: 'Conclusões', color: 'var(--chart-bar)' }]}
                      withLegend={false}
                      gridAxis="x"
                      withBarValueLabel
                      valueFormatter={num}
                      yAxisProps={{ width: 210, tick: { fontSize: 12 } }}
                      barProps={{ radius: [0, 4, 4, 0], maxBarSize: 22 }}
                      tooltipAnimationDuration={150}
                    />
                  )
                }
                table={
                  <ScrollArea.Autosize mah={480}>
                    <Table striped highlightOnHover stickyHeader>
                      <Table.Thead>
                        <Table.Tr>
                          <Table.Th>Missão</Table.Th>
                          <Table.Th>Tipo</Table.Th>
                          <Table.Th ta="right">Conclusões</Table.Th>
                          <Table.Th ta="right">Erros</Table.Th>
                          <Table.Th ta="right">Tentativas</Table.Th>
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        {d.missoes_realizadas.map((m) => (
                          <Table.Tr key={m.missao_id}>
                            <Table.Td>
                              {m.titulo}{' '}
                              {m.status === 'inativa' && <Badge size="xs" color="gray" variant="light">Inativa</Badge>}
                            </Table.Td>
                            <Table.Td>{rotuloTipo(m.tipo)}</Table.Td>
                            <Table.Td ta="right" fw={600}>{num(m.conclusoes)}</Table.Td>
                            <Table.Td ta="right">{num(m.erros)}</Table.Td>
                            <Table.Td ta="right">{num(m.tentativas)}</Table.Td>
                          </Table.Tr>
                        ))}
                      </Table.Tbody>
                    </Table>
                  </ScrollArea.Autosize>
                }
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, xl: 5 }}>
              <ChartCard
                title="Participação por curso"
                description={`${rotuloMetrica} por curso.`}
                controls={
                  <SegmentedControl
                    size="xs"
                    value={metricaCurso}
                    onChange={setMetricaCurso}
                    data={METRICAS_CURSO}
                    aria-label="Métrica por curso"
                  />
                }
                chart={
                  !cursos.length ? (
                    <Center h={160}><Text c="dimmed">Nenhum estudante cadastrado ainda.</Text></Center>
                  ) : (
                    <BarChart
                      h={alturaBarras(cursos.length)}
                      data={cursos}
                      dataKey="curso"
                      orientation="vertical"
                      series={[{ name: metricaCurso, label: rotuloMetrica, color: 'var(--chart-bar)' }]}
                      withLegend={false}
                      gridAxis="x"
                      withBarValueLabel
                      valueFormatter={num}
                      yAxisProps={{ width: 190, tick: { fontSize: 12 } }}
                      barProps={{ radius: [0, 4, 4, 0], maxBarSize: 22 }}
                      tooltipAnimationDuration={150}
                    />
                  )
                }
                table={
                  <Table striped highlightOnHover>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Curso</Table.Th>
                        <Table.Th ta="right">Estudantes</Table.Th>
                        <Table.Th ta="right">Ativos</Table.Th>
                        <Table.Th ta="right">Conclusões</Table.Th>
                        <Table.Th ta="right">XP</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {cursos.map((c) => (
                        <Table.Tr key={c.curso}>
                          <Table.Td>{c.curso}</Table.Td>
                          <Table.Td ta="right">{num(c.estudantes)}</Table.Td>
                          <Table.Td ta="right">
                            {num(c.ativos)} <Text span size="xs" c="dimmed">({pct(c.percentual_ativos)})</Text>
                          </Table.Td>
                          <Table.Td ta="right">{num(c.conclusoes)}</Table.Td>
                          <Table.Td ta="right">{num(c.xp_total)}</Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                }
              />
            </Grid.Col>
          </Grid>
        </Stack>
      )}
    </>
  );
}

function DashboardSkeleton() {
  return (
    <Stack gap="xl" aria-busy="true" aria-label="Carregando">
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
        {Array.from({ length: 6 }, (_, i) => <Skeleton key={i} h={140} radius="lg" />)}
      </SimpleGrid>
      <Group grow align="stretch">
        <Skeleton h={380} radius="lg" />
        <Skeleton h={380} radius="lg" />
      </Group>
    </Stack>
  );
}
