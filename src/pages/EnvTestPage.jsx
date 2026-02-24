import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import Layout from '../components/Layout';

const Container = styled.div`
  padding: 2rem;
`;

const Card = styled.div`
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 1.5rem;
`;

const Title = styled.h1`
  margin-bottom: 1rem;
  color: ${({ theme }) => theme.colors.primary};
`;

const Subtitle = styled.h2`
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
  color: ${({ theme }) => theme.colors.primary};
`;

const EnvList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const EnvItem = styled.li`
  padding: 0.5rem 0;
  border-bottom: 1px solid #eee;
  display: flex;
  &:last-child {
    border-bottom: none;
  }
`;

const EnvName = styled.span`
  font-weight: bold;
  width: 300px;
`;

const EnvValue = styled.span`
  font-family: monospace;
  color: ${props => props.missing ? 'red' : 'green'};
`;

const EnvTestPage = () => {
  const [envVars, setEnvVars] = useState({});
  
  useEffect(() => {
    // Recopilar variables de entorno de frontend (prefijos permitidos)
    const reactEnvVars = Object.keys(import.meta.env)
      .filter(key => key.startsWith('REACT_APP_') || key.startsWith('VITE_'))
      .reduce((obj, key) => {
        obj[key] = import.meta.env[key] || '[no configurado]';
        return obj;
      }, {});
    
    setEnvVars(reactEnvVars);
  }, []);
  
  return (
    <Layout>
      <Container>
        <Title>Verificación de Variables de Entorno</Title>
        
        <Card>
          <Subtitle>Variables de entorno disponibles</Subtitle>
          <EnvList>
            {Object.keys(envVars).length > 0 ? (
              Object.keys(envVars).map(key => (
                <EnvItem key={key}>
                  <EnvName>{key}:</EnvName>
                  <EnvValue missing={envVars[key] === '[no configurado]'}>
                    {key.includes('KEY') || key.includes('SECRET') 
                      ? (envVars[key] === '[no configurado]' ? '[no configurado]' : '[configurado]')
                      : envVars[key]}
                  </EnvValue>
                </EnvItem>
              ))
            ) : (
              <EnvItem>
                <EnvName>No se encontraron variables de entorno</EnvName>
              </EnvItem>
            )}
          </EnvList>
        </Card>
        
        <Card>
          <Subtitle>Recomendaciones si las variables no aparecen:</Subtitle>
          <ol style={{ paddingLeft: '20px' }}>
            <li>Asegúrate de que el archivo <code>.env</code> existe en la raíz del proyecto</li>
            <li>Verifica que las variables comienzan con <code>REACT_APP_</code> o <code>VITE_</code></li>
            <li>Asegúrate de que no hay espacios alrededor de los signos de igual</li>
            <li><strong>Reinicia el servidor de desarrollo</strong> después de modificar el archivo <code>.env</code></li>
            <li>Si usas Docker, asegúrate de que las variables estén pasadas correctamente al contenedor</li>
          </ol>
        </Card>
      </Container>
    </Layout>
  );
};

export default EnvTestPage;
