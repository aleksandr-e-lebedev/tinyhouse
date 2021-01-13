export interface CreateBookingInput {
  listingId: string;
  source: string;
  checkIn: string;
  checkOut: string;
}

export interface CreateBookingArgs {
  input: CreateBookingInput;
}
