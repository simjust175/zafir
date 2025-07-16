<template>
  <div
    class="d-flex align-center position-relative"
    style="gap: 8px;"
  >
    <v-number-input
      v-model="localMargin"
      control-variant="hidden"
      density="comfortable"
      color="primary"
      variant="outlined"
      class="d-flex align-center justify-center cursor-not-allowed"
      prefix="%"
      :rules="inputRules"
      :style="{ width: '100px', minWidth: '120px' }"
      message=""
      @update:model-value="onMarginChange"
      @click.stop
    />
    <div
      class="d-flex flex-column ga-2 gl-0 ml-0 pl-0"
      :style="{ visibility: marginChangedMap[item.issuer] ? 'visible' : 'hidden' }"
    >
      <v-btn
        :loading="loading"
       
        size="small"
        text="Save"
        density="comfortable"
        color="success"
        @click.stop="saveMargin(item)"
      />
      <v-btn
        :loading="loading"
        size="small"
        text="Cancel"
        density="comfortable"
        color="error"
        @click.stop="cancelMargin(item)"
      />
    </div>
  </div>
</template>
  
  <script setup>
  import { ref } from "vue";
  
  const props = defineProps({
    item: {
      type: Object,
      required: true,
    },
  });

const inputRules = [
  (value) => !!value || "!",
  (value) => /^[0-9]+(\.[0-9]{1,2})?$/.test(value) || "Enter a valid number."
];
  const emit = defineEmits(['marginChange'])
  
  const localMargin = ref(props.item.totalMargin); // make reactive local copy
  const marginChangedMap = ref({});
  const loading = ref(false)
  
  // Watch localMargin for changes
  const onMarginChange = (value) => {
    marginChangedMap.value[props.item.issuer] = value !== props.item.totalMargin;
  };
  
  // Optional: Save function to emit or call API
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
    emit('marginChange', localMargin.value)
  };

  function cancelMargin(item) {
  localMargin.value = item.totalMargin
  marginChangedMap.value[item.issuer] = false
}


  </script>
