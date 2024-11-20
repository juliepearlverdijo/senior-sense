import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import Cryptr from "cryptr";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const configureStatusColor = (status: string) => {
  switch (status) {
    case "Normal":
    case "Cheerful":
    case "No":
      return "text-green-600";
    case "Unusual":
    case "Anxious":
      return "text-red-400";
    case "Stressed":
      return "text-yellow-400";
    case "Cheerful":
      return "text-yellow-400";
    default:
      return "text-green-600";
  }
};

export const formatDate = (dateString: string) => {
  const isoDateString = dateString;
  const date = new Date(isoDateString);

  // Extract the month, day, and year
  const month = String(date.getUTCMonth() + 1).padStart(2, "0"); // Months are zero-based
  const day = String(date.getUTCDate()).padStart(2, "0");
  const year = date.getUTCFullYear();

  // Format as MM-DD-YYYY
  const formattedDate = `${month}-${day}-${year}`;
  return formattedDate;
};

export function encrypt(text: string) {
  const secretKey = process.env.NEXTAUTH_SECRET;
  if (secretKey) {
    const cryptr = new Cryptr(secretKey);
    const encryptedString = cryptr.encrypt(text);
    return encryptedString;
  }
  return "Encrypt: secret key not found";
}

export function decrypt(encryptedString: string) {
  const secretKey = process.env.NEXTAUTH_SECRET;
  if (secretKey) {
    const cryptr = new Cryptr(secretKey);

    const text = cryptr.decrypt(encryptedString);
    return text;
  }
  return "Decrypt: secret key not found";
}
