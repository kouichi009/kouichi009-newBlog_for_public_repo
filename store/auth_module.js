import { db, firebase } from "~/plugins/firebase";
import { AuthService } from "~/apis/auth_service";
import {
  LOGOUT,
  LOGIN_EMAIL,
  SEND_MAGIC_LINK,
  GET_AUTH_CURRENTUSER,
  UPDATE_USER,
  UPDATE_USERNAME,
  LOGIN_GOOGLE,
  REGISTER_CREDITCARD,
  DELETE_CREDITCARD,
  REGISTER_ADDRESS_BANK,
  DELETE_ADDRESS_BANK,
  GET_CURRENT_USER_PRIVATEINFO
} from "./actions_type";
import {
  SET_AUTH_CURRENTUSER,
  PURGE_AUTH,
  SET_USER_PRIVATEINFO
} from "./mutations_type";
import { SET_USER_ID, CHECK_OVERLAP_PROFILE_ID } from "../store/actions_type";

export const state = {
  privateInfo: null,
  authCurrentUser: null,
  currentUid: ""
};

export const getters = {
  privateInfo(state) {
    return state.privateInfo;
  },
  authCurrentUser(state) {
    return state.authCurrentUser;
  },
  currentUid(state) {
    return state.currentUid;
  }
};

export const actions = {
  async [LOGOUT](context) {
    console.log("logout 1");
    await AuthService.signOut();
    console.log("logout 3");
    context.commit(PURGE_AUTH);
    return;
  },

  async [SEND_MAGIC_LINK]({ commit }, email) {
    await AuthService.sendMagicLink(email);
    return;
  },

  async [LOGIN_EMAIL]({ commit }, url) {
    let returnObj = await AuthService.signInWithEmailLink(url);
    commit(SET_AUTH_CURRENTUSER, returnObj.user);
    return returnObj;
  },

  async [LOGIN_GOOGLE]({ commit }) {
    let authCurrentUser = await AuthService.loginGoogle();
    commit(SET_AUTH_CURRENTUSER, authCurrentUser);
    return authCurrentUser;
  },

  async [GET_CURRENT_USER_PRIVATEINFO]({ commit }, currentUid) {
    let privateInfo = await AuthService.getCurrentUserPrivateInfo(currentUid);
    commit(SET_USER_PRIVATEINFO, { privateInfo });
    return privateInfo;
  },

  async [UPDATE_USERNAME]({ commit }, { refCurrentUser, username }) {
    await AuthService.updateUsername(refCurrentUser, username);
    return;
  },

  async [UPDATE_USER]({ commit }, { refCurrentUser, authCurrentUser }) {
    await AuthService.updateUser(refCurrentUser, authCurrentUser);
    commit(SET_AUTH_CURRENTUSER, authCurrentUser);

    return refCurrentUser; // returnするのは、refCurrentUser
  },

  async [GET_AUTH_CURRENTUSER]({ commit }) {
    let authCurrentUser = await AuthService.getAuthCurrentUser();
    console.log("checkAuth: ", authCurrentUser);
    commit(SET_AUTH_CURRENTUSER, authCurrentUser);
    return authCurrentUser;
  },
  async [REGISTER_CREDITCARD]({ commit }, { privateInfo, card }) {
    const stripeInfo = await AuthService.registerCreditCard(privateInfo, card);
    privateInfo.stripeInfo = stripeInfo;

    commit(SET_USER_PRIVATEINFO, { privateInfo });
    return;
  },
  async [DELETE_CREDITCARD]({ commit }, { privateInfo }) {
    const stripeInfo = await AuthService.deleteCreditCard(privateInfo);
    privateInfo.stripeInfo = stripeInfo;

    commit(SET_USER_PRIVATEINFO, { privateInfo });
    return;
  },

  async [REGISTER_ADDRESS_BANK]({ commit }, { privateInfo, address, bank }) {
    await AuthService.registerAddressAndBank(privateInfo, address, bank);
    return;
  },
  async [DELETE_ADDRESS_BANK]({ commit }, { privateInfo, address, bank }) {
    await AuthService.deleteAddressAndBank(privateInfo, address, bank);
    return;
  }
};

export const mutations = {
  [SET_AUTH_CURRENTUSER](state, authCurrentUser) {
    state.authCurrentUser = authCurrentUser;
    if (authCurrentUser) {
      state.currentUid = authCurrentUser.uid;
    }
  },
  [SET_USER_PRIVATEINFO](state, { privateInfo }) {
    state.privateInfo = privateInfo;
  },
  [PURGE_AUTH](state) {
    console.log("ログアウト");
    state.privateInfo = null;
    state.authCurrentUser = null;
    state.currentUid = "";
  }
};
