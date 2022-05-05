<template>
  <v-sheet class="pa-5 rounded-lg">
    <h1>{{ $t(`LOGIN`) }}</h1>
    <v-row>
      <v-col cols="12" md="6" offset-md="3">
        <validation-observer ref="observer" v-slot="{ invalid }">
          <form @submit.prevent="submit">

            <!--     E-mail       -->
            <validation-provider v-slot="{ errors , valid }" name="email" rules="required|email">
              <v-text-field v-model="email"
                            :error-messages="errors"
                            :color="valid ? 'green' : ''"
                            :append-icon="valid ? 'mdi-check' : ''"
                            :label="$t(`E_MAIL`)"
                            :disabled="loading"
                            prepend-inner-icon="mdi-email-outline">
              </v-text-field>
            </validation-provider>

            <!-- Password -->
            <validation-provider v-slot="{ errors , valid }" name="password" rules="required|min:8">
              <v-text-field v-model="password"
                            :error-messages="errors"
                            :color="valid ? 'green' : ''"
                            :append-icon="valid ? 'mdi-check' : ''"
                            :label="$t(`PASSWORD`)"
                            :disabled="loading"
                            prepend-inner-icon="mdi-lock"
                            type="password">
              </v-text-field>
            </validation-provider>


            <!--     Login Button       -->
            <v-btn :disabled="invalid"
                   :loading="loading"
                   color="primary"
                   type="submit"
                   class="float-left my-6 mx-5">
              {{ $t(`LOGIN`) }}
            </v-btn>

            <!--     Register Button       -->
            <v-btn color="accent" class="float-left my-6" to="/register" nuxt>{{ $t(`REGISTER`) }}</v-btn>

          </form>
        </validation-observer>
      </v-col>
    </v-row>
  </v-sheet>
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
      password: '',
      loading : false,
    };
  },
  mounted() {

  },
  methods: {
    async submit() {
      this.loading = true;

      await this.$auth.loginWith('local', {
        data: {
          email   : this.email,
          password: this.password
        }
      }).then(response => {
        this.loading = false;
        // set notifier
        this.$notifier.showMessage({
          content: this.$t(`LOGIN_SUCCESSFUL`),
          color  : 'success'
        });


        // redirect to dashboard
        this.$router.push({
          path: "/dashboard"
        })
      }).catch(({response}) => {
        this.loading = false;
        // set notifier
        if (response.status === 401) {
          this.$notifier.showMessage({
            content: this.$t(`LOGIN_WRONG_DATA`),
            color  : 'error'
          });
        }
      });
    }
  }
}
</script>
