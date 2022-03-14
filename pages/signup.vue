<template>
  <div>
    <v-main>
      <div class="container ma-5">
        <button class="title" @click="makeAnoymousUser">
          make anoymous user
        </button>
        <div v-if="user">
          <p>{{ user.name }}</p>
          <p>{{ user.username }}</p>
          <p>{{ user.email }}</p>
          <h3>{{ user.uid }}</h3>
        </div>
        <br />
        <img
          class="pt-1"
          style="max-width: 25px; max-height: 25px; background-color: blue;"
          src="https://d291vdycu0ht11.cloudfront.net/nuxt/production/img/37bc316.png"
        />
        <img
          class="noti-avatar"
          src="https://d291vdycu0ht11.cloudfront.net/nuxt/production/img/37bc316.png"
        />
        <br />
        <hr />
        <p class="display-1">sign up</p>
        <button @click="signout">SignOut</button>
        <v-text-field v-model="email" label="Email*"></v-text-field>
        <v-text-field v-model="password" label="Password*"></v-text-field>
        <v-btn @click="signup" outlined>sign up</v-btn>
        <br />
        <br />
        <hr />

        <p class="display-1">login</p>
        <v-text-field v-model="email" label="Email*"></v-text-field>
        <v-text-field v-model="password" label="Password*"></v-text-field>
        <v-btn @click="login" outlined>login</v-btn>
        <br />
        <br />

        <hr />
        <br />
        <br />
        <v-btn @click="each1second" outlined>newTransfersMoney</v-btn>
      </div>
    </v-main>
  </div>
</template>

<script>
// https://blog-test01-ec54b.web.app
import { db, firebase } from "~/plugins/firebase";
import { SET_REF_CURRENTUSER, SET_USER } from "~/store/mutations_type";
import { AuthService } from "~/apis/auth_service";
import { ApiService, MAGICLINK } from "~/apis/constant_type";
import { TransferService } from "~/apis/transfer_service";
import { DELETE_ADDRESS_BANK } from "~/store/actions_type";

export default {
  data() {
    return {
      email: "",
      password: "",
      count: 0,
      totalCount: 0
    };
  },
  components: {
    // RegisterLogin
  },
  methods: {
    async testauth() {
      let currentUser = firebase.auth().currentUser;
      console.log("getCurrentUser : ", currentUser);
    },
    async makeAnoymousUser() {
      try {
        console.log("makeAnoymousUser@@@@@@@@");
        let currentUser = firebase.auth().currentUser;
        console.log(currentUser);
        await firebase.auth().signOut();

        var num = window.localStorage.getItem("num");
        num = parseInt(num);

        console.log(num);

        if (!num) {
          console.log("1");
          num = 0;
        }

        num = num + 1;

        const name = num + "name";
        const profileImageUrl =
          "https://bluesea0925.com/wp-content/uploads/2019/02/%E5%B0%8F%E5%B7%9D%E5%BD%A9%E4%BD%B32.jpg";

        window.localStorage.setItem("num", num);
        let response = await firebase.auth().signInAnonymously();
        response.user
          .updateProfile({
            displayName: name,
            photoURL: profileImageUrl
          })
          .then(function() {
            console.log("success update ");
            // Update successful.
          })
          .catch(function(error) {
            console.log("fail update");

            // An error happened.
          });
        const timestamp = firebase.firestore.FieldValue.serverTimestamp();
        var username = num + "username";
        let shortId = ApiService.makeId(4);
        // username = await AuthService.checkAndChangeOverlapUsername(
        //   response.user.uid,
        //   username,
        //   shortId
        // );
        const user = {
          createdAt: timestamp,
          updatedAt: timestamp,
          deletedAt: null,
          name: name,
          profileImageUrl: profileImageUrl,
          status: 1,
          uid: response.user.uid,
          username: username,
          description: "aaaa bbbbbb ccccccc"
        };

        const privateInfo = {
          stripeInfo: {
            customerId: "",
            last4: "",
            month: null,
            year: null,
            name: "",
            brand: ""
          },
          address: {
            country: "",
            city: "",
            address: "",
            postalCode: "",
            state: ""
          },
          bank: {
            country: "",
            swiftCode: "",
            accountNumber: "",
            accountType: "",
            holderName: ""
          },
          createdAt: timestamp,
          updatedAt: timestamp,
          deletedAt: null,
          transferMoneyNotifyEmail: num + "@gmail.com",
          signUpEmail: num + "@gmail.com",
          signUpType: "email",
          uid: response.user.uid
        };

        let batch = db.batch();
        let usernamesCollection = db
          .collection("users")
          .doc(response.user.uid)
          .collection("usernameCollection")
          .doc(username);
        batch.set(usernamesCollection, {
          createdAt: timestamp,
          updatedAt: timestamp,
          deletedAt: null,
          status: 1,
          username: username,
          uid: response.user.uid
        });

        let usersCollection = db.collection("users").doc(response.user.uid);
        batch.set(usersCollection, user);

        let usersPrivateInfoCollection = db
          .collection("users")
          .doc(response.user.uid)
          .collection("privateInfo")
          .doc(response.user.uid);
        batch.set(usersPrivateInfoCollection, privateInfo);

        const notificationId = db
          .collection("users")
          .doc(user.uid)
          .collection("notifications")
          .doc().id;
        const notificationsCollection = db
          .collection("users")
          .doc(user.uid)
          .collection("notifications")
          .doc(notificationId);

        let notification = {
          id: notificationId,
          info: {
            type: "admin",
            keyword: "welcome"
          },
          from: "",
          to: user.uid,
          isSeen: false,
          createdAt: timestamp,
          updatedAt: timestamp,
          deletedAt: null,
          postId: "",
          commentId: ""
        };
        batch.set(notificationsCollection, notification);

        batch.commit();
        this.$store.commit(`user_module/${SET_USER}`, user);
        console.log("make user");
      } catch (err) {
        console.log("errorMessage: ", err.message);
      }
    },
    signout() {
      firebase.auth().signOut();
    },
    async signup() {
      try {
        const response = await firebase
          .auth()
          .createUserWithEmailAndPassword(this.email, this.password);
        const timestamp = firebase.firestore.FieldValue.serverTimestamp();
        let nameArray = this.email.split("@");
        let name = nameArray[0];
        let username = name + "_username";

        const user = {
          createdAt: timestamp,
          updatedAt: timestamp,
          deletedAt: null,
          name: name,
          email: this.email,
          profileImageUrl:
            "https://contents.oricon.co.jp/upimg/news/20200317/2157661_202003170472676001584416498c.jpg",
          status: 1,
          uid: response.user.uid,
          stripeInfo: {
            customerId: "",
            last4: "",
            month: "",
            year: "",
            name: "",
            brand: ""
          },
          address: {
            country: "",
            city: "",
            address: "",
            postalCode: "",
            state: ""
          },
          bank: {
            country: "",
            swiftCode: "",
            accountNumber: "",
            accountType: "",
            holderName: ""
          },
          username: username,
          description: "aaaa bbbbbb ccccccc",
          type: "email"
        };

        let batch = db.batch();

        let usersCollection = db.collection("users").doc(response.user.uid);
        batch.set(usersCollection, user);

        const notificationId = db
          .collection("users")
          .doc(user.uid)
          .collection("notifications")
          .doc().id;
        const notificationsCollection = db
          .collection("users")
          .doc(user.uid)
          .collection("notifications")
          .doc(notificationId);

        let notification = {
          id: notificationId,
          info: {
            type: "admin",
            keyword: "welcome"
          },
          from: "",
          to: user.uid,
          isSeen: false,
          createdAt: timestamp,
          updatedAt: timestamp,
          deletedAt: null,
          postId: "",
          commentId: ""
        };
        batch.set(notificationsCollection, notification);
        batch.commit();
        this.$store.commit(`auth_module/${SET_REF_CURRENTUSER}`, user);
        console.log("make user");
      } catch (err) {
        console.log("errorMessage: ", err.message);
      }
    },
    async login() {
      try {
        let response = await firebase
          .auth()
          .signInWithEmailAndPassword(this.email, this.password);
        console.log("success login", response.user.uid);
        const users_Ref = db.collection("users").doc(response.user.uid);
        const docRef = await users_Ref.get();
        let user = docRef.data();
        console.log(user);
        this.$store.commit(`auth_module/${SET_REF_CURRENTUSER}`, user);
      } catch (err) {
        console.log("errorMessage: ", err.message);
      }
    },
    each1second() {
      let that = this;
      // that.totalCount = 5;
      const intervalId = setInterval(() => {
        that.newTransfersMoney();
        if (that.count === 10) {
          clearInterval(intervalId); //intervalIdをclearIntervalで指定している
        }
      }, 3000);
    },
    async newTransfersMoney() {
      let uid = "juB7SYTChJONPsxmb7R8RuoneWz1";
      let postId = "PkIlSpeg82snEelJ9foV";

      // for (var i = 0; i < 1; i++) {
      // setTimeout(async () => {
      let batch = db.batch();
      var timestamp = new Date();
      const timestampNow = firebase.firestore.Timestamp.now();

      let a = timestamp.setMonth(timestamp.getMonth() - this.count);
      let seconds = Math.floor(timestamp.getTime() / 1000);
      var timestampTime = {
        seconds: seconds,
        nanoseconds: null
      };

      let date = ApiService.getDate(timestamp);

      console.log(
        "date: ",
        timestamp.getMonth() + 1,
        timestamp.getYear(),
        a,
        timestamp,
        typeof timestamp,
        date
      );
      console.log(
        seconds,
        timestampNow.seconds,
        timestampTime.seconds,
        timestampTime,
        timestampNow
      );

      var price = 10 + this.count;
      let transferId = db
        .collection("users")
        .doc(uid)
        .collection("moneyTransfers")
        .doc().id;
      console.log("call here@ ", transferId);

      let year1 = 0;
      if (timestamp.getYear() === 121) {
        year1 = 2021;
      } else if (timestamp.getYear() === 120) {
        year1 = 2020;
      }
      let transfer = {
        id: transferId,
        uid: uid,
        postId: postId,
        type: "sale",
        soldPrice: Number(price),
        soldDateAt: timestamp,
        appliedDateAt: null,
        transferredDateAt: null,
        soldYear: year1,
        soldMonth: timestamp.getMonth() + 1,
        finalDay: 30,
        commissionRate: 0.2, // プラットフォーム手数料20%
        status: 0
      };

      let transfersCollection = db
        .collection("users")
        .doc(uid)
        .collection("moneyTransfers")
        .doc(transferId);

      batch.set(transfersCollection, transfer);
      console.log("count: ", this.count);

      this.count++;
      await batch.commit();

      // if (this.count === this.totalCount - 1) {
      //   await batch.commit();
      // }

      // }, 5000);
      // }
    }
  },
  computed: {
    user() {
      console.log("currentUser: ", this.$store.getters["user_module/user"]);
      return this.$store.getters["user_module/user"];
    }
  }
};
</script>
<style scoped>
.noti-avatar {
  background-color: blue;
  padding-top: 0.4rem;
  max-width: 5rem;
  max-height: 2.5rem;
}
</style>
