<template>
  <v-col cols="12" md="6" offset-md="3" class="d-flex flex-column justify-center align-center">
    <v-card width="100%">
      <v-card-title class="justify-center">
        <span class="text-h4 d-block">{{ $t(`REGISTER`) }}</span>
      </v-card-title>
      <v-card-text class="px-5 px-md-16">
        <validation-observer ref="observer" v-slot="{ invalid }">
          <form @submit.prevent="submit">

            <!--      First Name      -->
            <validation-provider v-slot="{ errors , valid }" name="first name" rules="required|max:20">
              <v-text-field v-model="firstName"
                            :counter="20"
                            :disabled="loading"
                            :error-messages="errors"
                            :color="valid ? 'green' : ''"
                            :append-icon="valid ? 'mdi-check' : ''"
                            :label="$t(`FIRST_NAME`)">
              </v-text-field>
            </validation-provider>

            <!--      Last Name      -->
            <validation-provider v-slot="{ errors , valid }" name="last name" rules="required|max:20">
              <v-text-field v-model="lastName"
                            :counter="20"
                            :disabled="loading"
                            :error-messages="errors"
                            :color="valid ? 'green' : ''"
                            :append-icon="valid ? 'mdi-check' : ''"
                            :label="$t(`LAST_NAME`)">
              </v-text-field>
            </validation-provider>

            <!--     E-mail       -->
            <validation-provider v-slot="{ errors , valid }" name="email" rules="required|email">
              <v-text-field v-model="email"
                            :error-messages="errors"
                            :disabled="loading"
                            :color="valid ? 'green' : ''"
                            :append-icon="valid ? 'mdi-check' : ''"
                            prepend-inner-icon="mdi-email-outline"
                            :label="$t(`E_MAIL`)">
              </v-text-field>
            </validation-provider>

            <!-- Password -->
            <validation-provider v-slot="{ errors , valid }" name="password" rules="required|min:8">
              <v-text-field v-model="password"
                            :error-messages="errors"
                            :disabled="loading"
                            :color="valid ? 'green' : ''"
                            :append-icon="valid ? 'mdi-check' : ''"
                            :label="$t(`PASSWORD`)"
                            prepend-inner-icon="mdi-lock"
                            type="password">
              </v-text-field>
            </validation-provider>

            <!-- Password Confirm -->
            <validation-provider v-slot="{ errors , valid }" name="confirmPassword" rules="required|confirmed:password">
              <v-text-field v-model="confirmPassword"
                            :disabled="loading"
                            :error-messages="errors"
                            :color="valid ? 'green' : ''"
                            :append-icon="valid ? 'mdi-check' : ''"
                            :label="$t(`CONFIRM_PASSWORD`)"
                            prepend-inner-icon="mdi-lock-check"
                            type="password">
              </v-text-field>
            </validation-provider>

            <!--     Register Button       -->
            <v-btn color="primary"
                   type="submit"
                   class="float-left my-6 mx-5"
                   :disabled="invalid"
                   :loading="loading">
              {{ $t(`REGISTER`) }}
            </v-btn>

            <!--     Login Button       -->
            <v-btn color="accent" class="float-left my-6" to="/login" nuxt>{{ $t(`LOGIN`) }}</v-btn>

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
  middleware: 'auth',
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
      loading        : false,
    }
  },
  head      : {
    title: 'Register'
  },
  mounted() {

  },
  methods: {
    async submit() {
      this.loading = true;
      let result   = this.$axios.post('auth/register', {
        firstName: this.firstName,
        lastName : this.lastName,
        email    : this.email,
        password : this.password,
      }).then(async response => {
        await this.$auth.setUserToken(response.data.token);
        this.$notifier.showMessage({
          content: this.$t(`REGISTER_SUCCESSFUL`),
          color  : 'success'
        });
        this.loading = false;
        // redirect user
        await this.$router.push({
          path: "/dashboard"
        });
      }).catch(({response}) => {
        this.loading = false;
        if (response.status) {
          switch (response.status) {
            case 406:
              this.$notifier.showMessage({
                content: this.$t(`EMAIL_EXISTS`),
                color  : 'error'
              });
              break;
            case 500 || 504:
              this.$notifier.showMessage({
                content: this.$t(`REQUEST_FAILED`),
                color  : 'error'
              });
              break;
          }
        } else {
          this.$notifier.showMessage({
            content: this.$t(`REQUEST_FAILED`),
            color  : 'error'
          });
        }
      });
    }
  }
}
</script>

<style scoped>

</style>
