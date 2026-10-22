import { Navigate, Outlet, Route, Routes, useLocation, Link } from 'react-router-dom';
import { Button, Center, Loader, Stack, Text, Title } from '@mantine/core';
import { useAuth } from './context/AuthContext';
import AppLayout from './components/AppLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Missoes from './pages/Missoes';
import MissaoForm from './pages/MissaoForm';

function Privada() {
  const { usuario, carregando } = useAuth();
  const location = useLocation();
  if (carregando) {
    return (
      <Center h="100vh">
        <Loader />
      </Center>
    );
  }
  if (!usuario) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}

function NaoEncontrada() {
  return (
    <Center h="60vh">
      <Stack align="center" gap="xs">
        <Title order={3}>Página não encontrada</Title>
        <Text c="dimmed">O endereço acessado não existe.</Text>
        <Button component={Link} to="/" mt="sm">Ir para o Dashboard</Button>
      </Stack>
    </Center>
  );
}

export default function App() {
  const { usuario } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={usuario ? <Navigate to="/" replace /> : <Login />} />
      <Route element={<Privada />}>
        <Route element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="/missoes" element={<Missoes />} />
          <Route path="/missoes/nova" element={<MissaoForm key="nova" />} />
          <Route path="/missoes/:id" element={<MissaoForm />} />
          <Route path="*" element={<NaoEncontrada />} />
        </Route>
      </Route>
    </Routes>
  );
}
