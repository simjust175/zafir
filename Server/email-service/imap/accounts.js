// import GeneralService from "../../Services/generalService.js";
import dotenv from "dotenv";
dotenv.config();


const emailAccounts = (email, password) => {
  return {
  user: email,
  password: password,
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  tls: true,
  tlsOptions: { rejectUnauthorized: false }
}
};

export default emailAccounts
// export const emailAccounts = process.env.EMAILS.split(",").map((email, index) => ({
//   user: email,
//   password: process.env.PASSWORDS.split(",")[index],
//   host: process.env.EMAIL_HOST,
//   port: parseInt(process.env.EMAIL_PORT),
//   tls: true,
//   tlsOptions: { rejectUnauthorized: false },
// }));
