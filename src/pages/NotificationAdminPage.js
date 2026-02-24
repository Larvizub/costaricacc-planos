import React from 'react';
import styled from 'styled-components';
import { theme } from '../styles/GlobalStyles';
import Layout from '../components/Layout';
import Card from '../components/Card';
import { EmailNotificationSettings } from '../components/EmailNotificationSettings';
import RoleBasedComponent from '../components/RoleBasedComponent';
import Alert from '../components/Alert';

const AdminContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const PageHeader = styled.div`
  margin-bottom: ${theme.spacing.xl};
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  margin: 0 0 ${theme.spacing.sm} 0;
  color: ${theme.colors.text};
`;

const PageDescription = styled.p`
  color: ${theme.colors.textLight};
  font-size: 1.1rem;
  margin: 0;
`;

const NotificationAdminPage = () => {
  return (
    <Layout title="Administración de Notificaciones">
      <AdminContainer>
        <PageHeader>
          <PageTitle>Configuración de Notificaciones por Correo</PageTitle>
          <PageDescription>
            Gestiona las direcciones de correo para las notificaciones automáticas
          </PageDescription>
        </PageHeader>

        <RoleBasedComponent 
          allowedRoles={['admin', 'super_admin']}
          fallback={
            <Card>
              <div className="p-6">
                <Alert 
                  type="warning"
                  title="Acceso Restringido"
                  description="Solo los administradores pueden acceder a esta configuración."
                />
              </div>
            </Card>
          }
        >
          <EmailNotificationSettings />
        </RoleBasedComponent>
      </AdminContainer>
    </Layout>
  );
};

export default NotificationAdminPage;
