import { useEffect, useState } from 'react';
import { ActionIcon, Alert, Button, Group, Modal, Radio, Stack, Text, Textarea, TextInput, Tooltip } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconAlertCircle, IconPlus, IconTrash } from '@tabler/icons-react';
import { api } from '../api/client';

const MIN = 2;
const MAX = 6;
const novaAlternativa = () => ({ chave: Math.random().toString(36).slice(2), texto: '' });

/**
 * Cadastro/edição de pergunta: enunciado + 2 a 6 alternativas, com o rádio marcando
 * a ÚNICA alternativa correta (mesma regra garantida pela API e pelo banco).
 */
export default function PerguntaModal({ aberto, pergunta, missaoId, onClose, onSalvo }) {
  const [enunciado, setEnunciado] = useState('');
  const [alternativas, setAlternativas] = useState([]);
  const [correta, setCorreta] = useState(null);
  const [erros, setErros] = useState({});
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!aberto) return;
    if (pergunta) {
      const alts = pergunta.alternativas.map((a) => ({ chave: String(a.alternativa_id), texto: a.texto }));
      setEnunciado(pergunta.enunciado);
      setAlternativas(alts);
      setCorreta(String(pergunta.alternativas.find((a) => a.correta)?.alternativa_id ?? ''));
    } else {
      const alts = [novaAlternativa(), novaAlternativa(), novaAlternativa(), novaAlternativa()];
      setEnunciado('');
      setAlternativas(alts);
      setCorreta(null);
    }
    setErros({});
  }, [aberto, pergunta]);

  const setTexto = (chave, texto) => setAlternativas((l) => l.map((a) => (a.chave === chave ? { ...a, texto } : a)));
  const remover = (chave) => {
    setAlternativas((l) => l.filter((a) => a.chave !== chave));
    if (correta === chave) setCorreta(null);
  };

  function validar() {
    const e = {};
    if (enunciado.trim().length < 3) e.enunciado = 'Escreva o enunciado da pergunta (mín. 3 caracteres).';
    const preenchidas = alternativas.filter((a) => a.texto.trim());
    if (preenchidas.length < MIN) e.alternativas = `Preencha ao menos ${MIN} alternativas.`;
    else if (!correta || !preenchidas.some((a) => a.chave === correta)) e.alternativas = 'Marque qual alternativa é a correta.';
    const textos = preenchidas.map((a) => a.texto.trim().toLowerCase());
    if (!e.alternativas && new Set(textos).size !== textos.length) e.alternativas = 'Há alternativas com o mesmo texto.';
    setErros(e);
    return !Object.keys(e).length;
  }

  async function salvar() {
    if (!validar()) return;
    setSalvando(true);
    const dados = {
      enunciado: enunciado.trim(),
      alternativas: alternativas
        .filter((a) => a.texto.trim())
        .map((a) => ({ texto: a.texto.trim(), correta: a.chave === correta })),
    };
    try {
      if (pergunta) await api.editarPergunta(pergunta.pergunta_id, dados);
      else await api.criarPergunta(missaoId, dados);
      notifications.show({ color: 'green', message: pergunta ? 'Pergunta atualizada.' : 'Pergunta adicionada.' });
      onSalvo();
    } catch (err) {
      setErros({ geral: err.detalhes?.map((d) => d.mensagem).join(' ') || err.message });
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Modal opened={aberto} onClose={onClose} title={pergunta ? 'Editar pergunta' : 'Nova pergunta'} size="lg" centered>
      <Stack gap="md">
        {erros.geral && <Alert color="red" icon={<IconAlertCircle />}>{erros.geral}</Alert>}

        <Textarea
          label="Enunciado"
          placeholder="Ex.: Qual estrutura de dados segue o princípio LIFO?"
          autosize
          minRows={2}
          maxLength={2000}
          withAsterisk
          value={enunciado}
          onChange={(e) => setEnunciado(e.currentTarget.value)}
          error={erros.enunciado}
          data-autofocus
        />

        <div>
          <Text size="sm" fw={500}>Alternativas <Text span c="red">*</Text></Text>
          <Text size="xs" c="dimmed" mb="xs">Selecione o círculo da alternativa correta. De {MIN} a {MAX} alternativas.</Text>
          <Radio.Group value={correta} onChange={setCorreta} aria-label="Alternativa correta">
            <Stack gap="xs">
              {alternativas.map((a, i) => (
                <Group key={a.chave} gap="sm" wrap="nowrap">
                  <Tooltip label="Marcar como correta">
                    <Radio value={a.chave} color="green" aria-label={`Alternativa ${String.fromCharCode(65 + i)} é a correta`} />
                  </Tooltip>
                  <TextInput
                    style={{ flex: 1 }}
                    placeholder={`Alternativa ${String.fromCharCode(65 + i)}`}
                    value={a.texto}
                    maxLength={255}
                    onChange={(e) => setTexto(a.chave, e.currentTarget.value)}
                    leftSection={<Text size="sm" fw={700} c="dimmed">{String.fromCharCode(65 + i)}</Text>}
                    styles={correta === a.chave ? { input: { borderColor: 'var(--mantine-color-green-6)' } } : undefined}
                  />
                  <Tooltip label="Remover alternativa">
                    <ActionIcon
                      variant="subtle"
                      color="gray"
                      onClick={() => remover(a.chave)}
                      disabled={alternativas.length <= MIN}
                      aria-label={`Remover alternativa ${String.fromCharCode(65 + i)}`}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Tooltip>
                </Group>
              ))}
            </Stack>
          </Radio.Group>
          {erros.alternativas && <Text size="sm" c="red" mt="xs">{erros.alternativas}</Text>}
          <Button
            mt="sm"
            variant="subtle"
            size="xs"
            leftSection={<IconPlus size={14} />}
            disabled={alternativas.length >= MAX}
            onClick={() => setAlternativas((l) => [...l, novaAlternativa()])}
          >
            Adicionar alternativa
          </Button>
        </div>

        <Group justify="flex-end" mt="sm">
          <Button variant="default" onClick={onClose}>Cancelar</Button>
          <Button onClick={salvar} loading={salvando}>{pergunta ? 'Salvar pergunta' : 'Adicionar pergunta'}</Button>
        </Group>
      </Stack>
    </Modal>
  );
}
