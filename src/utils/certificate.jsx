import axios from "axios";
import { API } from "../api/config";

export const getCertificateBlobUrl = async (courseId, token) => {
  // 1️⃣ Generate certificate (safe if already exists)
  await axios.post(
    API.GENERATE_CERTIFICATE(courseId),
    null,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  // 2️⃣ Download certificate
  const res = await axios.get(
    API.DOWNLOAD_CERTIFICATE(courseId),
    {
      headers: { Authorization: `Bearer ${token}` },
      responseType: "blob",
    }
  );

  return URL.createObjectURL(res.data);
};
