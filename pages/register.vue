<template>
  <v-col cols="12" md="6" offset-md="3" class="d-flex flex-column justify-center align-center">
    <!--   Logo   -->
    <v-img width="200px"
           class="d-block my-5"
           src="mainLogo.svg"></v-img>

    <v-card width="100%" shaped>
      <v-card-title class="justify-center">
        <span class="text-h4 d-block">Register</span>
      </v-card-title>
      <v-card-text class="px-5 px-md-16">
        <validation-observer ref="observer" v-slot="{ invalid }">
          <form @submit.prevent="submit">

            <!--      First Name      -->
            <validation-provider v-slot="{ errors , valid }" name="first name" rules="required|max:20|alpha_spaces">
              <v-text-field
                v-model="firstName"
                :counter="20"
                :error-messages="errors"
                :color="valid ? 'green' : ''"
                :append-icon="valid ? 'mdi-check' : ''"
                label="first name">
              </v-text-field>
            </validation-provider>

            <!--      Last Name      -->
            <validation-provider v-slot="{ errors , valid }" name="last name" rules="required|max:20|alpha_spaces">
              <v-text-field
                v-model="lastName"
                :counter="20"
                :error-messages="errors"
                :color="valid ? 'green' : ''"
                :append-icon="valid ? 'mdi-check' : ''"
                label="last name">
              </v-text-field>
            </validation-provider>

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

            <!-- Password Confirm -->
            <validation-provider v-slot="{ errors , valid }" name="confirmPassword" rules="required|confirmed:password">
              <v-text-field v-model="confirmPassword"
                            :error-messages="errors"
                            :color="valid ? 'green' : ''"
                            :append-icon="valid ? 'mdi-check' : ''"
                            label="Confirm Password"
                            prepend-inner-icon="mdi-lock-check"
                            type="password">
              </v-text-field>
            </validation-provider>

            <!--     Register Button       -->
            <v-btn
                   color="primary"
                   type="submit"
                   class="float-left my-6 mx-5">
              Register
            </v-btn>

            <!--     Login Button       -->
            <v-btn color="accent" class="float-left my-6" to="/login" nuxt>Login</v-btn>

          </form>
        </validation-observer>
      </v-card-text>
    </v-card>
  </v-col>
</template>

<script>

import {ValidationProvider, ValidationObserver} from "vee-validate";

export default {
  name      : "register",
  auth      : 'guest',
  components: {
    ValidationObserver,
    ValidationProvider
  },
  data      : () => {
    return {
      firstName      : '',
      lastName       : '',
      email          : '',
      password       : '',
      confirmPassword: '',
    }
  },
  head      : {
    title: 'Register'
  },
  methods   : {
    async submit() {
      let result = this.$axios.post('users/register');
    }
  }
}
</script>

<style scoped>

</style>
