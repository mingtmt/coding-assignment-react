import React from 'react';
import { render, screen } from '@testing-library/react';
import { DefaultLayout } from './DefaultLayout';
import { MemoryRouter } from 'react-router-dom';

jest.mock('../../store/theme.store', () => {
  let theme = 'dark';
  return {
    useThemeStore: () => ({
      theme,
      toggle: () => {
        theme = theme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
      },
      set: (t: 'dark'|'light') => {
        theme = t;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
      }
    }),
  };
});

describe('<DefaultLayout />', () => {
  it('toggle theme sets data-theme attribute', async () => {
    render(
      <MemoryRouter>
        <DefaultLayout />
      </MemoryRouter>
    );
    const btn = screen.getByRole('button', { name: /toggle theme/i });
    btn.click();
    expect(['dark', 'light']).toContain(document.documentElement.getAttribute('data-theme'));
  });
});
