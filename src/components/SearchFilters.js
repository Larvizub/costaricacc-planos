import React, { useState } from 'react';
import styled from 'styled-components';
import { FaSearch, FaFilter, FaTimes, FaCalendarAlt } from 'react-icons/fa';
import Button from './Button';
import Input from './Input';
import { theme } from '../styles/GlobalStyles';

// Estilos del componente
const FiltersContainer = styled.div`
  background-color: ${theme.colors.card};
  border-radius: ${theme.borderRadius.medium};
  padding: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.lg};
  box-shadow: ${theme.shadows.small};
  border: 1px solid ${theme.colors.border};
`;

const SearchRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const SearchInput = styled.div`
  flex: 1;
  position: relative;
  
  input {
    padding-right: 40px;
  }
  
  .search-icon {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: ${theme.colors.textLight};
  }
`;

const FiltersToggle = styled.button`
  background: none;
  border: none;
  color: ${theme.colors.primary};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  cursor: pointer;
  font-size: 0.9rem;
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.small};
  
  &:hover {
    background-color: ${theme.colors.primary}10;
  }
`;

const ExpandedFilters = styled.div`
  margin-top: ${theme.spacing.lg};
  border-top: 1px solid ${theme.colors.border};
  padding-top: ${theme.spacing.lg};
  display: ${({ visible }) => (visible ? 'block' : 'none')};
`;

const FiltersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.lg};
`;

const FilterActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${theme.spacing.md};
`;

const ActiveFilters = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing.sm};
  margin-top: ${theme.spacing.md};
`;

const FilterBadge = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  background-color: ${theme.colors.primary}15;
  color: ${theme.colors.primary};
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.small};
  font-size: 0.9rem;
  
  .remove-filter {
    cursor: pointer;
    display: flex;
    align-items: center;
    
    &:hover {
      color: ${theme.colors.error};
    }
  }
`;

/**
 * Componente para filtros de búsqueda
 * @param {object} props - Propiedades del componente
 * @returns {JSX.Element} Componente de filtros
 */
const SearchFilters = ({
  onSearch,
  filters = [],
  initialValues = {},
  onFilter,
  showActiveFilters = true
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterValues, setFilterValues] = useState(initialValues);
  const [activeFilters, setActiveFilters] = useState([]);
  
  // Manejar búsqueda
  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchTerm);
    }
  };
  
  // Alternar visibilidad de filtros
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };
  
  // Manejar cambio en los filtros
  const handleFilterChange = (name, value) => {
    setFilterValues({
      ...filterValues,
      [name]: value
    });
  };
  
  // Aplicar filtros
  const applyFilters = () => {
    const filtersToApply = {};
    const newActiveFilters = [];
    
    // Recorrer todos los filtros y agregar solo los que tienen valor
    Object.keys(filterValues).forEach(key => {
      const value = filterValues[key];
      
      // Solo agregar si tiene valor
      if (value && value !== '') {
        filtersToApply[key] = value;
        
        // Buscar el filtro para obtener su etiqueta
        const filter = filters.find(f => f.name === key);
        if (filter) {
          // Para filtros tipo select, buscar la opción seleccionada
          let displayValue = value;
          if (filter.type === 'select' && filter.options) {
            const option = filter.options.find(opt => opt.value === value);
            if (option) {
              displayValue = option.label;
            }
          }
          
          newActiveFilters.push({
            name: key,
            label: filter.label,
            value: value,
            displayValue: displayValue
          });
        }
      }
    });
    
    setActiveFilters(newActiveFilters);
    
    if (onFilter) {
      onFilter(filtersToApply);
    }
  };
  
  // Limpiar filtros
  const clearFilters = () => {
    setFilterValues({});
    setActiveFilters([]);
    
    if (onFilter) {
      onFilter({});
    }
  };
  
  // Eliminar un filtro específico
  const removeFilter = (filterName) => {
    const updatedFilters = { ...filterValues };
    delete updatedFilters[filterName];
    
    setFilterValues(updatedFilters);
    setActiveFilters(activeFilters.filter(filter => filter.name !== filterName));
    
    if (onFilter) {
      onFilter(updatedFilters);
    }
  };
  
  // Renderizar los campos de filtro según su tipo
  const renderFilterField = (filter) => {
    const value = filterValues[filter.name] || '';
    
    switch (filter.type) {
      case 'select':
        return (
          <Input
            key={filter.name}
            type="select"
            label={filter.label}
            name={filter.name}
            placeholder={filter.placeholder}
            options={filter.options}
            value={value}
            onChange={(e) => handleFilterChange(filter.name, e.target.value)}
          />
        );
      case 'date':
        return (
          <Input
            key={filter.name}
            type="date"
            label={filter.label}
            name={filter.name}
            value={value}
            icon={<FaCalendarAlt />}
            onChange={(e) => handleFilterChange(filter.name, e.target.value)}
          />
        );
      case 'dateRange':
        return (
          <div key={filter.name} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: theme.spacing.sm }}>
            <Input
              type="date"
              label={`${filter.label} desde`}
              name={`${filter.name}From`}
              value={filterValues[`${filter.name}From`] || ''}
              icon={<FaCalendarAlt />}
              onChange={(e) => handleFilterChange(`${filter.name}From`, e.target.value)}
            />
            <Input
              type="date"
              label={`${filter.label} hasta`}
              name={`${filter.name}To`}
              value={filterValues[`${filter.name}To`] || ''}
              icon={<FaCalendarAlt />}
              onChange={(e) => handleFilterChange(`${filter.name}To`, e.target.value)}
            />
          </div>
        );
      default:
        return (
          <Input
            key={filter.name}
            type="text"
            label={filter.label}
            name={filter.name}
            placeholder={filter.placeholder}
            value={value}
            onChange={(e) => handleFilterChange(filter.name, e.target.value)}
          />
        );
    }
  };
  
  return (
    <FiltersContainer>
      <form onSubmit={handleSearch}>
        <SearchRow>
          <SearchInput>
            <Input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="search-icon">
              <FaSearch />
            </div>
          </SearchInput>
          
          <Button 
            type="submit" 
            variant="primary"
          >
            Buscar
          </Button>
          
          {filters.length > 0 && (
            <FiltersToggle type="button" onClick={toggleFilters}>
              <FaFilter />
              {showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
            </FiltersToggle>
          )}
        </SearchRow>
      </form>
      
      {filters.length > 0 && (
        <ExpandedFilters visible={showFilters}>
          <FiltersGrid>
            {filters.map(filter => renderFilterField(filter))}
          </FiltersGrid>
          
          <FilterActions>
            <Button 
              variant="text" 
              onClick={clearFilters}
            >
              Limpiar filtros
            </Button>
            <Button 
              variant="primary" 
              onClick={applyFilters}
            >
              Aplicar filtros
            </Button>
          </FilterActions>
        </ExpandedFilters>
      )}
      
      {showActiveFilters && activeFilters.length > 0 && (
        <ActiveFilters>
          {activeFilters.map((filter, index) => (
            <FilterBadge key={index}>
              {filter.label}: {filter.displayValue}
              <span 
                className="remove-filter" 
                onClick={() => removeFilter(filter.name)}
              >
                <FaTimes />
              </span>
            </FilterBadge>
          ))}
        </ActiveFilters>
      )}
    </FiltersContainer>
  );
};

export default SearchFilters;
