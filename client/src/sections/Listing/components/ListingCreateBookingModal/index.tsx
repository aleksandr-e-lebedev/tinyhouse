import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button, Divider, Modal, Typography } from 'antd';
import { KeyOutlined } from '@ant-design/icons';
import { Dayjs } from 'dayjs';

import { ONE_DAY } from '../../../../lib/constants';
import { CREATE_BOOKING } from '../../../../lib/graphql/mutations';

import {
  CreateBooking as CreateBookingData,
  CreateBookingVariables,
} from '../../../../lib/graphql/mutations/CreateBooking/__generated__/CreateBooking';

import {
  formatListingPrice,
  displaySuccessNotification,
  displayErrorMessage,
} from '../../../../lib/utils';

import './styles/ListingCreateBookingModal.css';

interface Props {
  listingId: string;
  listingPrice: number;
  modalVisible: boolean;
  checkInDate: Dayjs;
  checkOutDate: Dayjs;
  setModalVisible: (modalVisible: boolean) => void;
  clearBookingData: () => void;
  refetchListing: () => Promise<void>;
}

const { Paragraph, Text, Title } = Typography;

export const ListingCreateBookingModal = ({
  listingId,
  listingPrice,
  modalVisible,
  checkInDate,
  checkOutDate,
  setModalVisible,
  clearBookingData,
  refetchListing,
}: Props): JSX.Element => {
  const [stripeDisabled, setStripeDisabled] = useState(false);
  const stripe = useStripe();
  const stripeElements = useElements();

  const [createBooking, { loading }] = useMutation<
    CreateBookingData,
    CreateBookingVariables
  >(CREATE_BOOKING, {
    onCompleted: () => {
      clearBookingData();
      displaySuccessNotification(
        "You've successfully booked the listing!",
        'Booking history can always be found in your User page.'
      );
      void refetchListing();
    },
    onError: () => {
      void displayErrorMessage(
        "Sorry! We weren't able to successfully book the listing. Please try again later!"
      );
    },
  });

  const daysBooked = checkOutDate.diff(checkInDate, 'days') + ONE_DAY;
  const bookingPrice = listingPrice * daysBooked;

  const handleCreateBooking = async (): Promise<void> => {
    if (!stripe || !stripeElements) {
      void displayErrorMessage(
        "Sorry! We weren't able to connect with Stripe. Please try again later."
      );
      return setStripeDisabled(true);
    }

    const cardElement = stripeElements.getElement(CardElement);

    if (!cardElement) {
      void displayErrorMessage(
        'Sorry! We have an issue with Stripe. Please try again later.'
      );
      return setStripeDisabled(true);
    }

    const payload = await stripe.createToken(cardElement);

    if (payload.error || !payload.token) {
      return displayErrorMessage(
        payload.error?.message
          ? payload.error.message
          : "Sorry! We weren't able to book the listing. Please try again later."
      );
    }

    void createBooking({
      variables: {
        input: {
          listingId,
          source: payload.token.id,
          checkIn: checkInDate.format('YYYY-MM-DD'),
          checkOut: checkOutDate.format('YYYY-MM-DD'),
        },
      },
    });

    return undefined;
  };

  return (
    <Modal
      visible={modalVisible}
      centered
      footer={null}
      onCancel={() => setModalVisible(false)}
    >
      <div className="listing-booking-modal">
        <div className="listing-booking-modal__intro">
          <Title className="listing-booking-modal__intro-title">
            <KeyOutlined />
          </Title>
          <Title level={3} className="listing-booking-modal__intro-title">
            Book your trip
          </Title>
          <Paragraph>
            Enter your payment information to book the listing from the dates
            between{' '}
            <Text mark strong>
              {checkInDate.format('MMMM Do YYYY')}
            </Text>{' '}
            and{' '}
            <Text mark strong>
              {checkOutDate.format('MMMM Do YYYY')}
            </Text>
            , inclusive.
          </Paragraph>
        </div>

        <Divider />

        <div className="listing-booking-modal__charge-summary">
          <Paragraph>
            {formatListingPrice(listingPrice, false)} * {daysBooked} days ={' '}
            <Text strong>{formatListingPrice(bookingPrice, false)}</Text>
          </Paragraph>
          <Paragraph className="listing-booking-modal__charge-summary-total">
            Total = <Text mark>{formatListingPrice(bookingPrice, false)}</Text>
          </Paragraph>
        </div>

        <Divider />

        <div className="listing-booking-modal__stripe-card-section">
          <CardElement className="listing-booking-modal__stripe-card" />
          <Button
            size="large"
            type="primary"
            disabled={stripeDisabled}
            loading={loading}
            className="listing-booking-modal__cta"
            onClick={handleCreateBooking}
          >
            Book
          </Button>
        </div>
      </div>
    </Modal>
  );
};
