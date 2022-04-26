<template>
  <v-row>
    <v-col cols="12" md="6" offset-md="3" class="d-flex flex-column justify-center align-center">
      <!--   Logo   -->
      <v-img width="200px"
             class="d-block my-5"
             src="mainLogo.svg"></v-img>

      <v-card width="100%" shaped>
        <v-card-title class="justify-center">
          <span class="text-h4 d-block">Login</span>
        </v-card-title>
        <v-card-text class="px-5 px-md-16">

          <validation-observer ref="observer" v-slot="{ invalid }">
            <form @submit.prevent="submit">

              <!--     E-mail       -->
              <validation-provider v-slot="{ errors , valid }" name="email" rules="required|email">
                <v-text-field
                  v-model="email"
                  :error-messages="errors"
                  :color="valid ? 'green' : ''"
                  :append-icon="valid ? 'mdi-check' : ''"
                  prepend-inner-icon="mdi-email-outline"
                  label="E-mail">
                </v-text-field>
              </validation-provider>

              <!-- Password -->
              <validation-provider v-slot="{ errors , valid }" name="password" rules="required|min:8">
                <v-text-field v-model="password"
                              :error-messages="errors"
                              :color="valid ? 'green' : ''"
                              :append-icon="valid ? 'mdi-check' : ''"
                              label="Password"
                              prepend-inner-icon="mdi-lock"
                              type="password">
                </v-text-field>
              </validation-provider>


              <!--     Login Button       -->
              <v-btn :disabled="invalid"
                     color="primary"
                     type="submit"
                     class="float-left my-6 mx-5">
                Login
              </v-btn>

              <!--     Register Button       -->
              <v-btn color="accent" class="float-left my-6" to="/register" nuxt>Register</v-btn>

            </form>
          </validation-observer>

        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>

import {ValidationProvider, ValidationObserver} from "vee-validate";

export default {
  name      : 'Login',
  components: {
    ValidationObserver,
    ValidationProvider
  },
  head      : {
    title: 'Login'
  },
  data      : () => {
    return {
      email   : '',
      password: ''
    };
  },
  methods   : {
    async submit() {

    }
  }
}
</script>
