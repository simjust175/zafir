<template>
    <v-card
      class="mx-auto text-center pt-10"
      color="grey-lighten-3"
      max-width="600"
      height="600"
      dark
    >
      <v-card-text>
        <v-sheet color="rgba(0, 0, 0, .12)">
          <v-sparkline
            :model-value="value"
            color="blue"
            height="100"
            padding="14"
            stroke-linecap="round"
            line-width="1.5"
            auto-draw
          >
            <template v-slot:label="item">
              ${{ item.value }}
            </template>
          </v-sparkline>
        </v-sheet>
      </v-card-text>
  
      <v-card-text>
        <div class="text-h6 font-weight-thin">
          Yearly Progress 
        </div>
      </v-card-text>
  
      <!-- <v-divider></v-divider>
  
      <v-card-actions class="justify-center">
        <v-btn
          variant="text"
          block
        >
          Go to Report
        </v-btn>
      </v-card-actions> -->
    </v-card>
  </template>
  <script>
    export default {
      data: () => ({
        value: [
          423,
          446,
          134,
          510,
          590,
          410,
         576,
         345,
         200,
         345
        ],
      }),
      props:{
        amountsPaid: Array
      }
    }
  </script>