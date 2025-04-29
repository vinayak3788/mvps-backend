// src/config/s3Uploader.js

import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

import AWS from "aws-sdk";

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;
const BUCKET_FOLDER = process.env.AWS_BUCKET_FOLDER || "uploads";

export async function uploadFileToS3(buffer, originalFileName, orderNumber) {
  if (!BUCKET_NAME) {
    throw new Error("❌ AWS_S3_BUCKET_NAME is missing in environment");
  }
  const fileExtension = originalFileName.split(".").pop();
  const baseFileName = originalFileName.replace(/\.[^/.]+$/, "");
  const cleanFileName = `${orderNumber}_${baseFileName}.${fileExtension}`;
  const s3Key = `${BUCKET_FOLDER}/${cleanFileName}`;

  const params = {
    Bucket: BUCKET_NAME,
    Key: s3Key,
    Body: buffer,
    ContentType: "application/pdf",
    //ACL: "public-read", // ✅ Added this only
  };

  await s3.upload(params).promise();

  const s3Url = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;

  console.log(`✅ File uploaded to S3: ${s3Url}`);

  return { s3Url, cleanFileName };
}

export async function getSignedUrl(fileName) {
  const params = {
    Bucket: BUCKET_NAME,
    Key: `${BUCKET_FOLDER}/${fileName}`,
    Expires: 60, // 🔥 URL expires in 60 seconds
  };

  return s3.getSignedUrlPromise("getObject", params);
}
