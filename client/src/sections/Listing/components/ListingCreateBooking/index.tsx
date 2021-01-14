import React from 'react';
import { Button, Card, Divider, Tooltip, Typography } from 'antd';
import dayjs, { Dayjs } from 'dayjs';

import { DatePicker } from '../../../../lib/components';

import { BookingsIndex } from './types';
import { Listing as ListingData } from '../../../../lib/graphql/queries/Listing/__generated__/Listing';
import { Viewer } from '../../../../lib/types';

import { displayErrorMessage, formatListingPrice } from '../../../../lib/utils';

import './styles/ListingCreateBooking.css';

interface Props {
  viewer: Viewer;
  host: ListingData['listing']['host'];
  price: number;
  bookingsIndex: ListingData['listing']['bookingsIndex'];
  checkInDate: Dayjs | null;
  checkOutDate: Dayjs | null;
  setCheckInDate: (checkInDate: Dayjs | null) => void;
  setCheckOutDate: (checkOutDate: Dayjs | null) => void;
}

const { Paragraph, Text, Title } = Typography;

export const ListingCreateBooking = ({
  viewer,
  host,
  price,
  bookingsIndex,
  checkInDate,
  checkOutDate,
  setCheckInDate,
  setCheckOutDate,
}: Props): JSX.Element => {
  const bookingsIndexInJson: BookingsIndex = JSON.parse(
    bookingsIndex
  ) as BookingsIndex;
  const viewerIsHost = viewer.id === host.id;
  const checkInInputIsDisabled = !viewer.id || viewerIsHost || !host.hasWallet;
  const checkOutInputIsDisabled = checkInInputIsDisabled || !checkInDate;
  const buttonIsDisabled =
    checkOutInputIsDisabled || !checkInDate || !checkOutDate;

  const isDateBooked = (currentDate: Dayjs) => {
    const year = currentDate.year();
    const month = currentDate.month();
    const day = currentDate.date();

    return !!bookingsIndexInJson[year]?.[month]?.[day];
  };

  const isDateDisabled = (currentDate: Dayjs) => {
    const endOfDay = dayjs().endOf('day');
    const dateIsBeforeEndOfDay = currentDate.isBefore(endOfDay);
    const dateIsMoreThanThreeMonthsAhead = currentDate.isAfter(
      endOfDay.add(90, 'days')
    );
    const dateIsBooked = isDateBooked(currentDate);

    return (
      dateIsBeforeEndOfDay || dateIsMoreThanThreeMonthsAhead || dateIsBooked
    );
  };

  const verifyAndSetCheckOutDate = (selectedCheckOutDate: Dayjs | null) => {
    if (checkInDate && selectedCheckOutDate) {
      if (selectedCheckOutDate.isBefore(checkInDate, 'day')) {
        void displayErrorMessage(
          "You can't book date of check out to be prior to check in!"
        );
      }

      let dateCursor = checkInDate;

      while (dateCursor.isBefore(selectedCheckOutDate, 'day')) {
        dateCursor = dateCursor.add(1, 'day');

        const year = dateCursor.year();
        const month = dateCursor.month();
        const day = dateCursor.date();

        if (bookingsIndexInJson[year]?.[month]?.[day]) {
          void displayErrorMessage(
            "You can't book a period of time that overlaps existing bookings. Please try again!"
          );
        }
      }
    }

    return setCheckOutDate(selectedCheckOutDate);
  };

  let buttonMessage = "You won't be charged yet";

  if (!viewer.id) {
    buttonMessage = 'You have to be signed in to book a listing!';
  } else if (viewerIsHost) {
    buttonMessage = "You can't book your own listing!";
  } else if (!host.hasWallet) {
    buttonMessage =
      "The host has disconnected from Stripe and thus won't be able to receive payments!";
  }

  return (
    <div className="listing-booking">
      <Card className="listing-booking__card">
        <div>
          <Paragraph>
            <Title level={2} className="listing-booking__card-title">
              {formatListingPrice(price)}
              <span>/day</span>
            </Title>
          </Paragraph>
          <Divider />
          <div className="listing-booking__card-date-picker">
            <Paragraph strong>Check In</Paragraph>
            <DatePicker
              value={checkInDate}
              format="YYYY/MM/DD"
              showToday={false}
              disabled={checkInInputIsDisabled}
              disabledDate={isDateDisabled}
              onChange={(date) => setCheckInDate(date)}
              onOpenChange={() => setCheckOutDate(null)}
              renderExtraFooter={() => {
                return (
                  <div>
                    <Text type="secondary" className="ant-calendar-footer-text">
                      You can only book a listing within 90 days from today.
                    </Text>
                  </div>
                );
              }}
            />
          </div>
          <div className="listing-booking__card-date-picker">
            <Paragraph strong>Check Out</Paragraph>
            <DatePicker
              value={checkOutDate}
              format="YYYY/MM/DD"
              showToday={false}
              disabled={checkOutInputIsDisabled}
              disabledDate={isDateDisabled}
              onChange={(date) => verifyAndSetCheckOutDate(date)}
              dateRender={(currentDate) => {
                if (checkInDate && currentDate.isSame(checkInDate, 'day')) {
                  return (
                    <Tooltip title="Check in date">
                      <div className="ant-picker-cell-inner ant-picker-cell-inner_check-in">
                        {currentDate.date()}
                      </div>
                    </Tooltip>
                  );
                }

                return (
                  <div className="ant-picker-cell-inner">
                    {currentDate.date()}
                  </div>
                );
              }}
              renderExtraFooter={() => {
                return (
                  <div>
                    <Text type="secondary" className="ant-calendar-footer-text">
                      Check-out cannot be before check-in.
                    </Text>
                  </div>
                );
              }}
            />
          </div>
        </div>
        <Divider />
        <Button
          disabled={buttonIsDisabled}
          size="large"
          type="primary"
          className="listing-booking__card-cta"
        >
          Request to book!
        </Button>
        <Text type="secondary" mark>
          {buttonMessage}
        </Text>
      </Card>
    </div>
  );
};
