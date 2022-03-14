import Vue from "vue";
import { NotificationService } from "~/apis/notification_service";

import {
  FETCH_NOTIFICATIONS,
  FETCH_NEXT_NOTIFICATIONS,
  RESET_BADGE_NOTIFICATIONS
} from "./actions_type";
import { SET_BADGE, FETCH_START, FETCH_END } from "./mutations_type";

export const state = {
  notifications: [],
  badgeCount: 0,
  lastVisible: null,
  isLoading: true
};

export const actions = {
  async [FETCH_NOTIFICATIONS]({ commit }, currentUid) {
    commit(FETCH_START);
    let badgeCount = NotificationService.getBadgeCount(currentUid);

    var returnObj = NotificationService.query(currentUid);
    const [badgeCountResponse, returnObjResponse] = await Promise.all([
      badgeCount,
      returnObj
    ]);

    //
    returnObjResponse.badgeCount = badgeCountResponse;
    commit(FETCH_END, returnObjResponse);
    return returnObjResponse;
  },

  async [FETCH_NEXT_NOTIFICATIONS](
    { commit },
    { currentUid, lastVisible, notifications }
  ) {
    let returnObj = await NotificationService.queryMore(
      currentUid,
      lastVisible,
      notifications
    );
    commit(FETCH_END, returnObj);
    return returnObj;
    // }
  },

  [RESET_BADGE_NOTIFICATIONS]({ commit }, currentUid) {
    NotificationService.resetBadge(currentUid);
    commit(SET_BADGE, 0);
    // return post;
  }
};

/* eslint no-param-reassign: ["error", { "props": false }] */
export const mutations = {
  [FETCH_START](state) {
    state.isLoading = true;
  },

  [FETCH_END](state, returnObj) {
    state.isLoading = false;
    state.notifications = returnObj.notifications;
    state.lastVisible = returnObj.lastVisible;
    if (returnObj.badgeCount) {
      state.badgeCount = returnObj.badgeCount;
    }
  },

  [SET_BADGE](state, count) {
    state.badgeCount = count;
  }
};

export const getters = {
  notifications(state) {
    return state.notifications;
  },
  badgeCount(state) {
    return state.badgeCount;
  },
  lastVisible(state) {
    return state.lastVisible;
  },
  isLoading(state) {
    return state.isLoading;
  }
};
