import { setLogin } from "@/stores/loginState";

export default function useAuth() {
  const loginState = setLogin();

  async function validateToken() {
    try {
      const res = await fetch(`${import.meta.env.VITE_BASE_URL}/register/validateToken`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_email: loginState.user_email || localStorage.getItem("user_email"),
          token: loginState.token || localStorage.getItem("token") 
        }),
      });
      const result = await res.json();
      console.log("Is res valid?", {
        user_email: loginState.user_email || localStorage.getItem("user_email"),
        token: loginState.token || localStorage.getItem("token") 
      });
      return result.Success;
    } catch (err) {
      console.error("❌ Token validation failed:", err);
      return false;
    }
  }

  async function getPayments(invoiceStore) {
    try {
      const res = await fetch(`${import.meta.env.VITE_BASE_URL}/invoice/payments`, {
        headers: { "Content-Type": "application/json" }
      });
      const data = await res.json();
      const pay = data?.payments?.payments || [];
      const inv = data?.payments?.invoicing || [];
      invoiceStore.setPaymentsData(pay, inv);
    } catch (err) {
      console.error("❌ Failed to fetch payments:", err);
    }
  }

  return { validateToken, getPayments };
}