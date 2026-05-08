import { cloudinary, cloudinaryEnabled } from "../config/cloudinary.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const uploadToCloudinary = async (file) => {
  const dataUri = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
  const result = await cloudinary.uploader.upload(dataUri, {
    folder: "commerce-hub/products",
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
};

export const uploadImages = asyncHandler(async (request, response) => {
  const files = request.files || [];

  if (!files.length) {
    throw new ApiError(400, "At least one image is required.");
  }

  const images = await Promise.all(
    files.map(async (file) => {
      if (cloudinaryEnabled) {
        return uploadToCloudinary(file);
      }

      return {
        url: `https://placehold.co/800x800?text=${encodeURIComponent(file.originalname)}`,
        publicId: "",
      };
    })
  );

  response.status(201).json({
    success: true,
    items: images,
  });
});

