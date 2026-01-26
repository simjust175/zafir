import { ref, computed } from "vue";
import { defineStore } from "pinia";

const API = import.meta.env.VITE_BASE_URL;

export const useUserStore = defineStore("userStore", () => {
  const users = ref([]);
  const pendingInvites = ref([]);
  const loading = ref(false);
  const error = ref(null);

  const activeUsers = computed(() => 
    users.value.filter(u => u.token)
  );

  const inactiveUsers = computed(() => 
    users.value.filter(u => !u.token)
  );

  const userCount = computed(() => users.value.length);
  const inviteCount = computed(() => pendingInvites.value.length);

  async function fetchUsers() {
    loading.value = true;
    error.value = null;
    try {
      const res = await fetch(`${API}/invoice/filtered/users`);
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      users.value = data.filtered || [];
    } catch (err) {
      error.value = err.message;
      console.error("fetchUsers error:", err);
    } finally {
      loading.value = false;
    }
  }

  async function fetchPendingInvites() {
    try {
      const res = await fetch(`${API}/users/invites`);
      if (!res.ok) throw new Error("Failed to fetch invites");
      const data = await res.json();
      pendingInvites.value = data.invites || [];
    } catch (err) {
      console.error("fetchPendingInvites error:", err);
    }
  }

  async function addUser(userData) {
    const tempId = `temp_${Date.now()}`;
    const tempUser = {
      user_id: tempId,
      user_name: userData.user_name,
      user_email: userData.user_email,
      token: null,
      created_at: new Date().toISOString(),
      _pending: true
    };

    users.value.unshift(tempUser);

    try {
      const res = await fetch(`${API}/invoice/add/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData)
      });

      if (!res.ok) throw new Error("Failed to add user");
      
      const data = await res.json();
      const idx = users.value.findIndex(u => u.user_id === tempId);
      if (idx !== -1 && data.newUser) {
        users.value[idx] = { ...data.newUser, _pending: false };
      }
      return { success: true };
    } catch (err) {
      users.value = users.value.filter(u => u.user_id !== tempId);
      error.value = err.message;
      return { success: false, error: err.message };
    }
  }

  async function updateUser(userId, updates) {
    const idx = users.value.findIndex(u => u.user_id === userId);
    if (idx === -1) return { success: false, error: "User not found" };

    const original = { ...users.value[idx] };
    users.value[idx] = { ...users.value[idx], ...updates, _pending: true };

    try {
      const res = await fetch(`${API}/invoice/patch/users?user=${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      });

      if (!res.ok) throw new Error("Failed to update user");
      
      users.value[idx] = { ...users.value[idx], _pending: false };
      return { success: true };
    } catch (err) {
      users.value[idx] = original;
      error.value = err.message;
      return { success: false, error: err.message };
    }
  }

  async function deleteUser(userId) {
    const idx = users.value.findIndex(u => u.user_id === userId);
    if (idx === -1) return { success: false, error: "User not found" };

    const original = users.value[idx];
    users.value.splice(idx, 1);

    const now = new Date();
    const deletedAt = now.getFullYear() + "-" +
      String(now.getMonth() + 1).padStart(2, "0") + "-" +
      String(now.getDate()).padStart(2, "0") + " " +
      String(now.getHours()).padStart(2, "0") + ":" +
      String(now.getMinutes()).padStart(2, "0") + ":" +
      String(now.getSeconds()).padStart(2, "0");

    try {
      const res = await fetch(`${API}/invoice/patch/users?user=${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deleted_at: deletedAt })
      });

      if (!res.ok) throw new Error("Failed to delete user");
      return { success: true };
    } catch (err) {
      users.value.splice(idx, 0, original);
      error.value = err.message;
      return { success: false, error: err.message };
    }
  }

  async function inviteUser(email, name = "") {
    const tempId = `invite_${Date.now()}`;
    const tempInvite = {
      id: tempId,
      email,
      name,
      status: "pending",
      created_at: new Date().toISOString(),
      _pending: true
    };

    pendingInvites.value.unshift(tempInvite);

    try {
      const res = await fetch(`${API}/users/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to send invite");
      }
      
      const data = await res.json();
      const idx = pendingInvites.value.findIndex(i => i.id === tempId);
      if (idx !== -1 && data.invite) {
        pendingInvites.value[idx] = { ...data.invite, _pending: false };
      }
      return { success: true };
    } catch (err) {
      pendingInvites.value = pendingInvites.value.filter(i => i.id !== tempId);
      error.value = err.message;
      return { success: false, error: err.message };
    }
  }

  async function cancelInvite(inviteId) {
    const idx = pendingInvites.value.findIndex(i => i.id === inviteId);
    if (idx === -1) return { success: false, error: "Invite not found" };

    const original = pendingInvites.value[idx];
    pendingInvites.value.splice(idx, 1);

    try {
      const res = await fetch(`${API}/users/invite/${inviteId}`, {
        method: "DELETE"
      });

      if (!res.ok) throw new Error("Failed to cancel invite");
      return { success: true };
    } catch (err) {
      pendingInvites.value.splice(idx, 0, original);
      error.value = err.message;
      return { success: false, error: err.message };
    }
  }

  async function resendInvite(inviteId) {
    try {
      const res = await fetch(`${API}/users/invite/${inviteId}/resend`, {
        method: "POST"
      });

      if (!res.ok) throw new Error("Failed to resend invite");
      
      const idx = pendingInvites.value.findIndex(i => i.id === inviteId);
      if (idx !== -1) {
        pendingInvites.value[idx].last_sent = new Date().toISOString();
      }
      return { success: true };
    } catch (err) {
      error.value = err.message;
      return { success: false, error: err.message };
    }
  }

  function clearError() {
    error.value = null;
  }

  return {
    users,
    pendingInvites,
    loading,
    error,
    activeUsers,
    inactiveUsers,
    userCount,
    inviteCount,
    fetchUsers,
    fetchPendingInvites,
    addUser,
    updateUser,
    deleteUser,
    inviteUser,
    cancelInvite,
    resendInvite,
    clearError
  };
});
