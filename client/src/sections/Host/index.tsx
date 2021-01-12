import React, { useState } from 'react';
import { Link, Redirect } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import {
  Button,
  Form,
  Input,
  InputNumber,
  Layout,
  Radio,
  Typography,
  Upload,
} from 'antd';
import { UploadChangeParam, RcFile } from 'antd/lib/upload';
import {
  BankOutlined,
  HomeOutlined,
  LoadingOutlined,
  PlusOutlined,
} from '@ant-design/icons';

import { ANTD_ICON_COLOR, ONE_MB } from '../../lib/constants';
import { HOST_LISTING } from '../../lib/graphql/mutations';

import {
  HostListing as HostListingData,
  HostListingVariables,
} from '../../lib/graphql/mutations/HostListing/__generated__/HostListing';
import { ListingType } from '../../lib/graphql/globalTypes';
import { Viewer } from '../../lib/types';

import {
  displaySuccessNotification,
  displayErrorMessage,
} from '../../lib/utils';

import './styles/Host.css';

interface Props {
  viewer: Viewer;
}

interface FormValues {
  address: string;
  city: string;
  description: string;
  image: string;
  numOfGuests: number;
  postalCode: string;
  price: number;
  state: string;
  title: string;
  type: ListingType;
}

interface DummyRequestOptions {
  onSuccess: (response: Record<string, unknown>, file: RcFile) => void;
  file: RcFile;
}

const { Content } = Layout;
const { Text, Title } = Typography;
const { Item } = Form;

const validateImageFile = (file: File) => {
  const fileIsValidImage =
    file.type === 'image/jpeg' || file.type === 'image/png';

  const fileIsValidSize = file.size / 1024 / 1024 < ONE_MB;

  if (!fileIsValidImage) {
    void displayErrorMessage(
      "You're only able to upload valid JPG or PNG files!"
    );
    return false;
  }

  if (!fileIsValidSize) {
    void displayErrorMessage(
      "You're only able to upload valid image files of under 1MB in size!"
    );
    return false;
  }

  return fileIsValidImage && fileIsValidSize;
};

const dummyRequest = ({ onSuccess, file }: DummyRequestOptions) => {
  setTimeout(() => {
    onSuccess({}, file);
  }, 0);
};

const getBase64Value = (
  img: File | Blob,
  callback: (imageBase64Value: string) => void
): void => {
  const reader = new FileReader();
  reader.onload = () => {
    callback(reader.result as string);
  };
  reader.readAsDataURL(img);
};

export const Host = ({ viewer }: Props): JSX.Element => {
  const [imageLoading, setImageLoading] = useState(false);
  const [imageUrlInBase64, setImageUrlInBase64] = useState<string | null>(null);

  const [form] = Form.useForm<FormValues>();

  const [hostListing, { loading, data }] = useMutation<
    HostListingData,
    HostListingVariables
  >(HOST_LISTING, {
    onCompleted: () => {
      displaySuccessNotification("You've successfully created your listing!");
    },
    onError: () => {
      void displayErrorMessage(
        "Sorry! We weren't able to create your listing. Please try again later."
      );
    },
  });

  const handleImageUpload = (info: UploadChangeParam) => {
    const { file } = info;

    if (file.status === 'uploading') {
      setImageLoading(true);
      return;
    }

    if (file.status === 'done' && file.originFileObj) {
      getBase64Value(file.originFileObj, (imageBase64Value) => {
        setImageUrlInBase64(imageBase64Value);
        setImageLoading(false);
      });
    }
  };

  const handleHostListing = (values: FormValues) => {
    const fullAddress = `${values.address}, ${values.city}, ${values.state}, ${values.postalCode}`;

    const input: HostListingVariables['input'] = {
      title: values.title,
      description: values.description,
      image: imageUrlInBase64 as string,
      type: values.type,
      address: fullAddress,
      price: values.price * 100,
      numOfGuests: values.numOfGuests,
    };

    void hostListing({
      variables: {
        input,
      },
    });
  };

  const handleHostListingFailure = () => {
    void displayErrorMessage('Please complete all required form fields!');
  };

  if (!viewer.id || !viewer.hasWallet) {
    return (
      <Content className="host">
        <div className="host__form-header">
          <Title level={4} className="host__form-title">
            You&apos;ll have to be signed in and connected with Stripe to host a
            listing!
          </Title>
          <Text type="secondary">
            We only allow users who&apos;ve signed in to our application and
            have connected with Stripe to host new listings. You can sign in at
            the <Link to="/login">/login</Link> page and connect with Stripe
            shortly after.
          </Text>
        </div>
      </Content>
    );
  }

  if (loading) {
    return (
      <Content className="host">
        <div className="host__form-header">
          <Title level={3} className="host__form-title">
            Please wait!
          </Title>
          <Text type="secondary">We&apos;re creating your listing now.</Text>
        </div>
      </Content>
    );
  }

  if (data && data.hostListing) {
    return <Redirect to={`/listing/${data.hostListing.id}`} />;
  }

  return (
    <Content className="host">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleHostListing}
        onFinishFailed={handleHostListingFailure}
      >
        <div className="host__form-header">
          <Title level={3} className="host__form-title">
            Hi! Let&apos;s get started listing your place.
          </Title>
          <Text type="secondary">
            In this form, we&apos;ll collect some basic and additional
            information about your listing.
          </Text>
        </div>

        <Item
          name="type"
          label="Home Type"
          rules={[{ required: true, message: 'Please select a home type!' }]}
        >
          <Radio.Group>
            <Radio.Button value={ListingType.APARTMENT}>
              <BankOutlined style={{ color: ANTD_ICON_COLOR }} />{' '}
              <span>Apartment</span>
            </Radio.Button>
            <Radio.Button value={ListingType.HOUSE}>
              <HomeOutlined style={{ color: ANTD_ICON_COLOR }} />{' '}
              <span>House</span>
            </Radio.Button>
          </Radio.Group>
        </Item>

        <Item
          name="numOfGuests"
          label="Max # of Guests"
          rules={[
            { required: true, message: 'Please enter a max number of guests!' },
          ]}
        >
          <InputNumber min={1} placeholder="4" />
        </Item>

        <Item
          name="title"
          label="Title"
          extra="Max character count of 45"
          rules={[
            {
              required: true,
              message: 'Please enter a title for your listing!',
            },
          ]}
        >
          <Input
            maxLength={45}
            placeholder="The iconic and luxurious Bel-Air mansion"
          />
        </Item>

        <Item
          name="description"
          label="Description of listing"
          extra="Max character count of 400"
          rules={[
            {
              required: true,
              message: 'Please enter a description for your listing!',
            },
          ]}
        >
          <Input.TextArea
            rows={3}
            maxLength={400}
            placeholder="Modern, clean, and iconic home of the Fresh Prince. Situated in the heart of Bel-Air, Los Angeles."
          />
        </Item>

        <Item
          name="address"
          label="Address"
          rules={[
            {
              required: true,
              message: 'Please enter an address for your listing!',
            },
          ]}
        >
          <Input placeholder="251 North Bristol Avenue" />
        </Item>

        <Item
          name="city"
          label="City/Town"
          rules={[
            {
              required: true,
              message: 'Please enter a city (or region) for your listing!',
            },
          ]}
        >
          <Input placeholder="Los Angeles" />
        </Item>

        <Item
          name="state"
          label="State/Province"
          rules={[
            {
              required: true,
              message: 'Please enter a state (or province) for your listing!',
            },
          ]}
        >
          <Input placeholder="California" />
        </Item>

        <Item
          name="postalCode"
          label="Zip/Postal Code"
          rules={[
            {
              required: true,
              message: 'Please enter a zip (or postal) code for your listing!',
            },
          ]}
        >
          <Input placeholder="Please enter a zip code for your listing!" />
        </Item>

        <Item
          name="image"
          label="Image"
          extra="Images have to be under 1MB in size and of type JPG or PNG"
          rules={[
            {
              required: true,
              message: 'Please provide an image for your listing!',
            },
          ]}
        >
          <div className="host__form-image-upload">
            <Upload
              name="image"
              listType="picture-card"
              showUploadList={false}
              beforeUpload={validateImageFile}
              customRequest={dummyRequest}
              onChange={handleImageUpload}
            >
              {imageUrlInBase64 ? (
                <img src={imageUrlInBase64} alt="Listing" />
              ) : (
                <div>
                  {imageLoading ? <LoadingOutlined /> : <PlusOutlined />}
                  <div className="ant-upload-text">Upload</div>
                </div>
              )}
            </Upload>
          </div>
        </Item>

        <Item
          name="price"
          label="Price"
          extra="All prices in $USD/day"
          rules={[
            {
              required: true,
              message: 'Please enter a price for your listing!',
            },
          ]}
        >
          <InputNumber min={0} placeholder="120" />
        </Item>

        <Item>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Item>
      </Form>
    </Content>
  );
};
