<template>
  <v-sheet class="pa-5 rounded-lg" min-height="81vh">
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

    <!--  Desktop List Skeleton  -->
    <div class="d-none d-md-inline" v-if="contactsLoading">
      <v-row class="mt-6" justify="center">
        <v-col cols="2" v-for="index in 12">
          <v-card class="px-0 py-10" outlined>
            <div class="d-flex justify-center">
              <v-skeleton-loader class="mt-1" type="avatar" transition="scale-transition"></v-skeleton-loader>
            </div>
            <div class="d-flex justify-center mt-n3">
              <v-skeleton-loader width="30"
                                 height="30"
                                 class="mt-5"
                                 type="avatar"
                                 style="border-top-left-radius: 25px"
                                 tile>
              </v-skeleton-loader>
              <v-skeleton-loader width="30"
                                 height="30"
                                 class="mt-5"
                                 type="avatar"
                                 style="border-top-right-radius: 25px"
                                 tile>
              </v-skeleton-loader>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!--  Desktop List  -->
    <div class="d-none d-md-inline" v-if="!contactsLoading">
      <v-row class="mt-6" justify="center">
        <v-col cols="2"
               v-for="contact in list"
               @contextmenu="showContextMenu($event,contact._id)">
          <v-card class="px-0"
                  :disabled="contextMenu.loading && contextMenu.id === contact._id"
                  :loading="contextMenu.loading && contextMenu.id === contact._id"
                  outlined>
            <div class="d-flex justify-center mt-6">
              <ContactAvatar :avatar="contact.avatar"
                             :name="contact.firstName"
                             :color="contact.color" :size="110"/>
            </div>
            <div class="d-flex justify-center">
              <label class="mt-4 font-weight-bold">{{ contact.firstName + ' ' + contact.lastName }}</label>
            </div>
            <div class="d-flex justify-center mb-3  mt-2">
              <v-btn class="mx-2" icon>
                <v-icon>mdi-phone-outline</v-icon>
              </v-btn>
              <v-btn icon>
                <v-icon>mdi-video-outline</v-icon>
              </v-btn>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!--  Contact context menu  -->
    <v-menu v-model="contextMenu.show"
            :position-x="contextMenu.x"
            :position-y="contextMenu.y"
            transition="slide-x-transition"
            absolute
            offset-y>
      <v-list dense>
        <v-list-item @click="deleteContact" link>
          <v-list-item-title>{{ $t(`DELETE`) }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>

    <!--  Mobile  List Skeleton  -->
    <v-skeleton-loader v-if="contactsLoading"
                       v-for="index in 6"
                       :key="index"
                       class="mt-3 mx-n3 d-block d-md-none"
                       type="list-item-avatar-two-line">
    </v-skeleton-loader>

    <!--  Mobile  List   -->
    <v-list v-if="!contactsLoading" class="mt-3 mx-n3 d-block d-md-none" nav>
      <v-list-item v-for="contact in list"
                   :key="contact.email"
                   :disabled="contextMenu.loading && contextMenu.id === contact._id"
                   @contextmenu="showContextMenu($event,contact._id)">
        <v-list-item-avatar>
          <ContactAvatar :avatar="contact.avatar"
                         :name="contact.firstName"
                         :color="contact.color"/>
        </v-list-item-avatar>
        <v-list-item-content>
          <v-list-item-title>{{ contact.firstName + ' ' + contact.lastName }}</v-list-item-title>
        </v-list-item-content>
        <v-list-item-icon>
          <v-btn class="mx-2" icon>
            <v-icon>mdi-phone-outline</v-icon>
          </v-btn>
          <v-btn icon>
            <v-icon>mdi-video-outline</v-icon>
          </v-btn>
        </v-list-item-icon>
      </v-list-item>
    </v-list>

    <div v-if="!contactsLoading && !list.length">
      <v-row class="d-flex justify-center">
        <h2 class="mt-16">{{ $t(`NO_CONTACT`) }}</h2>
      </v-row>

      <v-row class="d-flex justify-center my-7">
        <v-btn color="primary" @click="addContactDialog = true">
          {{ $t(`ADD_CONTACT`) }}
        </v-btn>
      </v-row>
    </div>


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
      contextMenu      : {
        show   : false,
        loading: false,
        x      : 0,
        y      : 0,
        id     : ''
      }
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
      this.$axios.post('contacts', {
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
      this.$axios.get('contacts').then(async response => {
        this.list            = response.data.contacts;
        this.contactsLoading = false;
      });
    },
    async deleteContact() {
      this.contextMenu.loading = true;
      this.$axios.delete('contacts/' + this.contextMenu.id).then(async response => {
        this.$notifier.showMessage({
          content: this.$t(`CONTACT_DELETED`),
          color  : 'success'
        });
        await this.getContacts();
      }).catch(({response}) => {
        if (response.status) {
          switch (response.status) {
            case 406:
              this.$notifier.showMessage({
                content: this.$t(`CONTACT_NOT_FOUND`),
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
        this.contextMenu.loading = false;
      });
    },
    showContextMenu(e, id) {
      e.preventDefault();
      if (!this.contextMenu.loading) {
        this.contextMenu.show = false;
        this.contextMenu.x    = e.clientX;
        this.contextMenu.y    = e.clientY;
        this.contextMenu.id   = id;
        this.$nextTick(() => {
          this.contextMenu.show = true;
        });
      }
    }
    ,
  },
  mounted() {
    this.getContacts();
  }
}
</script>

<style scoped>

</style>
