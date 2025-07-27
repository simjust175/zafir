<template> 
  <div class="margin-setter d-flex align-center px-0">
    <v-card
      class="wrapper d-flex ga-0"
      variant="tonal"
    >
      <v-number-input
        v-model="localMargin"
        control-variant="hidden"
        density="compact"
        variant="text"
        hide-details
        max-height="10"
        prefix="%"
        :rules="inputRules"
        class="margin-input"
        @update:model-value="onMarginChange"
        @click.stop
      />
      <div class="d-flex flex-column align-center pl-0 pr-1">
        <v-icon
          icon="mdi-chevron-up"
          @click.stop="localMargin++"
        />
        <v-icon
          icon="mdi-chevron-down"
          @click.stop="localMargin--"
        />
      </div>
    </v-card>
    <v-sheet
      class="button-wrapper mt-1 d-flex flex-column ga-1 ml-1 pl-0 d-flex justify-center"
      :width="55"
    >
      <v-btn
        v-show="marginChangedMap[item.issuer]"
        :loading="loading"
        size="small"
        class="px-8"
        text="Save"
        density="comfortable"
        color="success"
        @click.stop="saveMargin(item)"
      />
      <v-btn
        v-show="marginChangedMap[item.issuer]"
        :loading="loading"
        size="small"
        class="px-8"
        text="Cancel"
        density="comfortable"
        color="error"
        @click.stop="cancelMargin(item)"
      />
    </v-sheet>
  </div>
</template>
  
  <script setup>
  import { ref, watch } from "vue";
  
  const props = defineProps({
    item: {
      type: Object,
      required: true,
    },
  });

const inputRules = [
  (value) => !!value && value != 0 || "", //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< 👁️👁️
];
  const emit = defineEmits(['marginUpdate'])
  
  const localMargin = ref(props.item.totalMargin);
  const marginChangedMap = ref({});
  const loading = ref(false)
  
  // Watch localMargin for changes
  const onMarginChange = (value) => {
    marginChangedMap.value[props.item.issuer] = value !== props.item.totalMargin;
  };
  watch(()=>localMargin.value, (update)=> onMarginChange(update))
  
 
  const saveMargin = async(item) => {
    const query = [{project: props.item.invoices[0].project}, {issuer: item.issuer}];
    if(localMargin.value === null) return null
    const res = await fetch(`${import.meta.env.VITE_BASE_URL}/invoice/patch/invoices?margin=${JSON.stringify(query)}`, {
        method: 'PATCH',
        headers: {'Content-Type' : 'application/json'},
        body: JSON.stringify({margin: localMargin.value})
    })
    if (!res.ok) {
      throw new Error('Failed to change margin')
    }
    loading.value = true
    setTimeout(() => {
        loading.value = false;
      }, 2000);
    const data = await res.json()
    console.log("Margin has been updated!!", data);
    
    // Reset changed flag
    marginChangedMap.value[item.issuer] = false;
    emit('marginUpdate', localMargin.value)
  };

  const cancelMargin = (item) => {
  localMargin.value = item.totalMargin
  marginChangedMap.value[item.issuer] = false
}

</script>

<style>
.margin-input {
  max-width: 90px;
  height: 80%; 
  padding: 0 !important;
  margin: 0 !important;
}

.margin-setter .v-field {
  margin: 0 !important;
  padding: 0 !important;
  display: flex !important;
  align-items: center !important;
}
.margin-setter .v-field__input {
  padding-right: 2px !important;
}


.margin-setter .v-field__field{
  margin: 0 !important;
  padding: 0 !important;
  display: flex !important;
  align-items: center !important;
}

.margin-setter .v-input__control {
  margin-block: 0 !important;
  padding: 0 !important;
}

.margin-setter .v-number-input--stacked .v-number-input__control {
  height: 100% !important; /* now this works correctly */
  align-items: center !important;
  display: flex !important;
  padding: 0 !important;
  margin: 0 !important;
}

.margin-setter .button-wrapper {
  min-height: 48px;
}
</style>