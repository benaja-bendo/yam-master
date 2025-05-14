import styled, { css } from 'styled-components';

export const Container = styled.div`
  background: #3d5c4e;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  color: #fff;
`;

export const Header = styled.header`
  display: flex;
  justify-content: space-between;
  padding: 16px;
`;

const iconCSS = css`
  font-size: 1.5rem;
  color: #b0c4a5;
  cursor: pointer;
  transition: color 0.2s;
  &:hover { color: #e8f478; }
`;

export const HelpIcon     = styled.div`${iconCSS}`;
export const SettingsIcon = styled.div`${iconCSS}`;

export const Main = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
`;

export const Title = styled.h1`
  font-family: 'Comic Sans MS', cursive, sans-serif;
  color: #e8f478;
  font-size: 2.5rem;
  text-transform: uppercase;
  margin-bottom: 24px;
  text-shadow: 1px 1px 0 #2c4d3f;
`;

type ButtonProps = { variant: 'primary' | 'secondary' | 'dark' };

export const Button = styled.button<ButtonProps>`
  width: 240px;
  padding: 12px 0;
  border: none;
  border-radius: 6px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: transform 0.1s;
  &:active { transform: scale(0.97); }

  ${({ variant }) => variant === 'primary' && css`
    background: #f7ff80;
    color: #2c4d3f;
  `}
  ${({ variant }) => variant === 'secondary' && css`
    background: #6da78e;
    color: #2c4d3f;
  `}
  ${({ variant }) => variant === 'dark' && css`
    background: #2c4d3f;
    color: #fff;
  `}
`;

export const Footer = styled.footer`
  padding: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 24px;
`;

export const FooterLink = styled.a`
  color: #fff;
  text-decoration: underline;
  font-size: 0.9rem;
  &:hover { color: #e8f478; }
`;

export const Socials = styled.div`
  display: flex;
  align-items: center;
  font-size: 1.2rem;
`;
