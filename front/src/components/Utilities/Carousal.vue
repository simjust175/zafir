<template>
  <v-carousel :height="height" :show-arrows="false" cycle hide-delimiters>
    <v-carousel-item v-for="(slide, i) in images" :key="i">
      <v-sheet height="100%">
        <v-img :src="imageChoice(i)" :height="height" cover></v-img>
      </v-sheet>
    </v-carousel-item>
  </v-carousel>
</template>
<script>
export default {
  data() {
    return {
      images: [
        1, 2, 3, 4
      ],
    }
  },
  props: {
    height: Number,
  },
  methods: {
    imageChoice(image) {
      return `/test_images/${image}.JPG`
    }
  }
}
</script>