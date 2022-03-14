import Vue from "vue";
import { CommentService } from "~/apis/comment_service";
import {
  FETCH_COMMENTS,
  FETCH_NEXT_COMMENTS,
  COMMENT_CREATE,
  COMMENT_DELETE
} from "./actions_type";
import { RESET_STATE, SET_COMMENTS } from "./mutations_type";

export const state = {
  post: null,
  comments: [],
  lastVisible: null
};

export const actions = {
  async [FETCH_COMMENTS](context, postId) {
    let returnObj = await CommentService.query(postId);
    context.commit(SET_COMMENTS, returnObj);
    return returnObj;
  },
  async [FETCH_NEXT_COMMENTS](context, { postId, comments, lastVisible }) {
    let returnObj = await CommentService.queryMore(
      postId,
      comments,
      lastVisible
    );
    context.commit(SET_COMMENTS, returnObj);
    return returnObj;
  },
  async [COMMENT_CREATE](context, { comment }) {
    return await CommentService.create(comment);
  },
  async [COMMENT_DELETE](context, { comment, post }) {
    return await CommentService.destroy(comment, post);
    // context.dispatch(FETCH_COMMENTS, payload.slug);
  }
};

/* eslint no-param-reassign: ["error", { "props": false }] */
export const mutations = {
  [SET_COMMENTS](state, returnObj) {
    state.comments = returnObj.comments;
    state.lastVisible = returnObj.lastVisible;
  },
  [RESET_STATE](state) {
    Object.assign(state, getDefaultState());
  }
};

export const getters = {
  post(state) {
    return state.post;
  },
  comments(state) {
    return state.comments;
  }
};

const getDefaultState = () => {
  return {
    post: null,
    comments: [],
    lastVisible: null
  };
};
