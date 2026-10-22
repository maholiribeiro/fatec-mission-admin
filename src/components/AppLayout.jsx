import { NavLink as RouterLink, Outlet, useLocation } from 'react-router-dom';
import {
  ActionIcon,
  AppShell,
  Avatar,
  Burger,
  Group,
  Menu,
  NavLink,
  Stack,
  Text,
  Tooltip,
  UnstyledButton,
  useComputedColorScheme,
  useMantineColorScheme,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconChevronDown, IconLayoutDashboard, IconLogout, IconMoon, IconSun, IconTarget } from '@tabler/icons-react';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';

const MENU = [
  { to: '/', label: 'Dashboard', icon: IconLayoutDashboard, end: true },
  { to: '/missoes', label: 'Missões', icon: IconTarget },
];

const iniciais = (nome = '') =>
  nome.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase();

export default function AppLayout() {
  const { usuario, logout } = useAuth();
  const [aberto, { toggle, close }] = useDisclosure();
  const { pathname } = useLocation();
  const { setColorScheme } = useMantineColorScheme();
  const esquema = useComputedColorScheme('light');

  return (
    <AppShell
      header={{ height: 64 }}
      navbar={{ width: 240, breakpoint: 'sm', collapsed: { mobile: !aberto } }}
      padding="xl"
    >
      <AppShell.Header>
        <Group h="100%" px="lg" justify="space-between">
          <Group gap="sm">
            <Burger opened={aberto} onClick={toggle} hiddenFrom="sm" size="sm" aria-label="Abrir menu" />
            <Logo />
          </Group>

          <Group gap="xs">
            <Tooltip label={esquema === 'dark' ? 'Tema claro' : 'Tema escuro'}>
              <ActionIcon
                variant="default"
                size="lg"
                onClick={() => setColorScheme(esquema === 'dark' ? 'light' : 'dark')}
                aria-label="Alternar tema"
              >
                {esquema === 'dark' ? <IconSun size={18} /> : <IconMoon size={18} />}
              </ActionIcon>
            </Tooltip>

            <Menu position="bottom-end" width={220}>
              <Menu.Target>
                <UnstyledButton aria-label="Menu do usuário">
                  <Group gap="xs" wrap="nowrap">
                    <Avatar color="brand" radius="xl" size={36}>{iniciais(usuario?.nome)}</Avatar>
                    <div style={{ lineHeight: 1.2 }}>
                      <Text size="sm" fw={600}>{usuario?.nome}</Text>
                      <Text size="xs" c="dimmed">{usuario?.email}</Text>
                    </div>
                    <IconChevronDown size={16} />
                  </Group>
                </UnstyledButton>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label>Administrador</Menu.Label>
                <Menu.Item color="red" leftSection={<IconLogout size={16} />} onClick={logout}>
                  Sair
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <Stack gap={4}>
          {MENU.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              component={RouterLink}
              to={to}
              end={end}
              label={label}
              leftSection={<Icon size={20} stroke={1.7} />}
              active={end ? pathname === to : pathname.startsWith(to)}
              onClick={close}
              variant="light"
              styles={{ root: { borderRadius: 8 }, label: { fontWeight: 600 } }}
            />
          ))}
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main bg="var(--mantine-color-body)">
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
