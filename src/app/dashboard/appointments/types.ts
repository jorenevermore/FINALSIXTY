export interface Booking {
  id: string;
  clientId: string;
  clientName: string;
  serviceOrdered: string;
  serviceOrderedId: string;
  barberName: string;
  barberId?: string;
  barbershopId: string;
  barbershopName?: string;
  styleOrdered: string;
  styleOrderedId: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'canceled' | 'declined' | 'no-show';
  reason?: string;
  barberReason?: string;
  totalPrice: number;
  isHomeService?: boolean;
  isEmergency?: boolean;
  isServiceOrderedPackage?: boolean;
  createdAt?: string;
  location?: {
    lat: number;
    lng: number;
    streetName: string;
    distance: number;
  };
  feedback?: {
    rating: number;
    comment?: string;
    createdAt: string;
  };
  statusHistory?: {
    ongoingStatus: string; // Changed from 'status' to 'ongoingStatus' to avoid conflicts
    timestamp: string;
    reason?: string;
    updatedBy: 'client' | 'barber';
  }[];
  barbershopNotes?: {
    text: string;
    timestamp: string;
    from: 'barbershop';
    barbershopId: string;
    barbershopName?: string;
  }[];
  clientNotes?: {
    text: string;
    timestamp: string;
    from: 'client';
    clientId: string;
    clientName?: string;
  }[];
}
