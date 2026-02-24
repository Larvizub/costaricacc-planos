import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { theme } from '../styles/GlobalStyles';
import { toast } from 'react-toastify';
import { ref, onValue, query } from 'firebase/database';
import { db } from '../firebase/firebaseConfig';
import Button from '../components/Button';
import Alert from '../components/Alert';
import { FaSearch, FaEye } from 'react-icons/fa';
import Layout from '../components/Layout';
import { formatDate } from '../utils/formatters';

// Estilos para el contenedor principal
const PlanosContainer = styled.div`
  margin-bottom: ${theme.spacing.xl};
`;

// Estilos para la barra de herramientas
const Toolbar = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.lg};
  
  @media (min-width: ${theme.breakpoints.md}) {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
  }
`;

const SearchContainer = styled.div`
  display: flex;
  flex: 1;
  max-width: 100%;
  position: relative;
  margin-bottom: ${theme.spacing.md};
  
  @media (min-width: ${theme.breakpoints.md}) {
    max-width: 400px;
    margin-bottom: 0;
  }
  
  input {
    padding-left: 40px;
  }
`;

// Definir los componentes que faltan
const SearchIcon = styled.div`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: ${theme.colors.textLight};
  display: flex;
  align-items: center;
  font-size: 0.9rem;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: ${theme.spacing.sm} ${theme.spacing.sm} ${theme.spacing.sm} 40px;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.medium};
  font-size: 0.9rem;
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 2px ${theme.colors.primary}30;
  }
`;

const FilterButton = styled.button`
  padding: ${theme.spacing.xs} ${theme.spacing.md};
  background-color: ${({ active }) => active ? theme.colors.primary : 'transparent'};
  color: ${({ active }) => active ? 'white' : theme.colors.text};
  border: 1px solid ${({ active }) => active ? theme.colors.primary : theme.colors.border};
  border-radius: ${theme.borderRadius.small};
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${({ active }) => active ? theme.colors.primary : theme.colors.background};
  }
`;

const ActionButtons = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing.sm};
`;

// Estilos para los filtros
const FilterBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing.xs};
  margin-top: ${theme.spacing.md};
  width: 100%;
  
  @media (min-width: ${theme.breakpoints.md}) {
    margin-top: 0;
  }
`;

// Estilos para la tabla de planos
const TableContainer = styled.div`
  overflow-x: auto;
  margin-bottom: ${theme.spacing.xl};
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  border-spacing: 0;
  font-size: 0.95rem;
`;

const TableHead = styled.thead`
  background-color: ${theme.colors.background};
  border-bottom: 1px solid ${theme.colors.border};
`;

const TableHeadCell = styled.th`
  text-align: left;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  font-weight: 600;
  color: ${theme.colors.text};
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr`
  border-bottom: 1px solid ${theme.colors.border};
  
  &:hover {
    background-color: ${theme.colors.background};
  }
`;

const TableCell = styled.td`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  vertical-align: middle;
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.small};
  font-size: 0.85rem;
  font-weight: 500;
  gap: ${theme.spacing.xs};
  
  background-color: ${({ status }) => {
    switch (status) {
      case 'aprobado': return `${theme.colors.success}20`;
      case 'rechazado': return `${theme.colors.error}20`;
      case 'en_revision': return `${theme.colors.info}20`;
      default: return `${theme.colors.warning}20`;
    }
  }};
  
  color: ${({ status }) => {
    switch (status) {
      case 'aprobado': return theme.colors.success;
      case 'rechazado': return theme.colors.error;
      case 'en_revision': return theme.colors.info;
      default: return theme.colors.warning;
    }
  }};
`;

const ActionsContainer = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
`;

// Mensaje de no hay datos
const EmptyMessage = styled.div`
  padding: ${theme.spacing.xl};
  text-align: center;
  color: ${theme.colors.textLight};
  background-color: ${theme.colors.card};
  border-radius: ${theme.borderRadius.medium};
  box-shadow: ${theme.shadows.small};
  border: 1px solid ${theme.colors.border};
`;

// Truncar texto largo
const truncateText = (text, maxLength = 30) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Página de Planos
const PlanosPage = () => {
  const navigate = useNavigate();
  const [solicitudes, setSolicitudes] = useState([]);
  const [filteredSolicitudes, setFilteredSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('todos');
  
  // Cargar solicitudes con planos desde Firebase
  useEffect(() => {
    // Consulta para obtener todas las solicitudes que tengan planos
    const solicitudesRef = query(ref(db, 'solicitudes'));
    
    const unsubscribe = onValue(solicitudesRef, (snapshot) => {
      try {
        setLoading(true);
        
        if (snapshot.exists()) {
          const solicitudesData = [];
          snapshot.forEach((childSnapshot) => {
            const solicitud = {
              id: childSnapshot.key,
              ...childSnapshot.val()
            };
            
            // Incluir solicitudes que tengan cualquier tipo de información de planos
            // o que estén en cualquier estado relevante
            const estadosValidos = ['pendiente', 'aprobado', 'rechazado', 'en_revision'];
            if (
              solicitud.planoURL || 
              solicitud.planoId || 
              solicitud.planoSubidoEn || 
              (estadosValidos.includes(solicitud.status))
            ) {
              solicitudesData.push(solicitud);
            }
          });
          
          // Ordenar por fecha de creación (más recientes primero)
          solicitudesData.sort((a, b) => {
            const fechaA = a.planoSubidoEn || a.createdAt || 0;
            const fechaB = b.planoSubidoEn || b.createdAt || 0;
            return new Date(fechaB) - new Date(fechaA);
          });
          
          setSolicitudes(solicitudesData);
          setFilteredSolicitudes(solicitudesData);
        } else {
          setSolicitudes([]);
          setFilteredSolicitudes([]);
        }
      } catch (err) {
        console.error('Error al cargar planos:', err);
        setError('Error al cargar la lista de planos');
        toast.error('Error al cargar los planos');
      } finally {
        setLoading(false);
      }
    }, (err) => {
      console.error('Error en la suscripción a planos:', err);
      setError('Error al conectar con la base de datos');
      setLoading(false);
      toast.error('Error de conexión con la base de datos');
    });
    
    return () => unsubscribe();
  }, []);
  
  // Actualizar filtros cuando cambia el término de búsqueda o el filtro activo
  useEffect(() => {
    let filtered = [...solicitudes];
    
    // Aplicar filtro por estado
    if (activeFilter !== 'todos') {
      filtered = filtered.filter(solicitud => {
        // Normalizar el estado para evitar problemas de espacios, mayúsculas, etc.
        let status = (solicitud.status || 'pendiente').toString().trim().toLowerCase();
        let filter = activeFilter.toString().trim().toLowerCase();
        return status === filter;
      });
    }
    
    // Aplicar búsqueda de texto
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(solicitud => {
        // Buscar en múltiples campos, verificando que existan antes
        return (
          (solicitud.nombreEvento && solicitud.nombreEvento.toLowerCase().includes(searchLower)) ||
          (solicitud.salonEvento && solicitud.salonEvento.toLowerCase().includes(searchLower)) ||
          (solicitud.codigoEvento && solicitud.codigoEvento.toLowerCase().includes(searchLower)) ||
          (solicitud.createdByName && solicitud.createdByName.toLowerCase().includes(searchLower)) ||
          (solicitud.createdByEmail && solicitud.createdByEmail.toLowerCase().includes(searchLower))
        );
      });
    }
    
    setFilteredSolicitudes(filtered);
  }, [searchTerm, activeFilter, solicitudes]);
  
  // Manejar cambio de filtro
  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
  };
  
  // Ver detalle de un plano
  const handleViewPlano = (plano) => {
    console.log('Ver plano:', plano);
    // Implementación para ver el plano
    navigate(`/solicitudes/${plano.id}`);
  };
  
  // eslint-disable-next-line no-unused-vars
  const handleDownloadPlano = (plano) => {
    console.log('Descargar plano:', plano);
    // Implementación para descargar el plano
  };

  // eslint-disable-next-line no-unused-vars
  const handleAprobarPlano = (plano) => {
    console.log('Aprobar plano:', plano);
    // Implementación para aprobar el plano
  };

  return (
    <Layout title="Gestión de Planos">
      <PlanosContainer>
        <Toolbar>
          {/* Buscador */}
          <SearchContainer>
            <SearchIcon>
              <FaSearch />
            </SearchIcon>
            <SearchInput 
              type="text" 
              placeholder="Buscar planos..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchContainer>
          
          {/* Botones de acción principales agrupados */}
          <ActionButtons>
            <Button 
              variant="outlined" 
              onClick={() => navigate('/solicitudes')}
              style={{ marginRight: theme.spacing.sm }}
            >
              Ver solicitudes
            </Button>
            
            <Button 
              variant="primary" 
              onClick={() => navigate('/solicitudes')}
            >
              Ver todas las solicitudes
            </Button>
          </ActionButtons>
        </Toolbar>
        
        {/* Filtros agrupados en una barra separada */}
        <FilterBar>
          <FilterButton
            active={activeFilter === 'todos'}
            onClick={() => handleFilterChange('todos')}
          >
            Todos
          </FilterButton>
          <FilterButton
            active={activeFilter === 'aprobado'}
            onClick={() => handleFilterChange('aprobado')}
          >
            Aprobado
          </FilterButton>
          <FilterButton
            active={activeFilter === 'rechazado'}
            onClick={() => handleFilterChange('rechazado')}
          >
            Rechazado
          </FilterButton>
          <FilterButton
            active={activeFilter === 'en_revision'}
            onClick={() => handleFilterChange('en_revision')}
          >
            En revisión
          </FilterButton>
        </FilterBar>
        
        {loading ? (
          <EmptyMessage>Cargando planos...</EmptyMessage>
        ) : error ? (
          <div>
            <Alert 
              type="error"
              title="Error"
              description={error}
              visible={true}
            />
          </div>
        ) : filteredSolicitudes.length > 0 ? (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeadCell>Evento</TableHeadCell>
                  <TableHeadCell>Salón</TableHeadCell>
                  <TableHeadCell>Fecha evento</TableHeadCell>
                  <TableHeadCell>Subido el</TableHeadCell>
                  <TableHeadCell>Estado</TableHeadCell>
                  <TableHeadCell>Archivos</TableHeadCell>
                  <TableHeadCell>Acciones</TableHeadCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredSolicitudes.map((solicitud) => (
                  <TableRow key={solicitud.id}>
                    <TableCell>{truncateText(solicitud.nombreEvento || 'Sin nombre')}</TableCell>
                    <TableCell>{truncateText(solicitud.salonEvento || 'Sin salón')}</TableCell>
                    <TableCell>{solicitud.fechaEvento ? formatDate(solicitud.fechaEvento) : 'No disponible'}</TableCell>
                    <TableCell>{solicitud.planoSubidoEn ? formatDate(solicitud.planoSubidoEn) : 'No disponible'}</TableCell>
                    <TableCell>
                      <StatusBadge status={solicitud.status || 'pendiente'}>
                        {solicitud.status === 'pendiente' && 'Pendiente'}
                        {solicitud.status === 'en_revision' && 'En revisión'}
                        {solicitud.status === 'aprobado' && 'Aprobado'}
                        {solicitud.status === 'rechazado' && 'Rechazado'}
                        {!solicitud.status && 'Pendiente'}
                      </StatusBadge>
                    </TableCell>
                    <TableCell>
                      {Array.isArray(solicitud.archivos) && solicitud.archivos.length > 0 ? (
                        solicitud.archivos.map((archivo, idx) => (
                          <a
                            key={idx}
                            href={archivo.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ display: 'block', marginBottom: 4 }}
                          >
                            {archivo.name}
                          </a>
                        ))
                      ) : (
                        <span style={{ color: theme.colors.textLight }}>Sin archivos</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <ActionsContainer>
                        <Button
                          variant="primary"
                          size="small"
                          onClick={() => handleViewPlano(solicitud)}
                        >
                          <FaEye /> Ver
                        </Button>
                      </ActionsContainer>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <EmptyMessage>
            No se encontraron planos que coincidan con los criterios de búsqueda.
          </EmptyMessage>
        )}
      </PlanosContainer>
    </Layout>
  );
};

export default PlanosPage;
