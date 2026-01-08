<template>
  <v-container
    fluid
    fill-height
    class="pa-0 mt-4 "
  >
    <!-- :class="themeBackgroundColor" -->
    <!-- <v-card
      color="blue"
      elevation="4"
      class="d-flex flex-row"
      style="min-height: 450px; border-radius: 12px;"
    > -->
    <!-- Left side image -->
          
        
    <v-row>
      <!-- Right side sign-in form -->
      <v-col
        cols="12"
        align-center
        class="d-flex flex-column align-center justify-center pa-12"
        style="border-top-right-radius: 12px; border-bottom-right-radius: 12px;"
      >
        <h2
          class="font-weight-bold mb-6"
          style="color:#003366;"
        >
          Welcome Back
        </h2>
        <p
          class="mb-8"
          style="color:#606f7b;"
        >
          Please sign in with your corporate credentials to continue.
        </p>

        <v-card
          class="py-4 px-7"
          width="450"
          image="/construct_bg2.jpeg"
        >
          <LoginForm
            v-bind="$attrs"
            @sign-in="loginActive = false"
            @forgot-active="forgot = $event"
          />
        </v-card>
      </v-col>
    </v-row>
    <!-- </v-card> -->
  </v-container>
</template>


<script>
// import { useTheme } from "vuetify";
// const theme = useTheme()
import LoginForm from "../RegisterForms/LoginForm.vue";
export default {
  components: { LoginForm },
  props: {
    loginTriggered: Boolean,
  },
  data() {
    return {
      loginActive: false,
      forgot: false,
    };
  },
  computed:{
    // themeBackgroundColor(){
    //   return theme.global.name.value === 'light' ? 'bg-grey-lighten-4' : '';
    // }
  }
};
</script>

<style scoped>
/* Responsive tweaks */
@media (max-width: 960px) {
  .v-card.d-flex.flex-row {
    flex-direction: column !important;
    min-height: auto !important;
  }
  .v-col[cols="12"][md="6"] {
    border-radius: 0 !important;
  }
}
</style>

<!-- 

<template>
  <v-container
    fluid
    fill-height
    class="pa-0 mt-4"
    style="background-color: #f5f7fa;"
  >
    <v-row
      class="fill-height"
      align="center"
      justify="center"
      no-gutters
    >
      <v-col
        cols="12"
        md="10"
        lg="8"
      >
        <v-card
          elevation="4"
          class="d-flex flex-row"
          style="min-height: 450px; border-radius: 12px;"
        >-->
          <!-- Left side image -->
          <!--<v-col
            cols="12"
            md="6"
            class="d-flex align-center justify-center"
            style="background-color: #004d99; border-top-left-radius: 12px; border-bottom-left-radius: 12px;"
          >
            <v-img
              src="../../../public/login.png"
              contain
              max-width="100%"
              max-height="400"
              alt="Corporate Sign-In Image"
            />
          </v-col>
-->
          <!-- Right side sign-in form -->

<!--

          <v-col
            cols="12"
            md="6"
            class="d-flex flex-column justify-center pa-12"
            style="background-color: #ffffff; border-top-right-radius: 12px; border-bottom-right-radius: 12px;"
          >
            <h2
              class="font-weight-bold mb-6"
              style="color:#003366;"
            >
              Welcome Back
            </h2>
            <p
              class="mb-8"
              style="color:#606f7b;"
            >
              Please sign in with your corporate credentials to continue.
            </p>

            <v-card
              flat
              class="pa-0"
            >
              <LoginForm
                v-bind="$attrs"
                @sign-in="loginActive = false"
                @forgot-active="forgot = $event"
              />
            </v-card>
          </v-col>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template> 

-->

<style>

</style>