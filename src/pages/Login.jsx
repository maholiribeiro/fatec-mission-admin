import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Alert, Box, Button, Paper, PasswordInput, Stack, Text, TextInput, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconAlertCircle, IconLock, IconMail } from '@tabler/icons-react';
import { useAuth } from '../context/AuthContext';
import Logo, { LogoIcon } from '../components/Logo';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [erro, setErro] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const form = useForm({
    initialValues: { email: '', senha: '' },
    validate: {
      email: (v) => (/^\S+@\S+\.\S+$/.test(v.trim()) ? null : 'Informe um e-mail válido'),
      senha: (v) => (v ? null : 'Informe a senha'),
    },
  });

  async function entrar({ email, senha }) {
    setErro(null);
    setEnviando(true);
    try {
      await login(email.trim(), senha);
      navigate(location.state?.from || '/', { replace: true });
    } catch (e) {
      setErro(e.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Box className="login-grid">
      <Box className="login-brand" visibleFrom="md" p={56} style={{ display: 'flex', flexDirection: 'column' }}>
        <LogoIcon size={56} />
        <Box mt="auto" maw={460}>
          <Text size="sm" fw={700} c="#de5a66" tt="uppercase" style={{ letterSpacing: '0.14em' }}>
            Painel administrativo
          </Text>
          <Title order={1} mt="xs" style={{ fontSize: 44, lineHeight: 1.05, color: '#fdfaf6' }}>
            Missões que conectam. Conquistas que transformam.
          </Title>
          <Text mt="md" c="rgba(253,250,246,0.7)" size="lg">
            Acompanhe o engajamento dos estudantes e gerencie as missões do campus.
          </Text>
        </Box>
      </Box>

      <Box style={{ display: 'grid', placeItems: 'center' }} p="xl">
        <Paper w="100%" maw={400} p={0} bg="transparent">
          <Stack gap="xl">
            <Logo />
            <div>
              <Title order={2}>Entrar</Title>
              <Text c="dimmed" size="sm" mt={4}>
                Acesso exclusivo para administradores.
              </Text>
            </div>

            {erro && (
              <Alert color="red" variant="light" icon={<IconAlertCircle size={18} />} role="alert">
                {erro}
              </Alert>
            )}

            <form onSubmit={form.onSubmit(entrar)} noValidate>
              <Stack gap="md">
                <TextInput
                  label="E-mail"
                  placeholder="admin@fatec.sp.gov.br"
                  leftSection={<IconMail size={16} />}
                  autoComplete="email"
                  size="md"
                  autoFocus
                  {...form.getInputProps('email')}
                />
                <PasswordInput
                  label="Senha"
                  placeholder="Sua senha"
                  leftSection={<IconLock size={16} />}
                  autoComplete="current-password"
                  size="md"
                  {...form.getInputProps('senha')}
                />
                <Button type="submit" size="md" fullWidth loading={enviando} mt="xs">
                  Entrar
                </Button>
              </Stack>
            </form>
          </Stack>
        </Paper>
      </Box>
    </Box>
  );
}
