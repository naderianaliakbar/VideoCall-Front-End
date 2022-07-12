<template>
  <v-sheet class="pa-5 rounded-lg">
    <h1>
      {{ $t(`DASHBOARD`) }}
      <!--    Button edit mode    -->
      <v-tooltip bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-btn :class="directionOfLanguage === 'rtl' ? 'float-left' : 'float-right'"
                 @click="profileEditMode = !profileEditMode"
                 v-bind="attrs"
                 v-on="on"
                 class="mt-1"
                 outlined
                 icon>
            <v-icon v-if="!profileEditMode">mdi-account-edit-outline</v-icon>
            <v-icon v-if="profileEditMode">mdi-account-edit</v-icon>
          </v-btn>
        </template>
        <span>{{ $t(`EDIT_PROFILE`) }}</span>
      </v-tooltip>

      <!--    Button logout    -->
      <v-tooltip bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-btn class="mt-1 mx-2"
                 :class="directionOfLanguage === 'rtl' ? 'float-left' : 'float-right'"
                 @click="logoutDialog = true"
                 v-bind="attrs"
                 v-on="on"
                 outlined
                 icon>
            <v-icon>mdi-logout-variant</v-icon>
          </v-btn>
        </template>
        <span>{{ $t(`LOGOUT`) }}</span>
      </v-tooltip>

      <!--    Logout Dialog    -->
      <v-dialog v-model="logoutDialog" width="325px" transition="scale-transition">
        <v-card>
          <v-card-title class="primary">{{ $t(`LOGOUT`) }}</v-card-title>
          <v-card-text class="text-h6 mt-4">
            {{ $t(`ARE_YOU_SURE`) }}
          </v-card-text>
          <v-card-actions>
            <v-btn @click="logout" text> {{ $t(`YES`) }}</v-btn>
            <v-btn @click="logoutDialog = false" text> {{ $t(`NO`) }}</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

    </h1>
    <v-row class="mt-3">
      <v-col cols="3" class="d-flex justify-center">
        <ContactAvatar class="mx-2 my-3 my-md-1"
                       :edit="1"
                       :size="$vuetify.breakpoint.smAndDown ? 80 : 200"
                       :avatar="$auth.user.avatar"
                       :name="$auth.user.firstName"
                       :color="$auth.user.color"/>
      </v-col>
      <v-col cols="9" class="mt-md-6 justify-center">
        <!--    Profile edit      -->
        <validation-observer ref="observer" v-slot="{ invalid }" v-if="profileEditMode">
          <form @submit.prevent="editProfile">
            <!--      First Name      -->
            <validation-provider v-slot="{ errors , valid }" name="first name" rules="required|max:20">
              <v-text-field
                v-model="editForm.firstName"
                :counter="20"
                :disabled="editProfileLoading"
                :error-messages="errors"
                :color="valid ? 'green' : ''"
                :append-icon="valid ? 'mdi-check' : ''"
                :label="$t(`FIRST_NAME`)">
              </v-text-field>
            </validation-provider>

            <!--      Last Name      -->
            <validation-provider v-slot="{ errors , valid }" name="last name" rules="required|max:20">
              <v-text-field
                v-model="editForm.lastName"
                :counter="20"
                :disabled="editProfileLoading"
                :error-messages="errors"
                :color="valid ? 'green' : ''"
                :append-icon="valid ? 'mdi-check' : ''"
                :label="$t(`LAST_NAME`)">
              </v-text-field>
            </validation-provider>

            <!--     E-mail       -->
            <validation-provider v-slot="{ errors , valid }" name="email" rules="required|email">
              <v-text-field
                v-model="editForm.email"
                :error-messages="errors"
                :disabled="editProfileLoading"
                :color="valid ? 'green' : ''"
                :append-icon="valid ? 'mdi-check' : ''"
                :label="$t(`E_MAIL`)">
              </v-text-field>
            </validation-provider>

            <!--     Color       -->
            <validation-provider v-slot="{ errors , valid }" name="color" rules="required|color">
              <v-text-field
                v-model="editForm.color"
                :disabled="editProfileLoading"
                :error-messages="errors"
                :color="valid ? 'green' : ''"
                :append-icon="valid ? 'mdi-check' : ''"
                :label="$t(`COLOR`)">
                <template v-slot:prepend-inner>
                  <v-icon @click="colorPickerDialog = true" :color="editForm.color">mdi-square</v-icon>
                </template>
              </v-text-field>
            </validation-provider>

            <v-btn color="primary"
                   type="submit"
                   :class="directionOfLanguage === 'rtl' ? 'float-left' : 'float-right'"
                   :loading="editProfileLoading"
                   :disabled="invalid">
              {{ $t(`EDIT`) }}
            </v-btn>
          </form>
        </validation-observer>

        <!--     Color Picker Dialog     -->
        <v-dialog v-model="colorPickerDialog"
                  width="325"
                  transition="dialog-bottom-transition">
          <v-card>
            <v-color-picker
              class="ma-2"
              swatches-max-height="200px"
              @input="setColor"
              show-swatches>
            </v-color-picker>
          </v-card>
        </v-dialog>

        <!--    Profile      -->
        <h2 class="mt-7" v-if="!profileEditMode">
          {{ $auth.user.firstName + ' ' + $auth.user.lastName }}
        </h2>
        <h2 class="caption" v-if="!profileEditMode">{{ $auth.user.email }}</h2>
      </v-col>
    </v-row>

    <v-divider class="my-6"></v-divider>

    <h2>{{ $t(`RECENT_CALLS`) }}</h2>

    <!--  Mobile  List Skeleton  -->
    <v-skeleton-loader v-if="callsLoading"
                       v-for="index in 5"
                       :key="index"
                       class="mt-3 mx-n3"
                       type="list-item-avatar-two-line">
    </v-skeleton-loader>

    <!--  Calls  List   -->
    <v-list v-if="!callsLoading" class="mt-3 mx-n3 mb-10" nav>
      <v-list-item v-for="call in callsList" :key="call._id">
        <v-icon v-if="call.creator" color="green" class="mx-1">mdi-call-made</v-icon>
        <v-icon v-else color="blue" class="mx-1">mdi-call-received</v-icon>
        <v-list-item-avatar class="mx-2 mx-md-4">
          <ContactAvatar :avatar="call.user.avatar"
                         :name="call.user.firstName"
                         :color="call.user.color"/>
        </v-list-item-avatar>
        <v-list-item-content>
          <v-list-item-title>{{ call.user.firstName + ' ' + call.user.lastName }}</v-list-item-title>
        </v-list-item-content>
        <v-list-item-icon>
          <h4 v-text="directionOfLanguage === 'rtl' ? call.startDateJalali : call.startDate"></h4>
        </v-list-item-icon>
      </v-list-item>
    </v-list>

    <!--  No Calls  -->
    <div v-if="!callsLoading && !callsList.length">
      <v-row class="d-flex justify-center">
        <h3 class="my-16">{{ $t(`NO_CALLS`) }}</h3>
      </v-row>
    </div>


  </v-sheet>
</template>

<script>

import {ValidationProvider, ValidationObserver} from "vee-validate";

export default {
  name      : "dashboard",
  auth      : true,
  components: {
    ValidationObserver,
    ValidationProvider
  },
  data      : () => {
    return {
      callsLoading      : false,
      profileEditMode   : false,
      editForm          : {
        firstName: '',
        lastName : '',
        email    : '',
        color    : ''
      },
      callsList         : [],
      colorPickerDialog : false,
      logoutDialog      : false,
      editProfileLoading: false,
    };
  },
  mounted() {
    this.editForm.firstName = this.$auth.user.firstName;
    this.editForm.lastName  = this.$auth.user.lastName;
    this.editForm.email     = this.$auth.user.email;
    this.editForm.color     = this.$auth.user.color;

    this.getCalls();
  },
  computed: {
    directionOfLanguage() {
      return this.$nuxt.$i18n.localeProperties.dir;
    }
  },
  methods : {
    async editProfile() {
      this.editProfileLoading = true;
      this.$axios.put('users/me', this.editForm).then(async response => {
        this.$notifier.showMessage({
          content: this.$t(`EDIT_SUCCESSFUL`),
          color  : 'success'
        });
        await this.$auth.fetchUser();
      }).catch(({response}) => {
        if (response.status) {
          switch (response.status) {
            case 406:
              this.$notifier.showMessage({
                content: this.$t(`EMAIL_EXISTS`),
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
        this.editProfileLoading = false;
      });
    },
    async getCalls() {
      this.callsLoading = true;
      this.$axios.get('calls').then(async response => {
        this.callsList    = response.data.calls;
        this.callsLoading = false;
      });
    },
    setColor(color) {
      this.editForm.color = color.hex;
    },
    logout() {
      this.$auth.logout();
    }
  }
}
</script>

<style scoped>

</style>
