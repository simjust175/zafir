<template>
  <v-card class="bg-grey-lighten-3 px-6 pb-6 pt-10" height="525">
    <div class="d-flex flex-column justify-space-around" :class="{ 'pt-12': inputMethod !== 'charity' }">
      <v-form v-model="valid" ref="form">
        <div class="d-flex">
          <v-text-field v-model="amount" :label="t('amount')" :rules="amountRules" class="grow-1"
            required />
          <currency-drop-down :selectStat="true" @currencyUpdate="updateCurrency" />
        </div>
        <v-text-field v-model="source" :label="t('source')" v-if="inputMethod === 'charity'" />
        <v-text-field v-model="description" :label="t('description')" />
        <rating-card v-if="inputMethod === 'charity'" @ratingUpdate="updateRating" />
        <drop-down v-if="inputMethod === 'charity'" :menuItems="charityMethods" :language="currentLanguage"
          @methodSelect="processSelection" :beforeUpdate="false" />
      </v-form>
    </div>
    <template v-slot:actions>
      <v-btn :loading="loading" class="flex-grow-1 bg-primary" height="48" variant="tonal" @click="submitForm">
        <span>{{ currentLanguage === 'he' ? `הוספת ${he[inputMethod]}` : `Add ${inputMethod}` }}</span>
      </v-btn>
    </template>
  </v-card>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from "vue";

// Props
const props = defineProps({
  language: String,
  inputMethod: String,
});

// Emits
const emit = defineEmits(["newAmountPosted", "methodUpdate"]);

// Reactive State
const amount = ref("");
const source = ref("")
const description = ref("");
const selectedMethod = ref("");
const rating = ref(0);
const currency = ref("eur");
const valid = ref(false);
const loading = ref(false);

// Computed Language
const currentLanguage = computed(() => props.language); // Automatically reacts to prop changes

import { useLocale } from 'vuetify'
const { t } = useLocale()

// Labels and Language Mappings


const he = reactive({
  charity: "צדקה",
  income: "ריווח",
  expense: "עלוות",
});

//const charityMethods = ref([ "Antwerp", "Chasidus", "Family", "Other"]);
const charityMethods =  ref([
  { value: "Antwerp", text: "Antwerp", isButton: false },
  { value: "Chasidus", text: "Chasidus", isButton: false },
  { value: "Family", text: "Family", isButton: false },
  { value: "Other", text: "Other", isButton: false },
  { value: "action", text: "Do Something", isButton: true },
]);


// Validation Rules
const amountRules = [
  (value) => !!value || t("Please enter an amount."),
  (value) => /^[0-9]+(\.[0-9]{1,2})?$/.test(value) || t("Enter a valid number."),
];

// Form Data
const formData = computed(() => ({
  amount: amount.value || null,
  currency: currency.value || null,
  source: source.value || null,
  description: description.value || null,
  user: localStorage.getItem("id") || null,
  method: props.inputMethod || null,
  integrity: rating.value || null,
  charity_method: selectedMethod.value || null,
}));

// Methods
const updateCurrency = (newCurrency) => (currency.value = newCurrency);
const updateRating = (newRating) => (rating.value = newRating);

const processSelection = (selection) => {
  selectedMethod.value = selection;
};

const postInfo = async () => {
  try {
    const response = await fetch("http://localhost:3443/amount/post/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData.value),
    });

    const data = await response.json();
    if (data.Success) {
      emit("newAmountPosted");
    }
  } catch (error) {
    console.error("Error posting data:", error);
  }
};

const submitForm = async () => {
  if (valid.value) {
    loading.value = true;
    try {
      await postInfo();
    } finally {
      setTimeout(() => {
        loading.value = false;
        resetForm();
      }, 2000);
    }
  } else {
    console.log("Form is not valid");
  }
};

const resetForm = () => {
  amount.value = "";
  description.value = "";
  selectedMethod.value = "";
  rating.value = 0;
  form.value?.reset();
};

// Watch for language changes and emit updates
// watch(() => props.language, (newLang) => {
//   emit("methodUpdate", charityMethods[newLang]);
// });

// Lifecycle
onMounted(() => {
  // setTimeout(() => {
  //   emit("methodUpdate", charityMethods[currentLanguage.value]);
  // }, 1000);

  emit("methodUpdate", charityMethods.value);
});
</script>
