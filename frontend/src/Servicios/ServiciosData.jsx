import gimnasio from '../assets/gym.webp';
import spa from '../assets/spa.webp';
import restaurante from '../assets/restaurante.webp';

export const servicios = [
  {
    slug: 'gimnasio',
    titulo: 'Gimnasio',
    imagen: gimnasio,
    descripcion: 'Espacio moderno con equipamiento para fuerza y cardio.',
    horarios: 'Lunes a Domingo: 7:00 a 22:00',
    beneficios: 'Acceso libre para huéspedes. Toallas incluidas.',
    comodidades: ['Cintas de correr', 'Bicicletas', 'Pesas libres', 'Máquinas multifunción'],
  },
  {
    slug: 'spa',
    titulo: 'Spa',
    imagen: spa,
    descripcion: 'Relajación total con masajes, sauna y circuitos de agua.',
    horarios: 'Martes a Domingo: 10:00 a 20:00',
    beneficios: 'Reserva previa. Infusiones de cortesía.',
    comodidades: ['Sauna seco', 'Sauna húmedo', 'Masajes', 'Jacuzzi'],
  },
  {
    slug: 'restaurante',
    titulo: 'Restaurante',
    imagen: restaurante,
    descripcion: 'Gastronomía regional con productos frescos de temporada.',
    horarios: 'Lunes a Domingo: 12:00 a 15:30 y 20:00 a 23:30',
    beneficios: 'Menú para celíacos y vegetarianos.',
    comodidades: ['Cava de vinos', 'Terraza', 'Opciones vegetarianas', 'Opciones sin TACC'],
  },
];
