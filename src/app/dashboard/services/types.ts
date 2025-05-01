export interface Service {
  id: string;
  title: string;
  featuredImage: string | null;
  status: 'Available' | 'Disabled';
}

export interface Style {
  styleId: string;
  styleName: string;
  price: string;
  featuredImage: string | null;
  serviceId: string;
  barbershopId: string;
  docId?: string;
}

export interface StylesMap {
  [serviceId: string]: Style[];
}
