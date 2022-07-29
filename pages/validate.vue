<template>
  <v-sheet class="pa-5 rounded-lg" min-height="80vh">
    <h1>{{ $t(`CONFIRM_PHONE`) }}</h1>
    <v-row class="pt-16">
      <v-col cols="12" md="6" offset-md="3">
        <validation-observer ref="observer" v-slot="{ invalid }">
          <form @submit.prevent="submit">

            <!--      Phone      -->
            <validation-provider v-slot="{ errors , valid }" name="phoneNumber" rules="required|max:11|phone">
              <v-text-field v-model="phone"
                            :counter="11"
                            :disabled="loading || codeSent"
                            :error-messages="errors"
                            :color="valid ? 'green' : ''"
                            :append-icon="valid ? 'mdi-check' : ''"
                            prepend-inner-icon="mdi-phone-outline"
                            :label="$t(`PHONE_NUMBER`)">
              </v-text-field>
            </validation-provider>

            <!--      validation Code      -->
            <validation-provider v-if="codeSent" v-slot="{ errors , valid }" name="validationCode" rules="required">
              <v-text-field v-model="validationCode"
                            :disabled="loading"
                            :error-messages="errors"
                            :color="valid ? 'green' : ''"
                            :append-icon="valid ? 'mdi-check' : ''"
                            prepend-inner-icon="mdi-check-decagram-outline"
                            :label="$t(`VALIDATION_CODE`)">
              </v-text-field>
            </validation-provider>

            <!--     Validate Button       -->
            <v-btn color="primary"
                   type="submit"
                   class="float-left mt-10 mx-5"
                   :disabled="invalid || (codeSent && !validationCode)"
                   :loading="loading">
              {{ $t(`CONFIRM`) }}
            </v-btn>

          </form>
        </validation-observer>
      </v-col>
    </v-row>
  </v-sheet>
</template>

<script>

import {ValidationProvider, ValidationObserver} from "vee-validate";

export default {
  name      : "validate",
  auth      : true,
  middleware: 'auth',
  components: {
    ValidationObserver,
    ValidationProvider
  },
  data      : () => {
    return {
      phone         : '',
      validationCode: '',
      loading       : false,
      codeSent      : false,
    }
  },
  mounted() {
    this.phone = this.$auth.user.phone;
  },
  computed: {},
  methods : {
    async submit() {
      this.loading = true;
      this.$axios.put('users/validate', {
        phone         : this.phone,
        validationCode: this.validationCode,
      }).then(async response => {
        if (response.data.message === 'Code sent') {
          this.codeSent = true;
          setTimeout(() => {
            this.codeSent = false;
            if (!this.$auth.user.validate) {
              this.$notifier.showMessage({
                content: this.$t(`VALIDATION_EXPIRED`),
                color  : 'error'
              });
            }
          }, 120000);
          this.$notifier.showMessage({
            content: this.$t(`VALIDATION_CODE_SENT`),
            color  : 'success'
          });
        } else if (response.data.message === 'Validation completed') {
          await this.$auth.fetchUser();

          // redirect user to dashboard
          await this.$router.push({
            path: "/dashboard"
          });

          this.$notifier.showMessage({
            content: this.$t(`VALIDATION_SUCCESSFUL`),
            color  : 'success'
          });
        }
      }).catch(({response}) => {
        if (response.status) {
          switch (response.status) {
            case 406:
              this.$notifier.showMessage({
                content: this.$t(`EMAIL_EXISTS`),
                color  : 'error'
              });
            case 400:
              if (response.data && response.data.message === 'The validation code is incorrect') {
                this.$notifier.showMessage({
                  content: this.$t(`INCORRECT_VALIDATION`),
                  color  : 'error'
                });
              } else if (response.data && response.data.message === 'The code has expired') {
                this.$notifier.showMessage({
                  content: this.$t(`VALIDATION_EXPIRED`),
                  color  : 'error'
                });

              }
              break;
          }
        } else {
          this.$notifier.showMessage({
            content: this.$t(`REQUEST_FAILED`),
            color  : 'error'
          });
        }
      }).finally(() => {
        this.loading = false;
      });
    }
  }
}
</script>

<style scoped>

</style>
