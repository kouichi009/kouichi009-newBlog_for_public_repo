<template>
  <main>
    <nav-bar></nav-bar>
    <v-main>
      <dialog-error ref="dialogErrorRef"></dialog-error>
      <dialog-confirm
        ref="dialogConfirmRef"
        @bank-delete="pushBankDelete"
      ></dialog-confirm>
      <div class="container-fluid px-5 py-5 mx-auto">
        <setting-tab></setting-tab>
        <div v-if="privateInfo">
          <br />
          <br />
          <div v-if="!privateInfo.bank.holderName">
            <p class="f-16" style="text-align: center">
              Your bank account is not registered yet.
              <br />Please register your bank account to receive money from us.
            </p>
          </div>
          <div v-else style="text-align: center">
            <p style="font-weight: bold" class="f-16 mb-0">Your Address</p>
            <i class="f-16">{{ addressInfo }}</i>
            <br />
            <br />
            <br />
            <p style="font-weight: bold" class="f-16 mb-0">Your bank details</p>
            <div
              v-if="
                privateInfo.bank.country === 'United States' ||
                  privateInfo.bank.country === 'Puerto Rico'
              "
            >
              <p class="mb-1 f-12">
                Bank account holder:&nbsp;
                <i class="f-16">{{ privateInfo.bank.holderName }}</i>
              </p>
              <p class="mb-1 f-12">
                Routing number:&nbsp;
                <i class="f-16">{{ privateInfo.bank.swiftCode }}</i>
              </p>
              <p class="mb-1 f-12">
                Account number:&nbsp;
                <i class="f-16">{{ privateInfo.bank.accountNumber }}</i>
              </p>
              <p class="mb-1 f-12">
                Account type:&nbsp;
                <i class="f-16">{{ privateInfo.bank.accountType }}</i>
              </p>
            </div>
            <div v-else>
              <p class="mb-1">
                Swift code:&nbsp;
                <i class="f-16">{{ privateInfo.bank.swiftCode }}</i>
              </p>
              <p class="mb-1">
                IBAN / Account Number:&nbsp;
                <i class="f-16">{{ privateInfo.bank.accountNumber }}</i>
              </p>
              <p class="mb-1">
                Bank account holder:&nbsp;
                <i class="f-16">{{ privateInfo.bank.holderName }}</i>
              </p>
            </div>
            <br />
          </div>
          <div class="button2">
            <button
              v-if="privateInfo.bank.holderName"
              class="delete-btn2"
              @click="deleteBank"
            >
              Delete
            </button>
            <button class="edit-btn2" @click="editBank">{{ editText }}</button>
          </div>
        </div>
        <!-- <div>
          <p class="title mb-0">Address</p>
          <p class="f-16">2304 Orange Blossom Ln, Arlington, TX, 76014</p>
          <br />
          <br />
          <br />
          <p class="title mb-0">Bank</p>
          <p>(6) 口座番号：1234567（山田太郎さんの口座番号</p>
          <p>account type: Savings</p>
          <br />
          <br />
          <br />
        </div> -->
        <div class="my-2">
          <v-dialog v-model="dialog" :persistent="true" max-width="600px">
            <div>
              <v-card>
                <div class="pa-5">
                  <div class="mb-5 mt-2">
                    <v-btn class="right" icon @click="dialog = false">
                      <v-icon large color="blue">mdi-close</v-icon>
                    </v-btn>
                    <span class="span-text"
                      >Register your address and bank account</span
                    >
                  </div>
                  <v-divider></v-divider>
                  <p class="mt-5 mb-0 f-16">
                    Bank account holder's first and last name(s)
                  </p>
                  <v-text-field
                    class="mb-0"
                    v-model="bank.holderName"
                    single-line
                    outlined
                    dense
                  ></v-text-field>
                  <div
                    v-if="error.bankHolderName.isError"
                    class="speech-bubble"
                  >
                    {{ error.bankHolderName.message }}
                  </div>
                  <v-row class="my-3">
                    <p style="font-weight: bold" class="ml-3 mb-0 f-16">
                      Your address
                    </p>
                    &nbsp; &nbsp;
                    <v-menu open-on-hover offset-y>
                      <template v-slot:activator="{ on }">
                        <v-icon v-on="on">mdi-help-circle-outline</v-icon>
                      </template>
                      <v-card class="menu-text" max-width="200" tile>
                        <p>
                          For legal reasons, we need to ask for your address
                          (not the bank's address). Don't worry, you won't get
                          any post from us.
                        </p>
                      </v-card>
                    </v-menu>
                  </v-row>
                  <v-divider></v-divider>
                  <div>
                    <div>
                      <p class="mt-5 mb-0 f-16">Country</p>
                      <v-select-custom
                        style="font-size: 18px"
                        v-model="address.country"
                        :options="address.countries"
                        @input="changeAddressCountry"
                      ></v-select-custom>
                      <div
                        v-if="error.livingCountry.isError"
                        class="my-5 speech-bubble"
                      >
                        {{ error.livingCountry.message }}
                      </div>
                    </div>
                    <div>
                      <p class="mt-5 mb-0 f-16">City</p>
                      <v-text-field
                        class="mb-0"
                        v-model="address.city"
                        single-line
                        outlined
                        dense
                      ></v-text-field>
                      <div v-if="error.city.isError" class="mb-5 speech-bubble">
                        {{ error.city.message }}
                      </div>
                    </div>
                    <div>
                      <p class="mb-0 f-16">Address</p>
                      <v-text-field
                        class="mb-0"
                        v-model="address.address"
                        single-line
                        outlined
                        dense
                      ></v-text-field>
                      <div
                        v-if="error.address.isError"
                        class="mb-5 speech-bubble"
                      >
                        {{ error.address.message }}
                      </div>
                    </div>
                    <div v-if="address.postalCodeLabel">
                      <p class="mb-0 f-16">{{ address.postalCodeLabel }}</p>
                      <v-text-field
                        class="mb-0"
                        v-model="address.postalCode"
                        single-line
                        outlined
                        dense
                      ></v-text-field>
                      <div
                        v-if="error.postalCode.isError"
                        class="mb-5 speech-bubble"
                      >
                        {{ error.postalCode.message }}
                      </div>
                    </div>
                    <div v-if="address.stateLabel">
                      <p class="mb-0 f-16">{{ address.stateLabel }}</p>
                      <v-select-custom
                        style="font-size: 18px"
                        v-model="address.state"
                        :options="address.states"
                      ></v-select-custom>
                      <div
                        v-if="error.state.isError"
                        class="my-5 speech-bubble"
                      >
                        {{ error.state.message }}
                      </div>
                    </div>
                  </div>
                  <p style="font-weight: bold" class="f-16 mt-10">
                    Your bank details
                  </p>
                  <v-divider class="my-3"></v-divider>
                  <div>
                    <p class="mt-5 mb-0 f-16">Bank account country</p>
                    <v-select-custom
                      style="font-size: 18px"
                      v-model="bank.country"
                      :options="bank.countries"
                      @input="changeBankCountry"
                    ></v-select-custom>
                    <div
                      v-if="error.bankCountry.isError"
                      class="my-5 speech-bubble"
                    >
                      {{ error.bankCountry.message }}
                    </div>

                    <v-row class="mt-6">
                      <p class="ml-3 mb-0 f-16">{{ bank.swiftCodeLabel }}</p>
                      &nbsp; &nbsp;
                      <v-menu open-on-hover offset-y>
                        <template v-slot:activator="{ on }">
                          <v-icon v-on="on">mdi-help-circle-outline</v-icon>
                        </template>
                        <v-card
                          v-if="
                            bank.country === 'United States' ||
                              bank.country === 'Puerto Rico'
                          "
                          tile
                        >
                          <img
                            class="numberhelp"
                            src="~/assets/number_help.png"
                          />
                        </v-card>
                        <v-card v-else class="menu-text" max-width="200" tile>
                          <p>
                            The SWIFT code uniquely identifies a bank. It's 8-11
                            characters long, contains a country code and often
                            includes a part of the bank's name.
                          </p>
                        </v-card>
                      </v-menu>
                    </v-row>
                    <v-text-field
                      class="mb-0"
                      :placeholder="bank.swiftCodePlaceholder"
                      v-model="bank.swiftCode"
                      single-line
                      outlined
                      dense
                    ></v-text-field>
                    <div
                      v-if="error.swiftCode.isError"
                      class="mb-5 speech-bubble"
                    >
                      {{ error.swiftCode.message }}
                    </div>

                    <v-row>
                      <p class="ml-3 mb-0 f-16">
                        {{ bank.accountNumberLabel }}
                      </p>
                      &nbsp; &nbsp;
                      <v-menu
                        v-if="
                          bank.country === 'United States' ||
                            bank.country === 'Puerto Rico'
                        "
                        open-on-hover
                        offset-y
                      >
                        <template v-slot:activator="{ on }">
                          <v-icon v-on="on">mdi-help-circle-outline</v-icon>
                        </template>
                        <v-card tile>
                          <img
                            class="numberhelp"
                            src="~/assets/number_help.png"
                          />
                        </v-card>
                      </v-menu>
                    </v-row>
                    <v-text-field
                      class="mb-0"
                      :placeholder="bank.accountNumberPlaceholder"
                      v-model="bank.accountNumber"
                      single-line
                      outlined
                      dense
                    ></v-text-field>
                    <div
                      v-if="error.accountNumber.isError"
                      class="mb-5 speech-bubble"
                    >
                      {{ error.accountNumber.message }}
                    </div>

                    <div
                      v-if="
                        bank.country === 'United States' ||
                          bank.country === 'Puerto Rico'
                      "
                    >
                      <p class="mb-0 f-16">
                        Account type {{ bank.accountType }}
                      </p>
                      <v-radio-group
                        class="accountType mt-0"
                        v-model="bank.accountType"
                        :mandatory="false"
                      >
                        <v-radio value="Checking">
                          <template v-slot:label>
                            <div class="black--text">Checking</div>
                          </template>
                        </v-radio>
                        <v-radio value="Saveings">
                          <template v-slot:label>
                            <div class="black--text">Saveings</div>
                          </template>
                        </v-radio>
                      </v-radio-group>
                      <div
                        v-if="error.accountType.isError"
                        class="my-5 speech-bubble"
                      >
                        {{ error.accountType.message }}
                      </div>
                    </div>
                  </div>
                  <v-btn
                    class="text-capitalize my-10 mb-10"
                    dark
                    style="font-size: 20px"
                    color="#2DB696"
                    block
                    height="50px"
                    @click="save"
                    >Save</v-btn
                  >
                </div>
              </v-card>
            </div>
          </v-dialog>
        </div>
      </div>
    </v-main>
  </main>
</template>

<script>
import NavBar from "~/components/NavBar";
import {
  GET_CURRENT_USER_PRIVATEINFO,
  REGISTER_ADDRESS_BANK,
  DELETE_ADDRESS_BANK,
  GET_AUTH_CURRENTUSER
} from "~/store/actions_type";
import SettingTab from "~/components/SettingTab.vue";
import DialogError from "~/components/DialogError";
import DialogConfirm from "~/components/DialogConfirm";
import { AuthService } from "~/apis/auth_service";

export default {
  mounted() {
    this.getCurrentUserAndUser();
  },
  components: {
    NavBar,
    SettingTab,
    DialogError,
    DialogConfirm
  },
  data() {
    return {
      dialog: false,
      addressInfo: "",
      editText: "",
      saveBtnPushFlg: false,
      error: {
        bankHolderName: {
          isError: false,
          message: "Please fill out this field"
        },
        livingCountry: {
          isError: false,
          message: "Please fill out this field"
        },
        city: {
          isError: false,
          message: "Please fill out this field"
        },
        address: {
          isError: false,
          message: "Please fill out this field"
        },
        postalCode: {
          isError: false,
          message: "Please fill out this field"
        },
        state: {
          isError: false,
          message: "Please fill out this field"
        },
        bankCountry: {
          isError: false,
          message: "Please fill out this field"
        },
        swiftCode: {
          isError: false,
          message: "Please fill out this field"
        },
        accountNumber: {
          isError: false,
          message: "Please fill out this field"
        },
        accountType: {
          isError: false,
          message: "Please fill out this field"
        }
      },
      address: {
        country: "",
        city: "",
        address: "",
        postalCodeLabel: "Postal Code",
        postalCode: "",
        stateLabel: "",
        state: "",
        states: [],
        countries: [
          "Albania",
          "Algeria",
          "Andorra",
          "Angola",
          "Antigua and Barbuda",
          "Argentina",
          "Armenia",
          "Australia",
          "Austria",
          "Azerbaijan",
          "Bahamas",
          "Bahrain",
          "Bangladesh",
          "Barbados",
          "Belarus",
          "Belgium",
          "Belize",
          "Benin",
          "Bhutan",
          "Bolivia",
          "Bosnia and Herzegovina",
          "Botswana",
          "Brazil",
          "Brunei Darussalam",
          "Bulgaria",
          "Burkina Faso",
          "Cambodia",
          "Cameroon",
          "Canada",
          "Cape Verde",
          "Chile",
          "China",
          "Colombia",
          "Comoros",
          "Costa Rica",
          "Cote d'Ivoire",
          "Croatia",
          "Cyprus",
          "Czech Republic",
          "Denmark",
          "Djibouti",
          "Dominica",
          "Dominican Republic",
          "Ecuador",
          "Egypt",
          "El Salvador",
          "Equatorial Guinea",
          "Estonia",
          "Ethiopia",
          "Fiji",
          "Finland",
          "France",
          "Gabon",
          "Gambia",
          "Georgia",
          "Germany",
          "Ghana",
          "Greece",
          "Greenland",
          "Guatemala",
          "Guyana",
          "Haiti",
          "Honduras",
          "Hong Kong",
          "Hungary",
          "Iceland",
          "India",
          "Indonesia",
          "Ireland",
          "Israel",
          "Italy",
          "Jamaica",
          "Japan",
          "Jordan",
          "Kazakhstan",
          "Kenya",
          "Kiribati",
          "Kosovo, Republic of",
          "Kuwait",
          "Kyrgyzstan",
          "Laos",
          "Latvia",
          "Lebanon",
          "Lesotho",
          "Liberia",
          "Liechtenstein",
          "Lithuania",
          "Luxembourg",
          "Macao",
          "Macedonia, Former Yugoslav Republic of",
          "Madagascar",
          "Malawi",
          "Malaysia",
          "Maldives",
          "Mali",
          "Malta",
          "Marshall Islands",
          "Mauritania",
          "Mauritius",
          "Mexico",
          "Micronesia, Federated States of",
          "Moldova",
          "Monaco",
          "Mongolia",
          "Montenegro",
          "Morocco",
          "Mozambique",
          "Myanmar",
          "Namibia",
          "Nauru",
          "Nepal",
          "Netherlands",
          "New Caledonia",
          "New Zealand",
          "Nicaragua",
          "Niger",
          "Nigeria",
          "Norway",
          "Oman",
          "Pakistan",
          "Palau",
          "Palestine",
          "Panama",
          "Papua New Guinea",
          "Paraguay",
          "Peru",
          "Philippines",
          "Poland",
          "Portugal",
          "Puerto Rico",
          "Qatar",
          "Romania",
          "Russia Federation",
          "Rwanda",
          "Saint Kitts and Nevis",
          "Saint Lucia",
          "Saint Vincent and the Grenadines",
          "Samoa",
          "San Marino",
          "Sao Tome and Principe",
          "Saudi Arabia",
          "Senegal",
          "Serbia",
          "Seychelles",
          "Sierra Leone",
          "Singapore",
          "Slovakia",
          "Slovenia",
          "Solomon Islands",
          "South Africa",
          "South Korea",
          "Spain",
          "Sri Lanka",
          "Suriname",
          "Swaziland",
          "Sweden",
          "Switzerland",
          "Taiwan",
          "Tajikistan",
          "Tanzania",
          "Thailand",
          "Togo",
          "Tonga",
          "Trinidad and Tobago",
          "Tunisia",
          "Turkey",
          "Turkmenistan",
          "Tuvalu",
          "Uganda",
          "Ukraine",
          "United Arab Emirates",
          "United Kingdom",
          "United States",
          "Uruguay",
          "Uzbekistan",
          "Vanuatu",
          "Vatican City",
          "Vietnam",
          "Zambia",
          "Zimbabwe"
        ]
      },
      bank: {
        country: "",
        swiftCodeLabel: "SWIFT code",
        accountNumberLabel: "IBAN (recommended) / Account Number",
        swiftCodePlaceholder: "BUKBGB22",
        accountNumberPlaceholder: "123456789012",
        swiftCode: "",
        accountNumber: "",
        accountType: "",
        holderName: "",
        countries: [
          "Albania",
          "Algeria",
          "Andorra",
          "Angola",
          "Antigua and Barbuda",
          "Argentina",
          "Armenia",
          "Australia",
          "Austria",
          "Azerbaijan",
          "Bahamas",
          "Bahrain",
          "Bangladesh",
          "Barbados",
          "Belgium",
          "Benin",
          "Bhutan",
          "Bolivia",
          "Bosnia and Herzegovina",
          "Botswana",
          "Brunei Darussalam",
          "Bulgaria",
          "Burkina Faso",
          "Cambodia",
          "Canada",
          "Cape Verde",
          "Chile",
          "China",
          "Colombia",
          "Costa Rica",
          "Cote d'Ivoire",
          "Croatia",
          "Cyprus",
          "Czech Republic",
          "Denmark",
          "Dominica",
          "Dominican Republic",
          "Ecuador",
          "Egypt",
          "El Salvador",
          "Estonia",
          "Ethiopia",
          "Fiji",
          "Finland",
          "France",
          "Gabon",
          "Gambia",
          "Georgia",
          "Germany",
          "Ghana",
          "Greece",
          "Greenland",
          "Grenada",
          "Guatemala",
          "Guinea",
          "Guinea-Bissau",
          "Guyana",
          "Haiti",
          "Honduras",
          "Hong Kong",
          "Hungary",
          "Iceland",
          "India",
          "Indonesia",
          "Ireland",
          "Israel",
          "Italy",
          "Jamaica",
          "Japan",
          "Kazakhstan",
          "Kenya",
          "Kiribati",
          "Kosovo, Republic of",
          "Kuwait",
          "Kyrgyzstan",
          "Laos",
          "Latvia",
          "Lebanon",
          "Lesotho",
          "Liberia",
          "Liechtenstein",
          "Lithuania",
          "Luxembourg",
          "Macao",
          "Macedonia, Former Yugoslav Republic of",
          "Malawi",
          "Malaysia",
          "Maldives",
          "Mali",
          "Malta",
          "Marshall Islands",
          "Mauritania",
          "Mauritius",
          "Mexico",
          "Micronesia, Federated States of",
          "Moldova",
          "Monaco",
          "Mongolia",
          "Montenegro",
          "Morocco",
          "Mozambique",
          "Myanmar",
          "Namibia",
          "Nauru",
          "Nepal",
          "Netherlands",
          "New Zealand",
          "Nicaragua",
          "Niger",
          "Norway",
          "Oman",
          "Palau",
          "Panama",
          "Papua New Guinea",
          "Paraguay",
          "Peru",
          "Philippines",
          "Poland",
          "Portugal",
          "Puerto Rico",
          "Qatar",
          "Romania",
          "Rwanda",
          "Saint Kitts and Nevis",
          "Saint Lucia",
          "Saint Vincent and the Grenadines",
          "Samoa",
          "San Marino",
          "Sao Tome and Principe",
          "Saudi Arabia",
          "Senegal",
          "Serbia",
          "Seychelles",
          "Sierra Leone",
          "Singapore",
          "Slovakia",
          "Slovenia",
          "Solomon Islands",
          "South Africa",
          "South Korea",
          "Spain",
          "Sri Lanka",
          "Suriname",
          "Sweden",
          "Switzerland",
          "Taiwan",
          "Tajikistan",
          "Tanzania",
          "Thailand",
          "Tonga",
          "Trinidad and Tobago",
          "Tunisia",
          "Turkey",
          "Tuvalu",
          "Uganda",
          "Ukraine",
          "United Arab Emirates",
          "United Kingdom",
          "United States",
          "Uruguay",
          "Uzbekistan",
          "Vanuatu",
          "Vatican City",
          "Vietnam",
          "Zambia"
        ]
      }
    };
  },
  methods: {
    editBank() {
      this.dialog = true;
    },
    deleteBank() {
      this.$refs.dialogConfirmRef.deleteBankDialog();
    },
    async pushBankDelete() {
      try {
        let address = {
          country: "",
          city: "",
          address: "",
          postalCode: "",
          state: ""
        };
        let bank = {
          country: "",
          swiftCode: "",
          accountNumber: "",
          accountType: "",
          holderName: ""
        };
        await this.$store.dispatch(`auth_module/${DELETE_ADDRESS_BANK}`, {
          privateInfo: this.privateInfo,
          address: address,
          bank: bank
        });
        window.location.reload();
      } catch (err) {
        this.$refs.dialogErrorRef.showError(err.message);
      }
    },
    changeAddressCountry() {
      console.log("changeAddressCountry@@@@@@ ", this.address.country);
      this.resetError();
      this.address.postalCode = "";
      this.address.state = "";
      this.setAddressLabels();
    },
    changeBankCountry() {
      console.log("changeBankCountry@@@@@@ ", this.bank.country);
      this.resetError();
      this.bank.accountType = "";
      this.bank.swiftCodePlaceholder = "BUKBGB22";
      this.bank.swiftCodeLabel = "SWIFT code";
      this.setBankLabels();
    },

    setAddressLabels() {
      switch (this.address.country) {
        case "Australia":
          this.address.states = [
            "Australian Capital Territory",
            "New South Wales",
            "Northern Territory",
            "Queensland",
            "South Australia",
            "Tasmania",
            "Victoria",
            "Western Australia"
          ];
          this.address.stateLabel = "State";
          break;
        case "Brazil":
          this.address.states = [
            "Acre",
            "Alagoas",
            "Amazonas",
            "Amapá",
            "Bahia",
            "Ceará",
            "Distrito Federal",
            "Espírito Santo",
            "Goiás",
            "Maranhão",
            "Mato Grosso",
            "Mato Grosso do Sul",
            "Minas Gerais",
            "Pará",
            "Paraíba",
            "Paraná",
            "Pernambuco",
            "Piauí",
            "Rio de Janeiro",
            "Rio Grande do Norte",
            "Rondônia",
            "Rio Grande do Sul",
            "Roraima",
            "Santa Catarina",
            "Sergipe",
            "São Paulo",
            "Tocantins"
          ];
          this.address.stateLabel = "State";
          break;
        case "Canada":
          this.address.states = [
            "Alberta",
            "British Columbia",
            "Manitoba",
            "New Brunswick",
            "Newfoundland and Labrador",
            "Nova Scotia",
            "Ontario",
            "Prince Edward Island",
            "Quebec",
            "Saskatchewan",
            "Northwest Territories",
            "Nunavut",
            "Yukon"
          ];
          this.address.stateLabel = "Province";
          break;
        case "Ghana":
        case "Hong Kong":
        case "Ireland":
        case "United Arab Emirates":
          this.resetLabels();
          this.address.postalCodeLabel = "";
          break;
        case "Japan":
          this.address.states = [
            "Hokkaido",
            "Aomori",
            "Iwate",
            "Miyagi",
            "Akita",
            "Yamagata",
            "Fukushima",
            "Ibaraki",
            "Tochigi",
            "Gunma",
            "Saitama",
            "Chiba",
            "Tokyo Metropolis",
            "Kanagawa",
            "Niigata",
            "Toyama",
            "Ishikawa",
            "Fukui",
            "Yamanashi",
            "Nagano",
            "Gifu",
            "Shizuoka",
            "Aichi",
            "Mie",
            "Shiga",
            "Kyoto",
            "Osaka",
            "Hyogo",
            "Nara",
            "Wakayama",
            "Tottori",
            "Shimane",
            "Okayama",
            "Hiroshima",
            "Yamaguchi",
            "Tokushima",
            "Kagawa",
            "Ehime",
            "Kochi",
            "Fukuoka",
            "Saga",
            "Nagasaki",
            "Kumamoto",
            "Oita",
            "Miyazaki",
            "Kagoshima",
            "Okinawa"
          ];
          this.address.stateLabel = "Prefecture";
          break;
        case "New Zealand":
          this.address.states = [
            "Auckland",
            "Bay of Plenty",
            "Canterbury",
            "Chatham Islands",
            "Gisborne",
            "Hawke's Bay",
            "Manawatu-Wanganui",
            "Marlborough",
            "Nelson",
            "Northland",
            "Otago",
            "Southland",
            "Taranaki",
            "Tasman",
            "Waikato",
            "Wellington",
            "West Coast"
          ];
          this.address.stateLabel = "Region";
          break;

          break;
        case "United States":
          this.address.postalCodeLabel = "Zip code";
          this.address.states = [
            "Alabama",
            "Alaska",
            "Arizona",
            "Arkansas",
            "California",
            "Colorado",
            "Connecticut",
            "Delaware",
            "Florida",
            "Georgia",
            "Hawaii",
            "Idaho",
            "Illinois",
            "Indiana",
            "Iowa",
            "Kansas",
            "Kentucky",
            "Louisiana",
            "Maine",
            "Maryland",
            "Massachusetts",
            "Michigan",
            "Minnesota",
            "Mississippi",
            "Missouri",
            "Montana",
            "Nebraska",
            "Nevada",
            "New Hampshire",
            "New Jersey",
            "New Mexico",
            "New York",
            "North Carolina",
            "North Dakota",
            "Ohio",
            "Oklahoma",
            "Oregon",
            "Pennsylvania",
            "Rhode Island",
            "South Carolina",
            "South Dakota",
            "Tennessee",
            "Texas",
            "Utah",
            "Vermont",
            "Virginia",
            "Washington",
            "West Virginia",
            "Wisconsin",
            "Wyoming",
            "District of Columbia",
            "Guam",
            "Northern Mariana Islands",
            "Virgin Islands"
          ];
          this.address.stateLabel = "State";
          break;
        default:
          console.log("それ以外よんだよ。 @@@@@@@@@@@@@@@@@@");
          this.resetLabels();
          break;
      }
    },
    setBankLabels() {
      switch (this.bank.country) {
        case "Albania":
        case "Andorra":
        case "Austria":
        case "Azerbaijan":
        case "Bahrain":
        case "Belgium":
        case "Bosnia and Herzegovina":
        case "Bulgaria":
        case "Croatia":
        case "Cyprus":
        case "Czech Republic":
        case "Denmark":
        case "Estonia":
        case "Finland":
        case "France":
        case "Georgia":
        case "Germany":
        case "Greece":
        case "Greenland":
        case "Hungary":
        case "Iceland":
        case "Ireland":
        case "Israel":
        case "Italy":
        case "Kazakhstan":
        case "Kuwait":
        case "Latvia":
        case "Lebanon":
        case "Liechtenstein":
        case "Lithuania":
        case "Luxembourg":
        case "Macedonia, Former Yugoslav Republic of":
        case "Malta":
        case "Mauritania":
        case "Moldova":
        case "Monaco":
        case "Montenegro":
        case "Netherlands":
        case "Norway":
        case "Poland":
        case "Portugal":
        case "Qatar":
        case "Romania":
        case "San Marino":
        case "Saudi Arabia":
        case "Slovakia":
        case "Slovenia":
        case "Spain":
        case "Sweden":
        case "Switzerland":
        case "Tunisia":
        case "Turkey":
        case "United Arab Emirates":
        case "United Kingdom":
          // IBAN
          this.bank.accountNumberPlaceholder = "123456789012";
          this.bank.accountNumberLabel = "IBAN";
          break;
        case "Algeria":
        case "Antigua and Barbuda":
        case "Argentina":
        case "Armenia":
        case "Australia":
        case "Bahamas":
        case "Bangladesh":
        case "Barbados":
        case "Bhutan":
        case "Bolivia":
        case "Botswana":
        case "Brunei Darussalam":
        case "Cambodia":
        case "Canada":
        case "Cape Verde":
        case "Chile":
        case "China":
        case "Colombia":
        case "Dominica":
        case "Ecuador":
        case "El Salvador":
        case "Ethiopia":
        case "Fiji":
        case "Gambia":
        case "Ghana":
        case "Grenada":
        case "Guinea":
        case "Guyana":
        case "Haiti":
        case "Honduras":
        case "Hong Kong":
        case "India":
        case "Indonesia":
        case "Jamaica":
        case "Japan":
        case "Kenya":
        case "Kiribati":
        case "Kosovo, Republic of":
        case "Kyrgyzstan":
        case "Laos":
        case "Lesotho":
        case "Liberia":
        case "Macao":
        case "Malawi":
        case "Malaysia":
        case "Maldives":
        case "Marshall Islands":
        case "Mexico":
        case "Micronesia, Federated States of":
        case "Mongolia":
        case "Morocco":
        case "Myanmar":
        case "Namibia":
        case "Nauru":
        case "Nepal":
        case "New Zealand":
        case "Nicaragua":
        case "Oman":
        case "Palau":
        case "Panama":
        case "Papua New Guinea":
        case "Paraguay":
        case "Peru":
        case "Philippines":
        case "Rwanda":
        case "Saint Kitts and Nevis":
        case "Saint Vincent and the Grenadines":
        case "Samoa":
        case "Sierra Leone":
        case "Singapore":
        case "Solomon Islands":
        case "South Africa":
        case "South Korea":
        case "Sri Lanka":
        case "Suriname":
        case "Taiwan":
        case "Tajikistan":
        case "Tanzania":
        case "Thailand":
        case "Tonga":
        case "Trinidad and Tobago":
        case "Tuvalu":
        case "Uganda":
        case "Uruguay":
        case "Uzbekistan":
        case "Vanuatu":
        case "Vatican City":
        case "Vietnam":
        case "Zambia":
          // Account Number
          this.bank.accountNumberPlaceholder = "123456789012";
          this.bank.accountNumberLabel = "Account number";
          break;
        case "Angola":
        case "Benin":
        case "Burkina Faso":
        case "Costa Rica":
        case "Cote d'Ivoire":
        case "Dominican Republic":
        case "Egypt":
        case "Gabon":
        case "Guatemala":
        case "Guinea-Bissau":
        case "Mali":
        case "Mauritius":
        case "Mozambique":
        case "Niger":
        case "Saint Lucia":
        case "Sao Tome and Principe":
        case "Senegal":
        case "Serbia":
        case "Seychelles":
        case "Ukraine":
          //IBAN (recommended) / Account Number
          this.bank.accountNumberPlaceholder = "123456789012";
          this.bank.accountNumberLabel = "IBAN (recommended) / Account Number";
          break;
        case "United States":
        case "Puerto Rico":
          this.bank.swiftCodePlaceholder = "111000025";
          this.bank.accountNumberPlaceholder = "12345678";
          this.bank.swiftCodeLabel = "Routing number";
          this.bank.accountNumberLabel = "Account number";
          break;
        default:
          console.log("それ以外よんだよ。 @@@@@@@@@@@@@@@@@@");

          this.bank.accountNumberPlaceholder = "123456789012";
          this.bank.accountNumberLabel = "IBAN (recommended) / Account Number";
          break;
      }
    },

    async save() {
      if (this.saveBtnPushFlg) {
        return;
      }
      this.saveBtnPushFlg = true;
      try {
        let isError = this.errorCheck();
        if (isError) {
          this.saveBtnPushFlg = false;
          return;
        }

        let address = {
          country: this.address.country,
          city: this.address.city,
          address: this.address.address,
          postalCode: this.address.postalCode,
          state: this.address.state
        };
        let bank = {
          country: this.bank.country,
          swiftCode: this.bank.swiftCode,
          accountNumber: this.bank.accountNumber,
          accountType: this.bank.accountType,
          holderName: this.bank.holderName
        };

        await this.$store.dispatch(`auth_module/${REGISTER_ADDRESS_BANK}`, {
          privateInfo: this.privateInfo,
          address: address,
          bank: bank
        });

        window.location.reload();
      } catch (err) {
        this.$refs.dialogErrorRef.showError(err.message);
      } finally {
        this.saveBtnPushFlg = false;
      }
    },
    async getCurrentUserAndUser() {
      try {
        const authCurrentUser = await this.$store.dispatch(
          `auth_module/${GET_AUTH_CURRENTUSER}`
        );
        if (!authCurrentUser) {
          this.$router.push({ path: `/` });
          return;
        }
        await this.$store.dispatch(
          `auth_module/${GET_CURRENT_USER_PRIVATEINFO}`,
          authCurrentUser.uid
        );
      } catch (err) {
        this.$refs.dialogErrorRef.showError(err.message);
      }
    },
    resetLabels() {
      this.address.state = "";
      this.address.states = [];
      this.address.stateLabel = "";
      this.address.postalCodeLabel = "Postal Code";
    },
    errorCheck() {
      var isError = false;
      if (!this.bank.holderName) {
        this.error.bankHolderName.isError = true;
        isError = true;
      } else this.error.bankHolderName.isError = false;
      if (!this.address.country) {
        this.error.livingCountry.isError = true;
        isError = true;
      } else this.error.livingCountry.isError = false;
      if (!this.address.city) {
        this.error.city.isError = true;
        isError = true;
      } else this.error.city.isError = false;
      if (!this.address.city) {
        this.error.city.isError = true;
        isError = true;
      } else this.error.city.isError = false;
      if (!this.address.address) {
        this.error.address.isError = true;
        isError = true;
      } else this.error.address.isError = false;
      if (this.address.postalCodeLabel && !this.address.postalCode) {
        this.error.postalCode.isError = true;
        isError = true;
      } else this.error.postalCode.isError = false;
      if (this.address.stateLabel && !this.address.state) {
        this.error.state.isError = true;
        isError = true;
      } else this.error.state.isError = false;
      if (!this.bank.country) {
        this.error.bankCountry.isError = true;
        isError = true;
      } else this.error.bankCountry.isError = false;
      if (!this.bank.swiftCode) {
        this.error.swiftCode.isError = true;
        // this.error.swiftCode.message = "Please fill out this field";
        isError = true;
      } else this.error.swiftCode.isError = false;
      if (!this.bank.accountNumber) {
        this.error.accountNumber.isError = true;
        isError = true;
      } else this.error.accountNumber.isError = false;
      if (
        (this.bank.country === "United States" ||
          this.bank.country === "Puerto Rico") &&
        !this.bank.accountType
      ) {
        this.error.accountType.isError = true;
        isError = true;
      } else this.error.accountType.isError = false;

      //Check numbers count if user is USA citizen.
      if (
        this.bank.country === "United States" ||
        this.bank.country === "Puerto Rico"
      ) {
        if (this.bank.swiftCode.length === 0) {
          this.error.swiftCode.isError = true;
          this.error.swiftCode.message = "Please fill out this field";
          isError = true;
        } else if (this.bank.swiftCode.length !== 9) {
          this.error.swiftCode.isError = true;
          this.error.swiftCode.message = "Routing number must be 9 characters.";
          isError = true;
        }
        if (this.bank.accountNumber.length === 0) {
          this.error.accountNumber.isError = true;
          this.error.accountNumber.message = "Please fill out this field";
          isError = true;
        } else if (
          this.bank.accountNumber.length < 4 ||
          this.bank.accountNumber.length > 17
        ) {
          this.error.accountNumber.isError = true;
          this.error.accountNumber.message =
            "Account number must be 4 to 17 characters.";
          isError = true;
        }
      }
      console.log("save ", isError, this.bank.accountNumber.length);
      return isError;
    },
    resetError() {
      let errorMessage = "Please fill out this field";
      this.error.bankHolderName.isError = false;
      this.error.bankHolderName.message = errorMessage;
      this.error.livingCountry.isError = false;
      this.error.livingCountry.message = errorMessage;
      this.error.city.isError = false;
      this.error.city.message = errorMessage;
      this.error.address.isError = false;
      this.error.address.message = errorMessage;
      this.error.postalCode.isError = false;
      this.error.postalCode.message = errorMessage;
      this.error.state.isError = false;
      this.error.state.message = errorMessage;
      this.error.bankCountry.isError = false;
      this.error.bankCountry.message = errorMessage;
      this.error.swiftCode.isError = false;
      this.error.swiftCode.message = errorMessage;
      this.error.accountNumber.isError = false;
      this.error.accountNumber.message = errorMessage;
      this.error.accountType.isError = false;
      this.error.accountType.message = errorMessage;
    },

    setAddressAndBankInfo(address, bank) {
      if (address === null) {
        this.address.country = "United States";
        this.bank.country = "United States";
        this.setAddressLabels();
        this.setBankLabels();
      } else {
        this.address.country = address.country;
        this.address.city = address.city;
        this.address.address = address.address;
        this.address.postalCode = address.postalCode;
        this.address.state = address.state;
        this.bank.holderName = bank.holderName;
        this.bank.country = bank.country;
        this.bank.swiftCode = bank.swiftCode;
        this.bank.accountNumber = bank.accountNumber;
        this.bank.accountType = bank.accountType;
        this.setAddressLabels();
        this.setBankLabels();
      }
    }
  },
  watch: {
    privateInfo: function(newVal, oldVal) {
      let address = newVal.address;
      let bank = newVal.bank;

      if (!bank.holderName) {
        this.editText = "Register";
        this.setAddressAndBankInfo(null, null);
        return;
      }
      this.editText = "Edit";
      this.setAddressAndBankInfo(address, bank);

      if (address.state) {
        this.addressInfo = `${address.address}, ${address.city}, ${address.state}, ${address.postalCode}, ${address.country}`;
      } else {
        this.addressInfo = `${address.address}, ${address.city}, ${address.postalCode}, ${address.country}`;
      }
      if (!address.postalCode) {
        this.addressInfo = `${address.address}, ${address.city}, ${address.country}`;
      }
      console.log(address);
    }
  },
  computed: {
    privateInfo() {
      return this.$store.getters["auth_module/privateInfo"];
    }
  }
};
</script>

<style scoped>
.container-fluid {
  max-width: 620px;
}

.span-text {
  font-size: 1.6rem;
}

.right {
  float: right;
}

.accountType {
  padding: 10px;
  border: 1px solid grey;
  border-radius: 5px;
  height: 75px;
}

.menu-text {
  text-align: center;
  padding: 10px;
  font-size: 16px;
  line-height: 2em;
  /* max-width: "200"; */
}

.speech-bubble {
  color: #c33332;
  padding: 7px 15px;
  position: relative;
  background: #ffdfdf;
  border-radius: 0.4em;
  font-size: 16px;
}

.speech-bubble:after {
  content: "";
  position: absolute;
  top: 0;
  left: 10%;
  width: 0;
  height: 0;
  border: 20px solid transparent;
  border-bottom-color: #ffdfdf;
  border-top: 0;
  border-right: 0;
  margin-left: -10px;
  margin-top: -20px;
}

.delete-btn2 {
  border: 2px solid lightgray;
  border-radius: 10px;
  padding: 5px;
  width: 100px;
  padding: 10px;
  font-size: 18px;
  margin-top: 15px;
  display: inline-block;
}
.edit-btn2 {
  /* float: right; */
  border: 2px solid lightgray;
  border-radius: 10px;
  padding: 5px;
  width: 100px;
  padding: 10px;
  color: white;
  font-size: 18px;
  background-color: #2cb696;
  margin-top: 15px;
  display: inline-block;
}
.button2 {
  text-align: center;
}

.v-text-field {
  font-size: 1.8rem;
}

.numberhelp {
  width: 400px;
}

@media (max-width: 600px) {
  .span-text {
    font-size: 1.2rem;
  }
}
</style>
