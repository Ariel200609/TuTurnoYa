import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { FiFacebook, FiInstagram, FiTwitter, FiMail } from 'react-icons/fi';
import { GiSoccerBall } from 'react-icons/gi';
import { useTheme } from '../../contexts/ThemeContext';

const FooterWrapper = styled.footer`
  background: ${props => props.theme.colors.surface};
  border-top: 1px solid ${props => props.theme.colors.border};
  margin-top: auto;
`;

const FooterContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: ${props => props.theme.spacing.xxl} ${props => props.theme.spacing.lg} ${props => props.theme.spacing.lg};

  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    padding: ${props => props.theme.spacing.lg} ${props => props.theme.spacing.md} ${props => props.theme.spacing.md};
  }
`;

const FooterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${props => props.theme.spacing.xl};
  margin-bottom: ${props => props.theme.spacing.xl};

  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
    gap: ${props => props.theme.spacing.lg};
  }
`;

const FooterSection = styled.div`
  h4 {
    color: ${props => props.theme.colors.primary};
    margin-bottom: ${props => props.theme.spacing.md};
    font-weight: ${props => props.theme.typography.fontWeights.bold};
    display: flex;
    align-items: center;
    gap: ${props => props.theme.spacing.xs};
  }

  p {
    color: ${props => props.theme.colors.textSecondary};
    line-height: 1.6;
    margin-bottom: ${props => props.theme.spacing.sm};
  }
`;

const FooterLink = styled(Link)`
  display: block;
  color: ${props => props.theme.colors.textSecondary};
  text-decoration: none;
  margin-bottom: ${props => props.theme.spacing.xs};
  transition: color 0.2s ease;

  &:hover {
    color: ${props => props.theme.colors.primary};
    text-decoration: none;
  }
`;

const SocialLinks = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  margin-top: ${props => props.theme.spacing.md};
`;

const SocialLink = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: ${props => props.theme.colors.primary};
  color: white;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${props => props.theme.colors.primaryDark};
    transform: translateY(-2px);
  }
`;

const FooterBottom = styled.div`
  border-top: 1px solid ${props => props.theme.colors.border};
  padding-top: ${props => props.theme.spacing.md};
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: ${props => props.theme.colors.textLight};
  font-size: ${props => props.theme.typography.fontSizes.sm};

  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    flex-direction: column;
    gap: ${props => props.theme.spacing.sm};
    text-align: center;
  }
`;

const Footer = () => {
  const { theme } = useTheme();

  return (
    <FooterWrapper theme={theme}>
      <FooterContainer theme={theme}>
        <FooterGrid theme={theme}>
          <FooterSection theme={theme}>
            <h4>
              <GiSoccerBall />
              TuTurnoYa
            </h4>
            <p>
              La plataforma líder para reservar canchas de fútbol en Bahía Blanca. 
              ¡Reservá tu cancha en segundos y jugá cuando quieras!
            </p>
            <SocialLinks theme={theme}>
              <SocialLink href="#" theme={theme}>
                <FiFacebook size={18} />
              </SocialLink>
              <SocialLink href="#" theme={theme}>
                <FiInstagram size={18} />
              </SocialLink>
              <SocialLink href="#" theme={theme}>
                <FiTwitter size={18} />
              </SocialLink>
              <SocialLink href="mailto:info@tuturno-ya.com" theme={theme}>
                <FiMail size={18} />
              </SocialLink>
            </SocialLinks>
          </FooterSection>

          <FooterSection theme={theme}>
            <h4>Para Jugadores</h4>
            <FooterLink to="/search" theme={theme}>Buscar Canchas</FooterLink>
            <FooterLink to="/register" theme={theme}>Crear Cuenta</FooterLink>
            <FooterLink to="/help" theme={theme}>Cómo Funciona</FooterLink>
            <FooterLink to="/app" theme={theme}>Descargar App</FooterLink>
          </FooterSection>

          <FooterSection theme={theme}>
            <h4>Para Propietarios</h4>
            <FooterLink to="/venue-owner/register" theme={theme}>Registrar Local</FooterLink>
            <FooterLink to="/venue-owner/login" theme={theme}>Iniciar Sesión</FooterLink>
            <FooterLink to="/pricing" theme={theme}>Precios</FooterLink>
            <FooterLink to="/support" theme={theme}>Soporte</FooterLink>
          </FooterSection>

          <FooterSection theme={theme}>
            <h4>Empresa</h4>
            <FooterLink to="/about" theme={theme}>Sobre Nosotros</FooterLink>
            <FooterLink to="/contact" theme={theme}>Contacto</FooterLink>
            <FooterLink to="/careers" theme={theme}>Trabajá con Nosotros</FooterLink>
            <FooterLink to="/blog" theme={theme}>Blog</FooterLink>
          </FooterSection>
        </FooterGrid>

        <FooterBottom theme={theme}>
          <div>
            © 2024 TuTurnoYa. Todos los derechos reservados.
          </div>
          <div>
            <FooterLink to="/privacy" theme={theme} style={{ display: 'inline', marginRight: '16px' }}>
              Privacidad
            </FooterLink>
            <FooterLink to="/terms" theme={theme} style={{ display: 'inline' }}>
              Términos
            </FooterLink>
          </div>
        </FooterBottom>
      </FooterContainer>
    </FooterWrapper>
  );
};

export default Footer;
