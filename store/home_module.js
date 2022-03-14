import { PostService, TagService } from "~/apis/post_service";
import {
  FETCH_POSTS,
  FETCH_NEXT_POSTS,
  FETCH_TAG_POSTS,
  FETCH_NEXT_TAG_POSTS
} from "./actions_type";
import {
  FETCH_START,
  FETCH_END,
  SET_TAG_POSTS,
  RESET_STATE
} from "./mutations_type";

export const state = {
  posts: [],
  lastVisible: null
};

export const getters = {
  posts(state) {
    return state.posts;
  },
  lastVisible(state) {
    return state.lastVisible;
  }
};

export const actions = {
  async [FETCH_POSTS]({ commit }, { currentUid }) {
    let returnObj = await PostService.query(currentUid);
    commit(FETCH_END, returnObj);
    return returnObj;
  },
  async [FETCH_NEXT_POSTS]({ commit }, { currentUid, lastVisible, posts }) {
    let returnObj = await PostService.queryMore(currentUid, lastVisible, posts);
    commit(FETCH_END, returnObj);
    return returnObj;
  },

  async [FETCH_TAG_POSTS]({ commit }, { currentUid, tag }) {
    let returnObj = await TagService.query(currentUid, tag);
    commit(FETCH_END, returnObj);
    return returnObj;
  },
  async [FETCH_NEXT_TAG_POSTS](
    { commit },
    { currentUid, lastVisible, tag, posts }
  ) {
    let returnObj = await TagService.queryMore(
      currentUid,
      lastVisible,
      tag,
      posts
    );
    commit(FETCH_END, returnObj);
    return returnObj;
  }
};

export const mutations = {
  [FETCH_END](state, returnObj) {
    state.posts = returnObj.posts;
    state.lastVisible = returnObj.lastVisible;
  },

  [RESET_STATE](state) {
    Object.assign(state, getDefaultState());
  },

  [SET_TAG_POSTS](state, posts) {
    state.posts = posts;
  }
};

const getDefaultState = () => {
  return {
    posts: [],
    lastVisible: null
  };
};
