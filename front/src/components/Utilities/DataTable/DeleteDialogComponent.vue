<template>
  <v-dialog v-model="dialogStat" max-width="400">
    <div class="delete-dialog">
      <div class="dialog-icon">
        <v-icon size="32" color="error">mdi-alert-circle-outline</v-icon>
      </div>
      
      <div class="dialog-content">
        <h3>Delete Invoice</h3>
        <p>Are you sure you want to delete this invoice? This action cannot be undone.</p>
      </div>

      <div class="dialog-footer">
        <button class="btn btn-secondary" @click="closeDelete">
          Cancel
        </button>
        <button class="btn btn-danger" @click="deleteItemConfirm">
          Delete
        </button>
      </div>
    </div>
  </v-dialog>
</template>

<script setup>
import { defineProps, defineEmits, computed } from "vue";

const props = defineProps({
  dialogDelete: Boolean,
  id: Object,
  editedIndex: Number,
  item: Object
});

const emit = defineEmits(["closeDelete", "deleteItemConfirm"]);

const dialogStat = computed(() => props.dialogDelete);

const closeDelete = () => {
  emit("closeDelete");
};

const deleteItemConfirm = () => {
  emit("deleteItemConfirm", props.id?.invoice_id);
};
</script>

<style scoped>
.delete-dialog {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  text-align: center;
}

.dialog-icon {
  padding: 32px 24px 16px;
}

.dialog-content {
  padding: 0 24px 24px;
}

.dialog-content h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1a1f36;
  margin: 0 0 8px;
}

.dialog-content p {
  font-size: 14px;
  color: #697386;
  line-height: 1.5;
  margin: 0;
}

.dialog-footer {
  display: flex;
  justify-content: center;
  gap: 12px;
  padding: 16px 24px;
  background: #fafbfc;
  border-top: 1px solid #e3e8ee;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  padding: 0 24px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
  border: none;
}

.btn-secondary {
  background: #fff;
  color: #1a1f36;
  border: 1px solid #e3e8ee;
}

.btn-secondary:hover {
  background: #f6f8fa;
}

.btn-danger {
  background: #ef4444;
  color: #fff;
}

.btn-danger:hover {
  background: #dc2626;
}
</style>
