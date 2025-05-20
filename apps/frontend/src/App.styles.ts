import styled, { css } from 'styled-components';

export const Container = styled.div`
  background: linear-gradient(135deg, #3d5c4e 0%, #2c4d3f 100%);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  color: #fff;
  font-family: 'Poppins', 'Roboto', sans-serif;
`;

export const Header = styled.header`
  display: flex;
  justify-content: space-between;
  padding: 20px 24px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(5px);
  background: rgba(44, 77, 63, 0.3);
`;

const iconCSS = css`
  font-size: 1.5rem;
  color: #b0c4a5;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 8px;
  border-radius: 50%;
  &:hover { 
    color: #e8f478; 
    transform: scale(1.1);
    background: rgba(255, 255, 255, 0.1);
  }
`;

export const HelpIcon     = styled.div`${iconCSS}`;
export const SettingsIcon = styled.div`${iconCSS}`;

export const Main = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
  padding: 0 20px;
  max-width: 1200px;
  margin: 30px auto;
  width: 100%;
`;

export const Title = styled.h1`
  font-family: 'Montserrat', sans-serif;
  color: #e8f478;
  font-size: 3rem;
  font-weight: 800;
  text-transform: uppercase;
  margin-bottom: 32px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  letter-spacing: 2px;
  text-align: center;
`;

type ButtonProps = { $variant: 'primary' | 'secondary' | 'dark' };

export const Button = styled.button<ButtonProps>`
  width: 240px;
  padding: 14px 0;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
  
  &:active { transform: scale(0.97); }
  &:hover { transform: translateY(-3px); box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15); }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.1);
    transform: translateX(-100%);
    transition: transform 0.4s ease-out;
  }
  
  &:hover::after {
    transform: translateX(0);
  }

  ${({ $variant }) => $variant  === 'primary' && css`
    background: linear-gradient(to right, #f7ff80, #d8ff00);
    color: #2c4d3f;
  `}
  ${({ $variant  }) => $variant  === 'secondary' && css`
    background: linear-gradient(to right, #6da78e, #5a9178);
    color: #fff;
  `}
  ${({ $variant  }) => $variant  === 'dark' && css`
    background: linear-gradient(to right, #2c4d3f, #1a3a2c);
    color: #fff;
  `}
`;

export const Footer = styled.footer`
  padding: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 32px;
  background: rgba(44, 77, 63, 0.4);
  backdrop-filter: blur(5px);
  margin-top: auto;
`;

export const FooterLink = styled.a`
  color: #fff;
  text-decoration: none;
  font-size: 0.9rem;
  position: relative;
  padding: 4px 0;
  
  &::after {
    content: '';
    position: absolute;
    width: 0;
    height: 2px;
    bottom: 0;
    left: 0;
    background-color: #e8f478;
    transition: width 0.3s ease;
  }
  
  &:hover { 
    color: #e8f478; 
    
    &::after {
      width: 100%;
    }
  }
`;

export const Socials = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 1.2rem;
  
  a {
    color: #b0c4a5;
    transition: all 0.3s ease;
    
    &:hover {
      color: #e8f478;
      transform: translateY(-2px);
    }
  }
`;
