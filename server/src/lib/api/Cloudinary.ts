import cloudinary from 'cloudinary';

const client = cloudinary.v2;

export const Cloudinary = {
  upload: async (image: string): Promise<string> => {
    const res = await client.uploader.upload(image, {
      folder: 'TH_Assets/',
    });

    return res.secure_url;
  },
};
