import { UserService } from "~/apis/user_service";
import {
  FETCH_USER,
  FETCH_POSTS,
  FETCH_NEXT_POSTS,
  FETCH_LIKED_POSTS,
  FETCH_LIKED_NEXT_POSTS,
  FETCH_PAID_POSTS,
  FETCH_PAID_NEXT_POSTS,
  FETCH_DRAFT_POSTS,
  FETCH_PUBLIC_POSTS,
  GET_USER_FROM_UID
} from "./actions_type";
import {
  FETCH_START,
  FETCH_END,
  SET_USER,
  SET_POSTS,
  RESET_STATE
} from "./mutations_type";

export const state = {
  posts: [],
  user: null,
  lastVisible: null
};

export const getters = {
  posts(state) {
    return state.posts;
  },
  user(state) {
    return state.user;
  },
  lastVisible(state) {
    return state.lastVisible;
  }
};

export const actions = {
  async [FETCH_USER]({ commit }, username) {
    const user = await UserService.fetchUser(username);
    commit(SET_USER, user);
    return user;
  },

  async [GET_USER_FROM_UID]({ commit }, uid) {
    const user = await UserService.getUserFromUid(uid);
    commit(SET_USER, user);
    return user;
  },

  async [FETCH_POSTS]({ commit }, { user, currentUid }) {
    let returnObj = await UserService.query(user, currentUid);
    commit(FETCH_END, returnObj);
    return returnObj;
  },

  async [FETCH_NEXT_POSTS](
    { commit },
    { user, currentUid, lastVisible, posts }
  ) {
    let returnObj = await UserService.queryMore(
      user,
      currentUid,
      lastVisible,
      posts
    );
    commit(FETCH_END, returnObj);
    return returnObj;
  },

  async [FETCH_LIKED_POSTS]({ commit }, { uid, currentUid }) {
    let returnObj = await UserService.queryLikedPosts(uid, currentUid);
    commit(FETCH_END, returnObj);
    return returnObj;
  },

  async [FETCH_LIKED_NEXT_POSTS](
    { commit },
    { uid, currentUid, lastVisible, posts }
  ) {
    let returnObj = await UserService.queryLikedPostsMore(
      uid,
      currentUid,
      lastVisible,
      posts
    );
    commit(FETCH_END, returnObj);
    return returnObj;
  },

  async [FETCH_PAID_POSTS]({ commit }, currentUid) {
    let returnObj = await UserService.queryPaidPosts(currentUid);
    commit(FETCH_END, returnObj);
    return returnObj;
  },

  async [FETCH_PAID_NEXT_POSTS](
    { commit },
    { currentUid, lastVisible, posts }
  ) {
    let returnObj = await UserService.queryPaidPostsMore(
      currentUid,
      lastVisible,
      posts
    );
    commit(FETCH_END, returnObj);
    return returnObj;
  },
  async [FETCH_DRAFT_POSTS]({ commit }, currentUid) {
    let draftPosts = await UserService.getDraftPosts(currentUid);
    commit(SET_POSTS, draftPosts);
    return draftPosts;
  },
  async [FETCH_PUBLIC_POSTS]({ commit }, currentUid) {
    // commit(FETCH_START);
    let publicPosts = await UserService.getPublicPosts(currentUid);
    commit(SET_POSTS, publicPosts);
    return publicPosts;
  }
};

export const mutations = {
  [FETCH_START](state) {
    // state.isLoading = true;
  },
  [SET_USER](state, user) {
    state.user = user;
    // state.isLoading = false;
  },
  [FETCH_END](state, returnObj) {
    state.posts = returnObj.posts;
    state.lastVisible = returnObj.lastVisible;
  },
  [SET_POSTS](state, posts) {
    state.posts = posts;
  },
  [RESET_STATE](state) {
    Object.assign(state, getDefaultState());
  }
};

const getDefaultState = () => {
  return {
    posts: [],
    user: null,
    lastVisible: null
  };
};
