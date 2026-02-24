import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { FaPaperPlane, FaTimes } from 'react-icons/fa';
import { serverTimestamp } from 'firebase/database';
import { auth } from '../firebase/firebaseConfig';
import { theme } from '../styles/GlobalStyles';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import FileUploader from '../components/FileUploader';
import * as solicitudesService from '../services/solicitudesService';
import { uploadSolicitudFiles } from '../services/storageService';
import { useAuth } from '../context/AuthContext';

// Estilos para el formulario
const FormContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const FormSection = styled.div`
  margin-bottom: ${theme.spacing.lg};
`;

const SectionTitle = styled.h3`
  font-size: 1.2rem;
  margin-bottom: ${theme.spacing.md};
  color: ${theme.colors.text};
  border-bottom: 1px solid ${theme.colors.border};
  padding-bottom: ${theme.spacing.sm};
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${theme.spacing.md};
`;

const CheckboxGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
  margin-bottom: ${theme.spacing.md};
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 1rem;
  color: ${theme.colors.text};
`;

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  cursor: pointer;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${theme.spacing.md};
  margin-top: ${theme.spacing.xl};
`;

// Esquema de validación con Yup
const validationSchema = Yup.object({
  nombreEvento: Yup.string().required('El nombre del evento es requerido'),
  salonEvento: Yup.string().required('El salón del evento es requerido'),
  fechaEvento: Yup.date()
    .transform((value, originalValue) => {
      // Permitimos valores nulos o undefined para evitar errores durante la edición
      if (!originalValue) return null;
      const date = new Date(originalValue);
      return isNaN(date) ? null : date;
    })
    .nullable()
    .required('La fecha del evento es requerida'),
  cantidadParticipantes: Yup.number()
    .transform((value, originalValue) => {
      return originalValue === '' ? undefined : value;
    })
    .required('La cantidad de participantes es requerida')
    .positive('Debe ser un número positivo')
    .integer('Debe ser un número entero'),
  tipoMontaje: Yup.string().required('El tipo de montaje es requerido'),
  orientacionMontaje: Yup.string().required('La orientación del montaje es requerida'),
  prioridad: Yup.number()
    .required('La prioridad es requerida')
    .min(1, 'Seleccione una prioridad válida')
    .max(4, 'Seleccione una prioridad válida'),
  serviciosContratados: Yup.array()
    .min(1, 'Debe seleccionar al menos un servicio contratado')
    .required('Debe seleccionar al menos un servicio contratado'),
  especificacionesAdicionales: Yup.string().nullable()
});

// Opciones para tipos de montaje
const tiposMontaje = [
  { value: '', label: 'Seleccione un tipo de montaje' },
  { value: 'auditorio', label: 'Auditorio' },
  { value: 'escuela', label: 'Escuela' },
  { value: 'banquete', label: 'Banquete' },
  { value: 'coctel', label: 'Cóctel' },
  { value: 'tipo-u', label: 'Tipo U' },
  { value: 'otro', label: 'Otro' }
];

// Opciones para orientación del montaje
const orientaciones = [
  { value: '', label: 'Seleccione una orientación' },
  { value: 'norte', label: 'Norte' },
  { value: 'sur', label: 'Sur' },
  { value: 'este', label: 'Este' },
  { value: 'oeste', label: 'Oeste' }
];

// Opciones para nivel de prioridad
const prioridades = [
  { value: 1, label: 'Baja' },
  { value: 2, label: 'Media' },
  { value: 3, label: 'Alta' },
  { value: 4, label: 'Urgente' }
];

// Página para crear una nueva solicitud
const NuevaSolicitudPage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [solicitudEnviada, setSolicitudEnviada] = useState(false);
  const { userRoles } = useAuth();
  // Estado para archivos
  const [archivos, setArchivos] = useState([]);

  // Configuración de Formik
  const formik = useFormik({
    initialValues: {
      nombreEvento: '',
      salonEvento: '',
      fechaEvento: '',
      cantidadParticipantes: '',
      tipoMontaje: '',
      orientacionMontaje: '',
      serviciosContratados: [],
      especificacionesAdicionales: '',
      prioridad: 2 // Valor por defecto para la prioridad (2 = Media)
    },
    validationSchema,
    validateOnMount: false, // Evitar validación al cargar
    validateOnChange: false, // Solo validar al hacer blur
    validateOnBlur: true,
    onSubmit: async (values) => {
      try {
        setIsSubmitting(true);
        
        // Verificar si el usuario está autenticado
        if (!auth.currentUser) {
          toast.error('Necesita iniciar sesión para crear una solicitud');
          navigate('/login');
          return;
        }
        
        // Adjuntar archivos si existen
        let archivosSubidos = [];
        let solicitudId = null;
        // Primero crea la solicitud sin archivos
        const solicitudData = {
          ...values,
          archivos: [], // se actualizará luego
          createdAt: serverTimestamp(),
          fechaSolicitud: new Date().toISOString(),
          createdBy: auth.currentUser.uid,
          createdByName: auth.currentUser.displayName || 'Usuario sin nombre',
          createdByEmail: auth.currentUser.email || 'email_no_disponible',
          status: 'pendiente',
          planoId: null
        };
        solicitudId = await solicitudesService.createSolicitud(solicitudData);
        // Subir archivos si existen
        if (archivos.length > 0) {
          archivosSubidos = await uploadSolicitudFiles(solicitudId, archivos);
          // Actualizar la solicitud con las URLs de los archivos
          await solicitudesService.updateSolicitud(solicitudId, { archivos: archivosSubidos });
        }

        // Mostrar mensaje de éxito
        toast.success('Solicitud creada con éxito');
        setSolicitudEnviada(true); // Marcar como enviada

        // Redirigir a la lista de solicitudes
        navigate('/solicitudes');
      } catch (error) {
        console.error('Error al crear la solicitud:', error);
        let errorMessage = 'Error al crear la solicitud. Por favor, inténtelo de nuevo.';
        
        // Manejar errores específicos de Firebase
        if (error.code) {
          switch (error.code) {
            case 'PERMISSION_DENIED':
              errorMessage = 'No tiene permisos para crear solicitudes';
              break;
            case 'NETWORK_ERROR':
              errorMessage = 'Error de conexión. Verifique su conexión a internet';
              break;
            default:
              errorMessage = `Error: ${error.message}`;
          }
        }
        
        toast.error(errorMessage);
      } finally {
        setIsSubmitting(false);
      }
    }
  });
  
  // Manejar cambios en los checkboxes de servicios contratados
  const handleServicioChange = (e) => {
    const { value, checked } = e.target;
    let servicios = [...formik.values.serviciosContratados];
    
    if (checked) {
      servicios.push(value);
    } else {
      servicios = servicios.filter(servicio => servicio !== value);
    }
    
    formik.setFieldValue('serviciosContratados', servicios);
  };
  
  return (
    <Layout title="Nueva Solicitud de Plano">
      <FormContainer>
        <Card elevation="medium">
          <form onSubmit={formik.handleSubmit}>
            <FormSection>
              <SectionTitle>Información del evento</SectionTitle>
              <FormRow>
                <Input
                  label="Nombre del evento"
                  name="nombreEvento"
                  type="text"
                  placeholder="Ingrese el nombre del evento"
                  value={formik.values.nombreEvento}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.nombreEvento && formik.errors.nombreEvento}
                  required
                />
                
                <Input
                  label="Salón del evento"
                  name="salonEvento"
                  type="text"
                  placeholder="Ingrese el salón donde se realizará el evento"
                  value={formik.values.salonEvento}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.salonEvento && formik.errors.salonEvento}
                  required
                />
              </FormRow>
              
              <FormRow>
                <Input
                  label="Fecha del evento"
                  name="fechaEvento"
                  type="date"
                  value={formik.values.fechaEvento}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.fechaEvento && formik.errors.fechaEvento}
                  required
                />
                
                <Input
                  label="Cantidad de participantes (pax)"
                  name="cantidadParticipantes"
                  type="number"
                  placeholder="Ingrese la cantidad de personas"
                  value={formik.values.cantidadParticipantes}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.cantidadParticipantes && formik.errors.cantidadParticipantes}
                  required
                />
              </FormRow>
            </FormSection>
            
            <FormSection>
              <SectionTitle>Detalles del montaje</SectionTitle>
              <FormRow>
                <Input
                  label="Tipo de montaje"
                  name="tipoMontaje"
                  type="select"
                  options={tiposMontaje}
                  value={formik.values.tipoMontaje}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.tipoMontaje && formik.errors.tipoMontaje}
                  required
                />
                
                <Input
                  label="Orientación del montaje"
                  name="orientacionMontaje"
                  type="select"
                  options={orientaciones}
                  value={formik.values.orientacionMontaje}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.orientacionMontaje && formik.errors.orientacionMontaje}
                  required
                />
              </FormRow>
              
              <Input
                label="Especificaciones adicionales del montaje"
                name="especificacionesAdicionales"
                type="textarea"
                placeholder="Ingrese cualquier especificación adicional relevante para el montaje"
                value={formik.values.especificacionesAdicionales}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.especificacionesAdicionales && formik.errors.especificacionesAdicionales}
              />
            </FormSection>
            
            <FormSection>
              <SectionTitle>Servicios contratados</SectionTitle>
              <CheckboxGroup>
                {formik.touched.serviciosContratados && formik.errors.serviciosContratados && (
                  <div style={{ color: theme.colors.error, marginBottom: theme.spacing.sm, fontSize: '0.8rem' }}>
                    {formik.errors.serviciosContratados}
                  </div>
                )}
                
                <CheckboxContainer>
                  <Checkbox 
                    type="checkbox" 
                    id="audiovisuales"
                    name="serviciosContratados" 
                    value="audiovisuales"
                    checked={formik.values.serviciosContratados.includes('audiovisuales')}
                    onChange={handleServicioChange}
                  />
                  <CheckboxLabel htmlFor="audiovisuales">Audiovisuales</CheckboxLabel>
                </CheckboxContainer>
                
                <CheckboxContainer>
                  <Checkbox 
                    type="checkbox" 
                    id="gastronomia"
                    name="serviciosContratados" 
                    value="gastronomia"
                    checked={formik.values.serviciosContratados.includes('gastronomia')}
                    onChange={handleServicioChange}
                  />
                  <CheckboxLabel htmlFor="gastronomia">Gastronomía</CheckboxLabel>
                </CheckboxContainer>
                
                <CheckboxContainer>
                  <Checkbox 
                    type="checkbox" 
                    id="montajes"
                    name="serviciosContratados" 
                    value="montajes"
                    checked={formik.values.serviciosContratados.includes('montajes')}
                    onChange={handleServicioChange}
                  />
                  <CheckboxLabel htmlFor="montajes">Montajes</CheckboxLabel>
                </CheckboxContainer>
              </CheckboxGroup>
            </FormSection>
            
            <FormSection>
              <SectionTitle>Prioridad de la solicitud</SectionTitle>
              <Input
                label="Nivel de prioridad"
                name="prioridad"
                type="select"
                options={prioridades}
                value={formik.values.prioridad}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.prioridad && formik.errors.prioridad}
                required
              />
            </FormSection>
            
            {/* Campo de subida de archivos solo para rol cliente */}
            {userRoles.includes('cliente') && (
              <FormSection>
                <SectionTitle>Archivos adjuntos</SectionTitle>
                <FileUploader
                  label="Subir archivos relacionados al plano"
                  name="archivos"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.zip,.rar"
                  multiple={true}
                  maxFiles={5}
                  maxSize={10}
                  value={archivos}
                  onChange={e => setArchivos(e.target.value)}
                  helperText="Formatos permitidos: PDF, imágenes, Word, ZIP. Máx 5 archivos, 10MB cada uno."
                />
              </FormSection>
            )}
            
            <ButtonGroup>
              <Button 
                variant="outline" 
                type="button" 
                onClick={() => navigate('/solicitudes')}
              >
                <FaTimes /> Cancelar
              </Button>
              
              <Button
                variant="primary" 
                type="submit" 
                disabled={isSubmitting || solicitudEnviada}
              >
                <FaPaperPlane /> {isSubmitting ? 'Enviando...' : solicitudEnviada ? 'Solicitud enviada' : 'Enviar solicitud'}
              </Button>
            </ButtonGroup>
          </form>
        </Card>
      </FormContainer>
    </Layout>
  );
};

export default NuevaSolicitudPage;
