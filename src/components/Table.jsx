import React, { useState } from 'react';
import styled from 'styled-components';
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import { theme } from '../styles/GlobalStyles';

// Estilos para el componente Table
const TableContainer = styled.div`
  width: 100%;
  overflow-x: auto;
  border-radius: ${theme.borderRadius.medium};
  box-shadow: ${theme.shadows.small};
  border: 1px solid ${theme.colors.border};
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  border-spacing: 0;
  font-size: 0.95rem;
`;

const TableHead = styled.thead`
  background-color: ${({ variant }) => {
    switch (variant) {
      case 'secondary': return theme.colors.secondary + '20';
      default: return theme.colors.primary + '10';
    }
  }};
  
  th {
    color: ${theme.colors.text};
    font-weight: 600;
    position: sticky;
    top: 0;
    z-index: 1;
  }
`;

const TableHeaderCell = styled.th`
  padding: ${theme.spacing.md};
  text-align: ${({ align }) => align || 'left'};
  border-bottom: 1px solid ${theme.colors.border};
  white-space: nowrap;
  
  ${({ sortable }) => sortable && `
    cursor: pointer;
    
    &:hover {
      background-color: ${theme.colors.primary}20;
    }
  `}
`;

const TableBody = styled.tbody`
  tr {
    &:not(:last-child) {
      border-bottom: 1px solid ${theme.colors.border};
    }
    
    &:hover {
      background-color: ${theme.colors.background};
    }
  }
`;

const TableCell = styled.td`
  padding: ${theme.spacing.md};
  text-align: ${({ align }) => align || 'left'};
  color: ${({ highlight }) => highlight ? theme.colors.primary : theme.colors.text};
  font-weight: ${({ bold }) => bold ? '600' : 'normal'};
  ${({ borderRight }) => borderRight && `border-right: 1px solid ${theme.colors.border}`};
`;

const SortIcon = styled.span`
  display: inline-flex;
  align-items: center;
  margin-left: ${theme.spacing.xs};
`;

const EmptyState = styled.tr`
  td {
    text-align: center;
    padding: ${theme.spacing.xl};
    color: ${theme.colors.textLight};
    font-style: italic;
  }
`;

const Pagination = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${theme.spacing.md};
  border-top: 1px solid ${theme.colors.border};
  background-color: ${theme.colors.card};
`;

const PageInfo = styled.div`
  color: ${theme.colors.textLight};
  font-size: 0.9rem;
`;

const PageControls = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

const PageButton = styled.button`
  background-color: ${({ active }) => active ? theme.colors.primary : 'transparent'};
  color: ${({ active }) => active ? '#fff' : theme.colors.text};
  border: 1px solid ${({ active }) => active ? theme.colors.primary : theme.colors.border};
  border-radius: ${theme.borderRadius.small};
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  cursor: ${({ disabled }) => disabled ? 'not-allowed' : 'pointer'};
  opacity: ${({ disabled }) => disabled ? 0.5 : 1};
  
  &:hover:not(:disabled) {
    background-color: ${({ active }) => active ? theme.colors.primary : theme.colors.background};
  }
`;

/**
 * Componente Table para mostrar datos en formato tabular
 * @param {object} props - Propiedades del componente
 * @returns {JSX.Element} Componente Table
 */
const Table = ({ 
  columns,
  data,
  variant = 'primary',
  emptyMessage = 'No hay datos para mostrar',
  pagination = false,
  pageSize = 10,
  currentPage: propCurrentPage = 1,
  totalItems,
  onPageChange,
  onSort,
  sortConfig,
  clickableRows = false,
  onRowClick
}) => {
  const [currentPage, setCurrentPage] = useState(propCurrentPage);
  
  // Si no hay datos, mostrar mensaje
  if (!data || data.length === 0) {
    return (
      <TableContainer>
        <StyledTable>
          <TableHead variant={variant}>
            <tr>
              {columns.map((column, index) => (
                <TableHeaderCell
                  key={index}
                  align={column.align}
                >
                  {column.title || column.label}
                </TableHeaderCell>
              ))}
            </tr>
          </TableHead>
          <TableBody>
            <EmptyState>
              <td colSpan={columns.length}>
                {emptyMessage}
              </td>
            </EmptyState>
          </TableBody>
        </StyledTable>
      </TableContainer>
    );
  }
  
  // Manejar el clic en encabezados para ordenamiento
  const handleHeaderClick = (column) => {
    if (column.sortable && onSort) {
      onSort(column.key || column.id);
    }
  };
  
  // Obtener icono de ordenamiento
  const getSortIcon = (columnKey) => {
    if (!sortConfig) return <FaSort />;
    
    if (sortConfig.key === columnKey) {
      return sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />;
    }
    
    return <FaSort />;
  };
  
  // Manejar cambio de página
  const handlePageChange = (page) => {
    setCurrentPage(page);
    if (onPageChange) {
      onPageChange(page);
    }
  };
  
  // Datos a mostrar (paginados o todos)
  const displayData = pagination && !onPageChange
    ? data.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : data;
  
  // Calcular información de paginación
  const totalPages = Math.ceil(totalItems / pageSize) || Math.ceil(data.length / pageSize);
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems || data.length);
  
  return (
    <TableContainer>
      <StyledTable>
        <TableHead variant={variant}>
          <tr>
            {columns.map((column, index) => (
              <TableHeaderCell
                key={index}
                align={column.align}
                sortable={column.sortable}
                onClick={() => column.sortable && handleHeaderClick(column)}
              >
                {column.title || column.label}
                {column.sortable && (
                  <SortIcon>
                    {getSortIcon(column.key || column.id)}
                  </SortIcon>
                )}
              </TableHeaderCell>
            ))}
          </tr>
        </TableHead>
        <TableBody>
          {displayData.map((row, rowIndex) => (
            <tr 
              key={row.id || rowIndex}
              onClick={() => clickableRows && onRowClick && onRowClick(row)}
              style={clickableRows ? { cursor: 'pointer' } : {}}
            >
              {columns.map((column, colIndex) => (
                <TableCell 
                  key={colIndex}
                  align={column.align}
                  highlight={column.highlight}
                  bold={column.bold}
                  borderRight={column.borderRight}
                >
                  {column.render ? column.render(row) : row[column.key]}
                </TableCell>
              ))}
            </tr>
          ))}
        </TableBody>
      </StyledTable>
      
      {pagination && totalPages > 1 && (
        <Pagination>
          <PageInfo>
            Mostrando {startItem} a {endItem} de {totalItems || data.length} resultados
          </PageInfo>
          <PageControls>
            <PageButton
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              Anterior
            </PageButton>
            
            {[...Array(totalPages).keys()].map(pageNumber => {
              // Mostrar primera página, última página y páginas alrededor de la página actual
              const page = pageNumber + 1;
              if (
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1)
              ) {
                return (
                  <PageButton
                    key={page}
                    active={currentPage === page}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </PageButton>
                );
              }
              
              // Mostrar puntos suspensivos para páginas omitidas
              if (
                (page === 2 && currentPage > 3) ||
                (page === totalPages - 1 && currentPage < totalPages - 2)
              ) {
                return <span key={page}>...</span>;
              }
              
              return null;
            })}
            
            <PageButton
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              Siguiente
            </PageButton>
          </PageControls>
        </Pagination>
      )}
    </TableContainer>
  );
};

export default Table;
