import { createTheme } from '@mantine/core';

/**
 * Tema do painel: visual limpo de ferramenta de trabalho, com o vermelho da marca
 * (#B63A45) como cor primária. No modo escuro usa um tom mais claro (#D9555F),
 * validado para contraste sobre a superfície escura.
 */
export const theme = createTheme({
  primaryColor: 'brand',
  primaryShade: { light: 6, dark: 4 },
  colors: {
    brand: [
      '#fcedee',
      '#f5d9db',
      '#ebb0b5',
      '#e1858d',
      '#d9555f',
      '#d24956',
      '#b63a45',
      '#a0313b',
      '#8c2a33',
      '#74212a',
    ],
  },
  fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  headings: { fontWeight: '700' },
  defaultRadius: 'md',
  cursorType: 'pointer',
  components: {
    Button: { defaultProps: { radius: 'md' } },
    Card: { defaultProps: { withBorder: true, radius: 'lg', padding: 'lg' } },
    Paper: { defaultProps: { radius: 'lg' } },
    Tooltip: { defaultProps: { withArrow: true, openDelay: 200 } },
  },
});
