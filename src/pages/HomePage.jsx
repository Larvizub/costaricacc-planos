import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Legend, LabelList } from 'recharts';
import dayjs from 'dayjs';
import { theme } from '../styles/GlobalStyles';
import Layout from '../components/Layout';
import { db } from '../firebase/firebaseConfig';
import { ref, get } from 'firebase/database';
import Button from '../components/Button';
import Card from '../components/Card';
import Logo from '../components/Logo';

// Estilos para la sección del banner
const HeroSection = styled.section`
  background: linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.primaryDark});
  color: white;
  border-radius: ${theme.borderRadius.large};
  padding: ${theme.spacing.xl} ${theme.spacing.xxl};
  margin-bottom: ${theme.spacing.xl};
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  position: relative;
  overflow: hidden;
  
  &:before {
    content: '';
    position: absolute;
    top: -50px;
    right: -50px;
    width: 200px;
    height: 200px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
  }
  
  &:after {
    content: '';
    position: absolute;
    bottom: -30px;
    left: 30%;
    width: 120px;
    height: 120px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
  }
`;

const HeroLogo = styled.div`
  margin-bottom: ${theme.spacing.md};
  
  img {
    max-width: 220px;
    height: auto;
    filter: brightness(0) invert(1);
  }
`;

const HeroTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: ${theme.spacing.md};
  position: relative;
  z-index: 1;
`;

const HeroSubtitle = styled.p`
  font-size: 1.1rem;
  margin-bottom: ${theme.spacing.lg};
  max-width: 600px;
  line-height: 1.6;
  position: relative;
  z-index: 1;
`;

// Estilos para la sección de características
const FeaturesSection = styled.section`
  margin-bottom: ${theme.spacing.xl};
`;

const SectionTitle = styled.h2`
  font-size: 1.75rem;
  color: ${theme.colors.text};
  margin-bottom: ${theme.spacing.lg};
  text-align: center;
  position: relative;
  
  &:after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 3px;
    background-color: ${theme.colors.primary};
  }
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${theme.spacing.lg};

  @media (min-width: 900px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const FeatureCard = styled(Card)`
  text-align: center;
  padding: ${theme.spacing.xl};
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
  }
`;


const FeatureTitle = styled.h3`
  font-size: 1.2rem;
  margin-bottom: ${theme.spacing.sm};
`;

// Página de inicio
const HomePage = () => {
  const navigate = useNavigate();
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSolicitudes = async () => {
      try {
        const snapshot = await get(ref(db, 'solicitudes'));
        if (snapshot.exists()) {
          const data = snapshot.val();
          const arr = Object.values(data);
          setSolicitudes(arr);
        } else {
          setSolicitudes([]);
        }
      } catch (err) {
        setSolicitudes([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSolicitudes();
  }, []);

  // Procesar datos para los gráficos
  const statusCounts = solicitudes.reduce((acc, s) => {
    const status = (s.status || 'pendiente').toLowerCase();
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});
  const statusData = Object.keys(statusCounts).map(key => ({ name: key.charAt(0).toUpperCase() + key.slice(1), value: statusCounts[key] }));

  // Solicitudes por mes (últimos 6 meses)
  const solicitudesPorMes = Array(6).fill(0).map((_, i) => {
    const month = dayjs().subtract(5 - i, 'month');
    const label = month.format('MMM YY');
    const count = solicitudes.filter(s => s.createdAt && dayjs(s.createdAt).isSame(month, 'month')).length;
    return { month: label, count };
  });


  // Servicios contratados

  // Tiempo de aprobación por departamento
  // Se asume que cada solicitud tiene un historial con fechas y estados por grupo
  const areaKeys = ['areas_sostenibilidad', 'audiovisuales', 'gastronomia', 'gestion_proteccion'];
  const areaNombres = {
    areas_sostenibilidad: 'Áreas y Sostenibilidad',
    audiovisuales: 'Audiovisuales',
    gastronomia: 'Gastronomía',
    gestion_proteccion: 'Gestión de la Protección'
  };
  // Calcular duración interna de cada etapa en horas promedio
  const tiemposPorArea = areaKeys.map((areaKey, index) => {
    // Para cada solicitud, calcular duración desde la entrada de la etapa hasta su aprobación
    const durations = solicitudes.map(s => {
      const entrance = index === 0
        ? s.createdAt
        : s.approvals?.[areaKeys[index - 1]]?.approved_at;
      const exit = s.approvals?.[areaKey]?.approved_at;
      const start = entrance ? dayjs(entrance) : null;
      const end = exit ? dayjs(exit) : null;
      if (start && start.isValid() && end && end.isValid()) {
        return end.diff(start, 'hour', true);
      }
      return null;
    }).filter(d => d !== null);
    const average = durations.length > 0
      ? Math.round(durations.reduce((sum, d) => sum + d, 0) / durations.length)
      : 0;
    return {
      area: areaNombres[areaKey] || areaKey,
      horas: average
    };
  });

  // Solicitudes por usuario
  const usuariosSolicitudes = {};
  solicitudes.forEach(s => {
    const usuario = s.createdByEmail || s.createdByName || 'Desconocido';
    usuariosSolicitudes[usuario] = (usuariosSolicitudes[usuario] || 0) + 1;
  });
  const usuariosData = Object.keys(usuariosSolicitudes).map(usuario => ({ usuario, cantidad: usuariosSolicitudes[usuario] }));

  const COLORS = ['#00830e', '#3498db', '#f39c12', '#e74c3c', '#9b59b6'];

  return (
    <Layout>
      <HeroSection>
        <HeroLogo>
          <Logo variant="white" width="220px" />
        </HeroLogo>
        <HeroTitle>App de Aprobación de Planos</HeroTitle>
        <HeroSubtitle>
          Simplificamos el proceso de solicitud, creación y aprobación de planos para todos los eventos 
          del Centro de Convenciones de Costa Rica.
        </HeroSubtitle>
        <Button 
          variant="secondary" 
          size="large" 
          onClick={() => navigate('/solicitudes/nueva')}
        >
          Crear una solicitud
        </Button>
      </HeroSection>

      <FeaturesSection>
        <SectionTitle>Dashboard de Solicitudes</SectionTitle>
        {loading ? (
          <div style={{ textAlign: 'center', margin: '40px 0' }}>Cargando datos...</div>
        ) : (
          <FeaturesGrid>
            <FeatureCard>
              <FeatureTitle>Solicitudes por Estado</FeatureTitle>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </FeatureCard>
            <FeatureCard>
              <FeatureTitle>Solicitudes por Mes (últimos 6 meses)</FeatureTitle>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={solicitudesPorMes}>
                  <XAxis dataKey="month" />
                  <YAxis allowDecimals={false} />
                  <Bar dataKey="count" fill="#00830e" />
                  <RechartsTooltip />
                  <Legend />
                </BarChart>
              </ResponsiveContainer>
            </FeatureCard>
            <FeatureCard>
              <FeatureTitle>Tiempo de Aprobación por Departamento (horas promedio)</FeatureTitle>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={tiemposPorArea}>
                  <XAxis dataKey="area" tick={{ fontSize: 12 }} interval={0} angle={-20} textAnchor="end" />
                  <YAxis allowDecimals={false} />
                  <Bar dataKey="horas" name="Horas promedio" fill="#f39c12">
                    <LabelList dataKey="horas" position="top" formatter={value => `${value}h`} />
                  </Bar>
                  <RechartsTooltip formatter={(value) => [`${value}h`, 'Promedio']} />
                  <Legend />
                </BarChart>
              </ResponsiveContainer>
            </FeatureCard>
            <FeatureCard>
              <FeatureTitle>Solicitudes por Usuario</FeatureTitle>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={usuariosData}>
                  <XAxis dataKey="usuario" tick={{ fontSize: 12 }} interval={0} angle={-30} textAnchor="end" />
                  <YAxis allowDecimals={false} />
                  <Bar dataKey="cantidad" fill="#3498db" />
                  <RechartsTooltip />
                  <Legend />
                </BarChart>
              </ResponsiveContainer>
            </FeatureCard>
          </FeaturesGrid>
        )}
      </FeaturesSection>
    </Layout>
  );
};

export default HomePage;
