import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ActionIcon,
  Alert,
  Anchor,
  Breadcrumbs,
  Button,
  Card,
  Divider,
  Grid,
  Group,
  SegmentedControl,
  Select,
  Skeleton,
  Stack,
  Switch,
  Text,
  Textarea,
  TextInput,
  Title,
  Tooltip,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { IconAlertCircle, IconArrowsShuffle, IconInfoCircle, IconTrash, IconX } from '@tabler/icons-react';
import { api } from '../api/client';
import PageHeader from '../components/PageHeader';
import QuizEditor from '../components/QuizEditor';
import { DIFICULDADES, PENALIDADE, TIPOS, TIPO_QUIZ, XP, gerarCodigoQr, num, rotuloTipo } from '../utils/format';

const VAZIO = { titulo: '', descricao: '', dificuldade: 'Fácil', tipo: 'Tipo 1', status: 'ativa', qr_code: '' };

export default function MissaoForm() {
  const { id } = useParams();
  const editando = Boolean(id);
  const navigate = useNavigate();

  const [missao, setMissao] = useState(null);
  const [carregando, setCarregando] = useState(editando);
  const [erroCarga, setErroCarga] = useState(null);
  const [erroGeral, setErroGeral] = useState(null);
  const [salvando, setSalvando] = useState(false);

  const form = useForm({
    initialValues: VAZIO,
    validate: {
      titulo: (v) => (v.trim().length < 3 ? 'Informe um título com ao menos 3 caracteres' : v.length > 150 ? 'Máximo de 150 caracteres' : null),
      qr_code: (v) => (v.length > 255 ? 'Máximo de 255 caracteres' : null),
    },
  });

  useEffect(() => {
    if (!editando) return;
    api
      .missao(id)
      .then((m) => {
        setMissao(m);
        const valores = {
          titulo: m.titulo,
          descricao: m.descricao || '',
          dificuldade: m.dificuldade,
          tipo: m.tipo,
          status: m.status,
          qr_code: m.qr_code || '',
        };
        form.setInitialValues(valores);
        form.setValues(valores);
      })
      .catch(setErroCarga)
      .finally(() => setCarregando(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, editando]);

  async function salvar(valores) {
    setErroGeral(null);
    setSalvando(true);
    const dados = {
      titulo: valores.titulo.trim(),
      descricao: valores.descricao.trim() || null,
      dificuldade: valores.dificuldade,
      tipo: valores.tipo,
      status: valores.status,
      qr_code: valores.qr_code.trim() || null,
    };
    try {
      const salva = editando ? await api.editarMissao(id, dados) : await api.criarMissao(dados);
      notifications.show({ color: 'green', message: editando ? 'Missão atualizada.' : 'Missão criada.' });
      if (!editando && salva.quiz) {
        // Quiz recém-criado: segue para a edição, onde as perguntas são cadastradas
        notifications.show({ color: 'blue', message: 'Agora cadastre as perguntas do quiz.' });
        navigate(`/missoes/${salva.missao_id}`, { replace: true });
      } else {
        navigate('/missoes');
      }
    } catch (e) {
      if (e.detalhes?.length) form.setErrors(e.campos);
      setErroGeral(e.message);
    } finally {
      setSalvando(false);
    }
  }

  function excluir() {
    modals.openConfirmModal({
      title: 'Excluir missão',
      centered: true,
      children: <Text size="sm">Excluir <b>“{missao.titulo}”</b> definitivamente? Esta ação não pode ser desfeita.</Text>,
      labels: { confirm: 'Excluir missão', cancel: 'Cancelar' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          await api.excluirMissao(id);
          notifications.show({ color: 'green', message: 'Missão excluída.' });
          navigate('/missoes');
        } catch (e) {
          notifications.show({ color: 'red', title: 'Não foi possível excluir', message: e.message, autoClose: 8000 });
        }
      },
    });
  }

  const v = form.values;
  const ehQuiz = v.tipo === TIPO_QUIZ;
  const titulo = editando ? 'Editar missão' : 'Nova missão';

  if (carregando) {
    return (
      <Stack>
        <Skeleton h={60} w={320} />
        <Skeleton h={420} radius="lg" />
      </Stack>
    );
  }
  if (erroCarga) {
    return (
      <Alert color="red" icon={<IconAlertCircle />} title="Não foi possível abrir a missão">
        {erroCarga.message} <Anchor component={Link} to="/missoes">Voltar para Missões</Anchor>
      </Alert>
    );
  }

  return (
    <>
      <PageHeader
        above={
          <Breadcrumbs>
            <Anchor component={Link} to="/missoes" size="sm">Missões</Anchor>
            <Text size="sm">{editando ? missao.titulo : 'Nova missão'}</Text>
          </Breadcrumbs>
        }
        title={titulo}
        description={editando ? `ID ${missao.missao_id}` : 'Preencha os dados da missão. O XP é definido pela dificuldade.'}
      />

      <form onSubmit={form.onSubmit(salvar)} noValidate>
        <Grid gutter="lg">
          {/* ---------------- Dados principais ---------------- */}
          <Grid.Col span={{ base: 12, lg: 8 }}>
            <Stack gap="lg">
              {erroGeral && (
                <Alert color="red" icon={<IconAlertCircle />} withCloseButton onClose={() => setErroGeral(null)}>
                  {erroGeral}
                </Alert>
              )}

              <Card>
                <Stack gap="md">
                  <Title order={4}>Informações</Title>
                  <TextInput
                    label="Título"
                    placeholder="Ex.: Visite o auditório"
                    withAsterisk
                    maxLength={150}
                    description={`${v.titulo.length}/150`}
                    inputWrapperOrder={['label', 'input', 'description', 'error']}
                    {...form.getInputProps('titulo')}
                  />
                  <Textarea
                    label="Descrição (briefing)"
                    placeholder="Explique ao estudante o que fazer para cumprir a missão."
                    autosize
                    minRows={3}
                    maxRows={8}
                    {...form.getInputProps('descricao')}
                  />
                  <Grid>
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <Select
                        label="Tipo"
                        withAsterisk
                        allowDeselect={false}
                        data={TIPOS.map((t) => ({ value: t, label: rotuloTipo(t) }))}
                        description={ehQuiz ? 'Quiz: o estudante responde perguntas no app.' : ' '}
                        inputWrapperOrder={['label', 'input', 'description', 'error']}
                        {...form.getInputProps('tipo')}
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <Text size="sm" fw={500} mb={4}>
                        Dificuldade <Text span c="red">*</Text>
                      </Text>
                      <SegmentedControl fullWidth data={DIFICULDADES} {...form.getInputProps('dificuldade')} />
                    </Grid.Col>
                  </Grid>
                  <TextInput
                    label="QR Code (opcional)"
                    placeholder="FATEC-LOCAL-001"
                    description="Deixe vazio se a missão não usa QR Code. O código deve ser único e é impresso abaixo do QR."
                    inputWrapperOrder={['label', 'input', 'description', 'error']}
                    styles={{ input: { fontFamily: 'ui-monospace, Consolas, monospace' } }}
                    {...form.getInputProps('qr_code')}
                    onChange={(e) => form.setFieldValue('qr_code', e.currentTarget.value.toUpperCase())}
                    rightSectionWidth={72}
                    rightSection={
                      <Group gap={2} wrap="nowrap">
                        {v.qr_code && (
                          <Tooltip label="Remover QR Code">
                            <ActionIcon variant="subtle" color="gray" onClick={() => form.setFieldValue('qr_code', '')} aria-label="Remover QR Code">
                              <IconX size={16} />
                            </ActionIcon>
                          </Tooltip>
                        )}
                        <Tooltip label="Gerar código aleatório">
                          <ActionIcon variant="subtle" onClick={() => form.setFieldValue('qr_code', gerarCodigoQr())} aria-label="Gerar código">
                            <IconArrowsShuffle size={16} />
                          </ActionIcon>
                        </Tooltip>
                      </Group>
                    }
                  />
                </Stack>
              </Card>

              {ehQuiz &&
                (editando && missao.tipo === TIPO_QUIZ ? (
                  <QuizEditor missaoId={missao.missao_id} />
                ) : (
                  <Alert color="blue" variant="light" icon={<IconInfoCircle />} title="Perguntas do quiz">
                    {editando
                      ? 'Salve a alteração de tipo para cadastrar as perguntas deste quiz.'
                      : 'Depois de criar a missão, você poderá cadastrar as perguntas e alternativas do quiz.'}
                  </Alert>
                ))}
            </Stack>
          </Grid.Col>

          {/* ---------------- Lateral ---------------- */}
          <Grid.Col span={{ base: 12, lg: 4 }}>
            <Stack gap="lg" pos="sticky" top={88}>
              <Card>
                <Stack gap="md">
                  <Title order={4}>Pontuação</Title>
                  <Group grow>
                    <div>
                      <Text size="xs" c="dimmed" tt="uppercase" fw={700}>{ehQuiz ? 'XP máximo' : 'Recompensa'}</Text>
                      <Text fz={28} fw={800} c="brand">+{XP[v.dificuldade]}</Text>
                    </div>
                    <div>
                      <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Penalidade</Text>
                      <Text fz={28} fw={800} c="dimmed">{PENALIDADE[v.dificuldade]}</Text>
                    </div>
                  </Group>
                  <Text size="xs" c="dimmed">
                    {ehQuiz
                      ? 'No quiz, o XP é dividido igualmente entre as perguntas; a penalidade vale quando o estudante não acerta nenhuma.'
                      : 'Definidos automaticamente pela dificuldade. A penalidade é aplicada a cada tentativa errada.'}
                  </Text>
                  <Divider />
                  <Switch
                    label="Missão ativa"
                    description="Visível e disponível para os estudantes"
                    checked={v.status === 'ativa'}
                    onChange={(e) => form.setFieldValue('status', e.currentTarget.checked ? 'ativa' : 'inativa')}
                  />
                </Stack>
              </Card>

              {editando && (
                <Card>
                  <Stack gap="xs">
                    <Title order={4}>Estatísticas</Title>
                    <Group justify="space-between"><Text size="sm" c="dimmed">Conclusões</Text><Text fw={700}>{num(missao.total_conclusoes)}</Text></Group>
                    <Group justify="space-between"><Text size="sm" c="dimmed">Tentativas</Text><Text fw={700}>{num(missao.total_tentativas)}</Text></Group>
                  </Stack>
                </Card>
              )}

              <Group grow>
                <Button variant="default" component={Link} to="/missoes">Cancelar</Button>
                <Button type="submit" loading={salvando}>{editando ? 'Salvar alterações' : 'Criar missão'}</Button>
              </Group>

              {editando && (
                <Card style={{ borderColor: 'var(--mantine-color-red-outline)' }}>
                  <Stack gap="xs">
                    <Text fw={700} c="red">Zona de perigo</Text>
                    {missao.total_tentativas > 0 ? (
                      <Text size="sm" c="dimmed">
                        Esta missão tem {num(missao.total_tentativas)} tentativa(s) e não pode ser excluída — isso alteraria o XP dos
                        estudantes. Para tirá-la do ar, desmarque <b>Missão ativa</b> e salve.
                      </Text>
                    ) : (
                      <Text size="sm" c="dimmed">A exclusão é definitiva{missao.quiz ? ' e remove as perguntas do quiz' : ''}.</Text>
                    )}
                    <Button
                      variant="light"
                      color="red"
                      leftSection={<IconTrash size={16} />}
                      disabled={missao.total_tentativas > 0}
                      onClick={excluir}
                    >
                      Excluir missão
                    </Button>
                  </Stack>
                </Card>
              )}
            </Stack>
          </Grid.Col>
        </Grid>
      </form>
    </>
  );
}
