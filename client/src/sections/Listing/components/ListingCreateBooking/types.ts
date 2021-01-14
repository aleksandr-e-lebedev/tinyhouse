interface BookingsIndexMonth {
  [key: string]: boolean | undefined;
}

interface BookingsIndexYear {
  [key: string]: BookingsIndexMonth | undefined;
}

export interface BookingsIndex {
  [key: string]: BookingsIndexYear | undefined;
}
