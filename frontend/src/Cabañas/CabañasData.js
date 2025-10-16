import Cabaña1 from '../Assets/Cabaña1.svg';
import Cabaña2 from '../Assets/Cabaña2.svg';
import Cabaña3 from '../Assets/Cabaña3.svg';

export const cabanas = [
  {
    slug: 'esencial', 
    titulo: 'Esencial', 
    imagen: Cabaña1, 
    caracteristicas: 'Acogedora y funcional. Ideal para parejas o exploradores solitarios. Vista al bosque.',
    precio: 70.000, 
    capacidad: '2 personas', 
    comodidades: ['Cama Matrimonial', 'Baño completo', 'Calefacción central', 'Kitchinette (Microondas y pava eléctrica)'],
  },
  {
    slug: 'confort', 
    titulo: 'Confort', 
    imagen: Cabaña2,
    caracteristicas: 'Espacio familiar con todas las comodidades. Perfecta para el descanso después de un día de actividades.',
    precio: 130.000, 
    capacidad: '4 personas', 
    comodidades: ['Dormitorio con cama King', 'Sofá cama en el living', 'Cocina equipada (horno y heladera)', 'Terraza privada con vistas'],
  },
  {
    slug: 'premium', 
    titulo: 'Premium', 
    imagen: Cabaña3,
    caracteristicas: 'Lujo y diseño en A-Frame. Vistas panorámicas inigualables. Experiencia exclusiva en la montaña.',
    precio: 250.000, 
    capacidad: '6 personas', 
    comodidades: ['Dos dormitorios en suite', 'Ventanas panorámicas A-Frame', 'Chimenea a leña', 'Baño con bañera'],
  },
];