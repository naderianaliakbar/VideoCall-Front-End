<template>
  <v-col cols="12" md="6" offset-md="3" class="d-flex flex-column justify-center align-center">
    <v-card width="100%">
      <v-card-title class="justify-center">
        <span class="text-h4 d-block">{{ this.$t(`LOGIN`) }}</span>
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

      </v-card-text>
    </v-card>
  </v-col>
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
    this.$notifier.showMessage({
      content: "YAY Our Plugin worked Successfully!",
      color  : "error"
    });
    this.$notifier.showMessage({
      content: "YAY Our Plugin worked Successfully! 1",
      color  : "error"
    });
  },
  methods: {
    async submit() {
      this.loading = true;
      await this.$auth.loginWith('local', {
        data   : {
          email   : this.email,
          password: this.password
        },
        headers: {
          'Content-type': 'application/json'
        }
      }).then(response => {
        this.formLoader = false;
        this.$auth.setUserToken(response.data.token);
        this.$router.push({
          path: "/user-dashboard"
        })
      }).catch(({response}) => {
        this.formLoader = false;
        if (response.status == 401) {
          this.$toast.error(this.$t(`LOGIN_WRONG_DATA`));
        } else if (response.status == 500 || response.status == 504) {
          this.$toast.error(this.$t(`REQUEST_FAILED`));
        }
      });
    }
  }
}
</script>
