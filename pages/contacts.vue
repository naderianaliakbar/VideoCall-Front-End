<template>
  <v-sheet class="pa-5 rounded-lg">
    <h1>
      {{ $t(`CONTACTS`) }}
      <!--    Button Add a contact    -->
      <v-tooltip bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-btn class="mt-1 mx-2"
                 :class="directionOfLanguage === 'rtl' ? 'float-left' : 'float-right'"
                 @click="addContactDialog = true"
                 v-bind="attrs"
                 v-on="on"
                 outlined
                 icon>
            <v-icon>mdi-account-plus-outline</v-icon>
          </v-btn>
        </template>
        <span>{{ $t(`ADD_CONTACT`) }}</span>
      </v-tooltip>
    </h1>

    <!--     Add a contact Dialog     -->
    <v-dialog v-model="addContactDialog"
              max-width="400px"
              transition="dialog-bottom-transition"
              persistent>
      <v-card>
        <v-toolbar>
          <v-toolbar-title>{{ $t(`ADD_CONTACT`) }}</v-toolbar-title>

          <v-spacer></v-spacer>

          <!--     Close Button       -->
          <v-btn :disabled="addContactLoading"
                 @click="addContactDialog = false"
                 class="my-6"
                 icon>
            <v-icon>mdi-close</v-icon>
          </v-btn>

        </v-toolbar>
        <v-card-text class="pa-2">
          <v-container class="pa-3" fluid>
            <v-row>
              <v-col cols="12">
                <validation-observer ref="observer" v-slot="{ invalid }">
                  <form @submit.prevent="addContact">

                    <!--     E-mail       -->
                    <validation-provider v-slot="{ errors , valid }" name="email" rules="required|email">
                      <v-text-field v-model="addContactForm.email"
                                    :error-messages="errors"
                                    :color="valid ? 'green' : ''"
                                    :append-icon="valid ? 'mdi-check' : ''"
                                    :label="$t(`E_MAIL`)"
                                    :disabled="addContactLoading"
                                    prepend-inner-icon="mdi-email-outline">
                      </v-text-field>
                    </validation-provider>

                    <!--     Add Button       -->
                    <v-btn :disabled="invalid"
                           :loading="addContactLoading"
                           :class="directionOfLanguage === 'rtl' ? 'float-left' : 'float-right'"
                           color="primary"
                           type="submit"
                           class="my-3">
                      {{ $t(`ADD`) }}
                    </v-btn>

                  </form>
                </validation-observer>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
      </v-card>
    </v-dialog>

  </v-sheet>
</template>

<script>

import {ValidationProvider, ValidationObserver} from "vee-validate";

export default {
  name      : "contacts",
  auth      : true,
  components: {
    ValidationObserver,
    ValidationProvider
  },
  data      : () => {
    return {
      contactsLoading  : false,
      addContactLoading: false,
      addContactDialog : false,
      addContactForm   : {
        email: ''
      },
      list             : [
        {firstName: 'AliAkbar', lastName: 'Naderian', email: 'naderianaliakbar@gmail.com'},
        {firstName: 'Mehdi', lastName: 'Asefi', email: 'mehdiasefi1381@gmail.com'},
      ]
    };
  },
  computed  : {
    directionOfLanguage() {
      return this.$nuxt.$i18n.localeProperties.dir;
    }
  },
  methods   : {
    async addContact() {

    }
  }
}
</script>

<style scoped>

</style>
