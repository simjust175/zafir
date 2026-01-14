<template>
  <div class="users-page">
    <header class="page-header">
      <div class="header-content">
        <div>
          <h1 class="page-title">Team Management</h1>
          <p class="page-subtitle">Manage users and permissions</p>
        </div>
        <v-btn color="primary" prepend-icon="mdi-account-plus">
          Invite User
        </v-btn>
      </div>
    </header>

    <manage-users />
  </div>
</template>

<script setup>
</script>

<style scoped>
.users-page {
  max-width: 1400px;
  margin: 0 auto;
  min-height: 100%;
  padding-bottom: 32px;
}

.page-header {
  margin-bottom: 24px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 16px;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
  margin: 0 0 4px;
}

.page-subtitle {
  font-size: 0.9375rem;
  color: rgb(var(--v-theme-grey-600));
  margin: 0;
}
</style>
