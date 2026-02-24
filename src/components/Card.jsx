import React from 'react';
import styled from 'styled-components';
import { theme } from '../styles/GlobalStyles';

// Estilos para la tarjeta
const StyledCard = styled.div`
  background-color: ${theme.colors.card};
  border-radius: ${theme.borderRadius.medium};
  padding: ${theme.spacing.lg};
  box-shadow: ${({ elevation }) => {
    switch (elevation) {
      case 'small': return theme.shadows.small;
      case 'large': return theme.shadows.large;
      default: return theme.shadows.medium;
    }
  }};
  transition: transform ${theme.transitions.default}, box-shadow ${theme.transitions.default};
  
  ${({ hoverable }) => hoverable && `
    &:hover {
      transform: translateY(-4px);
      box-shadow: ${theme.shadows.large};
    }
  `}
  
  ${({ bordered }) => bordered && `
    border: 1px solid ${theme.colors.border};
  `}
`;

const CardHeader = styled.div`
  margin-bottom: ${theme.spacing.md};
  border-bottom: ${({ divider }) => divider ? `1px solid ${theme.colors.border}` : 'none'};
  padding-bottom: ${({ divider }) => divider ? theme.spacing.md : '0'};
`;

const CardTitle = styled.h3`
  font-size: 1.25rem;
  color: ${theme.colors.text};
  margin-bottom: ${({ subtitle }) => subtitle ? theme.spacing.xs : '0'};
`;

const CardSubtitle = styled.h4`
  font-size: 0.9rem;
  color: ${theme.colors.textLight};
  font-weight: 400;
`;

const CardContent = styled.div`
  margin-bottom: ${({ actions }) => actions ? theme.spacing.md : '0'};
`;

const CardActions = styled.div`
  display: flex;
  justify-content: ${({ align }) => {
    switch (align) {
      case 'start': return 'flex-start';
      case 'center': return 'center';
      case 'between': return 'space-between';
      default: return 'flex-end';
    }
  }};
  padding-top: ${theme.spacing.md};
  border-top: ${({ divider }) => divider ? `1px solid ${theme.colors.border}` : 'none'};
  gap: ${theme.spacing.sm};
`;

// Componente Card
const Card = ({ 
  children, 
  elevation = 'medium', 
  hoverable = false, 
  bordered = false,
  ...props 
}) => {
  return (
    <StyledCard 
      elevation={elevation} 
      hoverable={hoverable} 
      bordered={bordered}
      {...props}
    >
      {children}
    </StyledCard>
  );
};

// Sub-componentes
Card.Header = ({ children, divider = false, ...props }) => (
  <CardHeader divider={divider} {...props}>{children}</CardHeader>
);

Card.Title = ({ children, subtitle = false, ...props }) => (
  <CardTitle subtitle={subtitle} {...props}>{children}</CardTitle>
);

Card.Subtitle = ({ children, ...props }) => (
  <CardSubtitle {...props}>{children}</CardSubtitle>
);

Card.Content = ({ children, actions = false, ...props }) => (
  <CardContent actions={actions} {...props}>{children}</CardContent>
);

Card.Actions = ({ children, align = 'end', divider = false, ...props }) => (
  <CardActions align={align} divider={divider} {...props}>{children}</CardActions>
);

export default Card;
