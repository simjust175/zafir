<template>
  <div>
    <v-dialog
      v-model="dialog"
      max-width="640"
      transition="dialog-bottom-transition"
    >
      <v-card
        class="rounded-xl pa-6 pt-2"
        elevation="8"
        width="500"
        min-height="550"
      >
        <!-- HEADER -->
        <v-card-title>
          <div class="text-xl d-flex align-center font-bold text-primary text-center">
            <v-btn
              icon="mdi-arrow-left"
              variant="text"
              @click="$emit('close')"
            />
            <div class="text">
              {{ showForm ? '📝 Invoice Details' : '📤 Upload Invoice' }}
            </div>
          </div>

          <!-- Fancy Switch -->
          <div class="flex bg-grey-lighten-4 rounded-pill d-flex justify-center">
            <v-btn
              variant="text"
              icon="mdi-form-select"
              class="flex-1"
              :color="showForm ? 'primary' : 'grey-darken-1'"
              @click="showForm = true"
            />
            <v-divider vertical />
            <v-btn
              variant="text"
              icon="mdi-upload"
              class="flex-1"
              :color="!showForm ? 'primary' : 'grey-darken-1'"
              @click="showForm = false"
            />
          </div>
        </v-card-title>

        <v-divider class="my-4" />

        <!-- CONTENT -->
        <v-fade-transition mode="out-in">
          <div
            v-if="showForm"
            key="form"
          >
            <!-- FORM VIEW -->
            <v-form
              ref="form"
              v-model="valid"
              lazy-validation
            >
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <v-text-field
                  v-model="amount"
                  label="Amount (€)"
                  type="number"
                  :rules="[v => !!v || 'Required', v => v > 0 || 'Must be positive']"
                  prepend-icon="mdi-currency-eur"
                  variant="outlined"
                  density="comfortable"
                />

                <v-autocomplete
                  v-model="supplier"
                  :items="suppliers"
                  label="Supplier"
                  prepend-icon="mdi-domain"
                  clearable
                  variant="outlined"
                  density="comfortable"
                >
                  <template #no-data>
                    <v-list-item @click="supplierDialog = true">
                      <v-list-item-title class="d-flex align-center justify-center">
                        <v-btn
                          text="Add new supplier"
                          color="primary"
                          prepend-icon="mdi-plus"
                        /> 
                      </v-list-item-title>
                    </v-list-item>
                  </template>
                </v-autocomplete>
              </div>

              <v-switch
                v-model="btwIncluded"
                label="BTW Included?"
                inset
                color="primary"
                class="mt-4"
              />

              <v-slide-y-transition>
                <v-text-field
                  v-if="btwIncluded"
                  v-model="btwPercent"
                  label="BTW Percentage"
                  type="number"
                  suffix="%"
                  prepend-icon="mdi-percent"
                  variant="outlined"
                  density="comfortable"
                />
              </v-slide-y-transition>

              <v-select
                v-model="project"
                :items="projects"
                label="Project"
                item-title="name"
                item-value="id"
                prepend-icon="mdi-briefcase"
                clearable
                variant="outlined"
                density="comfortable"
              />
            </v-form>
          </div>

          <div
            v-else
            key="upload"
          >
            <!-- UPLOAD VIEW -->
            <v-file-upload
              v-model="file"
              label="Select invoice file"
              show-size
              accept=".pdf,.jpg,.png"
              prepend-icon="mdi-file-upload"
              variant="outlined"
              density="comfortable"
              class="rounded-xl border-dashed border-2 border-primary/40 py-6"
              @update:model-value="onFileUpload"
            />

            <v-snackbar
              v-model="snackbar"
              timeout="4000"
            >
              File removed
              <template #actions>
                <v-btn
                  variant="text"
                  @click="undoFile"
                >
                  Undo
                </v-btn>
              </template>
            </v-snackbar>
          </div>
        </v-fade-transition>

        <!-- CTA BUTTON -->
        <div class="mt-6">
          <v-btn
            block
            size="large"
            class="rounded-xl font-bold"
            color="primary"
            :disabled="!valid || loading"
            :loading="loading"
            @click="submit"
          >
            🚀 Submit Invoice
          </v-btn>
        </div>
      </v-card>
    </v-dialog>

    <!-- Add Supplier Dialog -->
    <v-dialog
      v-model="supplierDialog"
      max-width="400"
    >
      <v-card
        class="rounded-xl pa-4"
        width="400"
      >
        <v-card-title class="font-semibold d-flex align-center">
          <v-icon
            icon="mdi-plus"
            class="mr-2"
          />
          Add New Supplier
        </v-card-title>
        <v-card-text>
          <v-text-field
            v-model="newSupplier"
            label="Supplier Name"
            variant="outlined"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="text"
            @click="supplierDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            :disabled="!newSupplier"
            @click="addSupplier"
          >
            Add
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { invoices } from '@/stores/invoiceState'
const invoiceArray = invoices()
const props = defineProps({ active: Boolean })
defineEmits(['close'])
const showForm = ref(true)
const valid = ref(false)
const loading = ref(false)

const amount = ref(null)
const supplier = ref('')
const btwIncluded = ref(false)
const btwPercent = ref(21)
const project = ref(null)
const newSupplier = ref('')
const dialog = ref(false)
const supplierDialog = ref(false)

const file = ref(null)
const snackbar = ref(false)
const suppliers = ref([])

watch(() => props.active, (update) => (dialog.value = update))

watch(() => invoiceArray.dbResponse, (newVal) => {
  const known = newVal.filter(i => i.issuer && i.issuer !== "UNKNOWN ISSUER")
  suppliers.value = [...new Set(known.map(i => i.issuer))]
}, { immediate: true })

const projects = computed(() => {
  const set = []
  for (const inv of invoiceArray.dbResponse) {
    if (inv.project_name && !set.some(p => p.name === inv.project_name)) {
      set.push({ name: inv.project_name, id: inv.project_id })
    }
  }
  return set
})

function addSupplier() {
  if (newSupplier.value && !suppliers.value.includes(newSupplier.value)) {
    suppliers.value.push(newSupplier.value)
    supplier.value = newSupplier.value
  }
  newSupplier.value = ''
  supplierDialog.value = false
}

function onFileUpload(val) {
  if (!val) snackbar.value = true
}

function undoFile() {
  file.value = null
  snackbar.value = false
}

const postInvoice = async (inv) => {
  try {
    const res = await fetch(`${import.meta.env.VITE_BASE_URL}/invoice/post`, {
      method: "POST",
      headers: {'Content-Type' : 'application/json'},
      body: JSON.stringify(inv)
    })
    if (!res.ok) throw new Error(`Failed: ${res.status}`)
    return await res.json()
  } catch (err) {
    console.error("Error posting invoice:", err)
    throw err
  }
}

const  getLastInvoiceId = () => {
  let lastId = Math.max(...invoiceArray.dbResponse.map(i => i.invoice_id))
  return lastId + 1;
};

function submit() {
  if (!valid.value) return

  const invoicePayload = {
    invoice_id: getLastInvoiceId(),
    issuer: supplier.value,
    amount: parseFloat(amount.value),
    btw: btwIncluded.value,
    btwPercent: btwIncluded.value ? parseInt(btwPercent.value) : 0,
    pdf_file: file.value?.name || null,
    project: project.value
  }

  loading.value = true
  postInvoice(invoicePayload)
    .then(() => {
      console.log("payload", invoicePayload);
      invoiceArray.dbResponse
      // alert("Invoice submitted! 🚀")
      dialog.value = false
    })
    .catch(() => {
      console.error("Something went wrong submitting the invoice ❌")
      //alert("Something went wrong submitting the invoice ❌")
    })
    .finally(() => {
      loading.value = false
    })
}
</script>

<style scoped>
.v-card-title {
  font-family: 'Inter', sans-serif;
}
</style>