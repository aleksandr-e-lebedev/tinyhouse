import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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

import { ListingType } from '../../lib/graphql/globalTypes';
import { Viewer } from '../../lib/types';

import { displayErrorMessage } from '../../lib/utils';

import './styles/Host.css';

interface Props {
  viewer: Viewer;
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

  return (
    <Content className="host">
      <Form layout="vertical">
        <div className="host__form-header">
          <Title level={3} className="host__form-title">
            Hi! Let&apos;s get started listing your place.
          </Title>
          <Text type="secondary">
            In this form, we&apos;ll collect some basic and additional
            information about your listing.
          </Text>
        </div>

        <Item label="Home Type">
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

        <Item label="Max # of Guests">
          <InputNumber min={1} placeholder="4" />
        </Item>

        <Item label="Title" extra="Max character count of 45">
          <Input
            maxLength={45}
            placeholder="The iconic and luxurious Bel-Air mansion"
          />
        </Item>

        <Item label="Description of listing" extra="Max character count of 400">
          <Input.TextArea
            rows={3}
            maxLength={400}
            placeholder="Modern, clean, and iconic home of the Fresh Prince. Situated in the heart of Bel-Air, Los Angeles."
          />
        </Item>

        <Item label="Address">
          <Input placeholder="251 North Bristol Avenue" />
        </Item>

        <Item label="City/Town">
          <Input placeholder="Los Angeles" />
        </Item>

        <Item label="State/Province">
          <Input placeholder="California" />
        </Item>

        <Item label="Zip/Postal Code">
          <Input placeholder="Please enter a zip code for your listing!" />
        </Item>

        <Item
          label="Image"
          extra="Images have to be under 1MB in size and of type JPG or PNG"
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

        <Item label="Price" extra="All prices in $USD/day">
          <InputNumber min={0} placeholder="120" />
        </Item>

        <Item>
          <Button type="primary">Submit</Button>
        </Item>
      </Form>
    </Content>
  );
};
