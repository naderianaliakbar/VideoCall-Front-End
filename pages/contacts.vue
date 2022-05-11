<template>
  <v-sheet class="pa-3 pa-md-5 rounded-lg" min-height="50vh">
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

    <!--   List   -->
    <v-list class="mt-3" nav>
      <v-list-item v-for="contact in list" :key="contact.email">
        <v-list-item-avatar>
          <ContactAvatar :avatar="contact.avatar"
                         :name="contact.firstName"
                         :color="contact.color"/>
        </v-list-item-avatar>
        <v-list-item-content>
          <v-list-item-title>{{ contact.firstName + ' ' + contact.lastName }}</v-list-item-title>
        </v-list-item-content>
        <v-list-item-icon>
          <v-btn  class="mx-2" large icon>
            <v-icon>mdi-phone-outline</v-icon>
          </v-btn>
          <v-btn large icon>
            <v-icon>mdi-video-outline</v-icon>
          </v-btn>
        </v-list-item-icon>
      </v-list-item>
    </v-list>

    <row v-if="!list.length">
      <v-row class="d-flex justify-center">
        <h2 class="d-block">{{ $t(`NO_CONTACT`) }}</h2>
      </v-row>

      <v-row class="d-flex justify-center my-7">
        <v-btn color="primary">
          {{ $t(`ADD_CONTACT`) }}
        </v-btn>
      </v-row>
    </row>




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
      contactsLoading  : true,
      addContactLoading: false,
      addContactDialog : false,
      addContactForm   : {
        email: ''
      },
      list             : [],
    }
  },
  computed  : {
    directionOfLanguage() {
      return this.$nuxt.$i18n.localeProperties.dir;
    }
  },
  methods   : {
    async addContact() {
      this.addContactLoading = true;
      this.$axios.post('users/contacts', {
        email: this.addContactForm.email,
      }).then(async response => {
        this.$notifier.showMessage({
          content: this.$t(`CONTACT_ADDED`),
          color  : 'success'
        });
        await this.getContacts();
        this.addContactDialog = false;
      }).catch(({response}) => {
        if (response.status) {
          switch (response.status) {
            case 406:
              this.$notifier.showMessage({
                content: this.$t(`CONTACT_NOT_FOUND`),
                color  : 'error'
              });
              break;
            case 400:
              this.$notifier.showMessage({
                content: this.$t(`CONTACT_ALREADY_EXISTS`),
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
      }).finally(() => {
        this.addContactLoading = false;
      });
    },
    async getContacts() {
      this.contactsLoading = true;
      this.$axios.get('users/contacts').then(async response => {
        this.list            = response.data.contacts;
        this.contactsLoading = false;
      });
    }
  },
  mounted() {
    this.getContacts();
  }
}
</script>

<style scoped>

</style>
