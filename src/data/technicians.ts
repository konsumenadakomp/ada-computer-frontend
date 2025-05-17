interface Technician {
  id: string;
  name: string;
  specialization: string[];
  active: boolean;
}

export const technicians: Technician[] = [
  {
    id: 'TECH001',
    name: 'Ahmad Syaifudin',
    specialization: ['Laptop', 'PC Desktop', 'Printer'],
    active: true
  },
  {
    id: 'TECH002',
    name: 'Budi Santoso',
    specialization: ['Laptop', 'PC Desktop', 'Networking'],
    active: true
  },
  {
    id: 'TECH003',
    name: 'Cahyo Widodo',
    specialization: ['Printer', 'Scanner', 'All-in-One'],
    active: true
  },
  {
    id: 'TECH004',
    name: 'Deni Kurniawan',
    specialization: ['Laptop', 'PC Desktop', 'Data Recovery'],
    active: true
  }
];

export default technicians; 