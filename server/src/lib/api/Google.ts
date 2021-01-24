import { google, people_v1 } from 'googleapis';
import {
  Client,
  AddressComponent,
  AddressType,
  GeocodingAddressComponentType,
} from '@googlemaps/google-maps-services-js';

import {
  PUBLIC_URL,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_GEOCODING_API_KEY,
} from '../../config';

interface LogInResult {
  user: people_v1.Schema$Person;
}

interface ParsedAddress {
  country: string | null;
  admin: string | null;
  city: string | null;
}

const auth = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  `${PUBLIC_URL}/login`
);

const maps = new Client({});

const parseAddress = (addressComponents: AddressComponent[]): ParsedAddress => {
  let country = null;
  let admin = null;
  let city = null;

  for (const component of addressComponents) {
    if (component.types.includes(AddressType.country)) {
      country = component.long_name;
    }

    if (component.types.includes(AddressType.administrative_area_level_1)) {
      admin = component.long_name;
    }

    if (
      component.types.includes(AddressType.locality) ||
      component.types.includes(GeocodingAddressComponentType.postal_town)
    ) {
      city = component.long_name;
    }
  }

  return { country, admin, city };
};

export const Google = {
  authUrl: auth.generateAuthUrl({
    access_type: 'online',
    scope: [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ],
  }),
  logIn: async (code: string): Promise<LogInResult> => {
    const { tokens } = await auth.getToken(code);

    auth.setCredentials(tokens);

    const { data } = await google.people({ version: 'v1', auth }).people.get({
      resourceName: 'people/me',
      personFields: 'emailAddresses,names,photos',
    });

    return { user: data };
  },
  geocode: async (address: string): Promise<ParsedAddress> => {
    if (!GOOGLE_GEOCODING_API_KEY) {
      throw new Error('Missing Google Maps API key');
    }

    const res = await maps.geocode({
      params: { address, key: GOOGLE_GEOCODING_API_KEY },
    });

    if (res.status < 200 || res.status > 299) {
      throw new Error('Failed to geocode address');
    }

    return parseAddress(res.data.results[0].address_components);
  },
};
