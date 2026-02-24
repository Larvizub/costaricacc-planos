import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ref, onValue } from 'firebase/database';
import { db } from '../firebase/firebaseConfig';
import { FaPlus, FaListAlt, FaClock, FaCheck, FaTimes, FaEye } from 'react-icons/fa';
import { theme } from '../styles/GlobalStyles';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import Table from '../components/Table';
import SearchFilters from '../components/SearchFilters';
import Alert from '../components/Alert';
import { formatDate } from '../utils/formatters';
import useAsync from '../hooks/useAsync';
import { useAuth } from '../context/AuthContext';

// Estilos para el contenedor principal
const SolicitudesContainer = styled.div`
  margin-bottom: ${theme.spacing.xl};
`;

// Estilos para la barra de herramientas
const Toolbar = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: ${theme.spacing.lg};
  gap: ${theme.spacing.md};
  
  @media (max-width: ${theme.breakpoints.sm}) {
    flex-direction: column;
    align-items: stretch;
  }
`;

// Estilos para el estado de la solicitud
const Status = styled.span`
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

// (Ticket link styles removed — ticket column hidden in the list view)

// Definición de columnas para la tabla
const getTableColumns = (navigate) => [
  {
    id: 'nombreEvento',
    label: 'Evento',
    render: (row) => row.nombreEvento,
    sortable: true
  },
  {
    id: 'salonEvento',
    label: 'Salón',
    render: (row) => row.salonEvento,
    sortable: true
  },
  {
    id: 'fechaEvento',
    label: 'Fecha evento',
    render: (row) => formatDate(row.fechaEvento),
    sortable: true
  },
  {
    id: 'fechaSolicitud',
    label: 'Fecha solicitud',
    render: (row) => formatDate(row.fechaSolicitud),
    sortable: true
  },
  {
  
    id: 'status',
    label: 'Estado',
    render: (row) => (
      <Status status={row.status}>
        {row.status === 'pendiente' && <><FaClock /> Pendiente</>}
        {row.status === 'en_revision' && <><FaListAlt /> En revisión</>}
        {row.status === 'aprobado' && <><FaCheck /> Aprobado</>}
        {row.status === 'rechazado' && <><FaTimes /> Rechazado</>}
      </Status>
    ),
    sortable: true
  },
  {
    id: 'acciones',
    label: 'Acciones',
    render: (row) => (
      <Button 
        variant="primary" 
        size="small" 
        onClick={() => navigate(`/solicitudes/${row.id}`)}
      >
        <FaEye /> Ver
      </Button>
    )
  }
];

// Opciones para el filtro de estados
const statusOptions = [
  { value: 'todos', label: 'Todos los estados' },
  { value: 'pendiente', label: 'Pendientes' },
  { value: 'en_revision', label: 'En revisión' },
  { value: 'aprobado', label: 'Aprobadas' },
  { value: 'rechazado', label: 'Rechazadas' }
];

const SolicitudesPage = () => {
  const navigate = useNavigate();
  const { loading, error } = useAsync();
  const { currentUser } = useAuth();
  
  // Estado de las solicitudes
  const [solicitudes, setSolicitudes] = useState([]);
  
  // Estado de los filtros
  const [filtros, setFiltros] = useState({
    busqueda: '',
    estado: 'todos',
    fechaDesde: '',
    fechaHasta: ''
  });
  
  // Manejar cambios en los filtros
  const handleFilterChange = (filterName, value) => {
    setFiltros(prev => ({
      ...prev,
      [filterName]: value
    }));
  };
  
  // Cargar solicitudes desde Firebase
  useEffect(() => {
    const solicitudesRef = ref(db, 'solicitudes');
    
    const unsubscribe = onValue(solicitudesRef, (snapshot) => {
      if (snapshot.exists()) {
        const solicitudesData = snapshot.val();
        const solicitudesList = Object.keys(solicitudesData).map(key => ({
          id: key,
          ...solicitudesData[key]
        }));
        
        // Ordenar por fecha de solicitud (más reciente primero)
        solicitudesList.sort((a, b) => new Date(b.fechaSolicitud) - new Date(a.fechaSolicitud));
        
        setSolicitudes(solicitudesList);
      } else {
        setSolicitudes([]);
      }
    }, (error) => {
      toast.error('Error al cargar las solicitudes: ' + error.message);
    });
    
    return () => unsubscribe();
  }, []);
  
  // Filtrar solicitudes según los criterios
  const solicitudesFiltradas = solicitudes.filter(solicitud => {
    // Filtro por texto de búsqueda
    const busquedaMatch = filtros.busqueda === '' || 
      solicitud.nombreEvento?.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
      solicitud.salonEvento?.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
      solicitud.codigoEvento?.toLowerCase().includes(filtros.busqueda.toLowerCase());
    
    // Filtro por estado
    const estadoMatch = filtros.estado === 'todos' || solicitud.status === filtros.estado;
    
    // Filtro por fecha desde
    const fechaDesdeMatch = !filtros.fechaDesde || 
      new Date(solicitud.fechaEvento) >= new Date(filtros.fechaDesde);
    
    // Filtro por fecha hasta
    const fechaHastaMatch = !filtros.fechaHasta || 
      new Date(solicitud.fechaEvento) <= new Date(filtros.fechaHasta);
    
    return busquedaMatch && estadoMatch && fechaDesdeMatch && fechaHastaMatch;
  });
  
  // Navegar a la página de creación de solicitud
  const handleNuevaSolicitud = () => {
    try {
      console.log('Intentando navegar a nueva solicitud...');
      
      // Verificar si el usuario ha iniciado sesión
      if (!currentUser) {
        toast.error('Necesitas iniciar sesión para crear una solicitud');
        navigate('/login');
        return;
      }
      
      // Navegar a la página de nueva solicitud
      toast.info('Redirigiendo a crear nueva solicitud...');
      navigate('/solicitudes/nueva');
    } catch (error) {
      console.error('Error al navegar:', error);
      toast.error('Error al navegar a la página de nueva solicitud');
    }
  };
  
  return (
    <Layout title="Solicitudes de planos">
      <SolicitudesContainer>
        <Alert 
          type="info" 
          title="Información"
          description="Aquí puede ver todas las solicitudes de planos y su estado actual."
          visible={solicitudes.length > 0}
        />
        
        <SearchFilters 
          onSearch={(value) => handleFilterChange('busqueda', value)}
          filters={[
            {
              type: 'select',
              label: 'Estado',
              options: statusOptions,
              value: filtros.estado,
              onChange: (value) => handleFilterChange('estado', value)
            },
            {
              type: 'date',
              label: 'Desde',
              value: filtros.fechaDesde,
              onChange: (value) => handleFilterChange('fechaDesde', value)
            },
            {
              type: 'date',
              label: 'Hasta',
              value: filtros.fechaHasta,
              onChange: (value) => handleFilterChange('fechaHasta', value)
            }
          ]}
        />
        
        <Toolbar>
          <Button 
            variant="primary" 
            onClick={handleNuevaSolicitud}
          >
            <FaPlus /> Nueva Solicitud
          </Button>
        </Toolbar>
        
        {loading ? (
          <Card>
            <Card.Content>
              Cargando solicitudes...
            </Card.Content>
          </Card>
        ) : error ? (
          <Alert 
            type="error"
            title="Error"
            description={error.message}
            visible={true}
          />
        ) : solicitudesFiltradas.length > 0 ? (
          <Table
            columns={getTableColumns(navigate)}
            data={solicitudesFiltradas}
            pagination
            rowsPerPage={10}
            sortable
            defaultSortField="fechaSolicitud"
            defaultSortDirection="desc"
          />
        ) : (
          <Card>
            <Card.Content>
              {solicitudes.length === 0 ? (
                <>
                  No existen solicitudes de planos registradas. 
                  Para crear una nueva solicitud, haga clic en el botón "Nueva Solicitud".
                </>
              ) : (
                <>
                  No se encontraron solicitudes que coincidan con los filtros aplicados.
                </>
              )}
            </Card.Content>
          </Card>
        )}
      </SolicitudesContainer>
    </Layout>
  );
};

export default SolicitudesPage;