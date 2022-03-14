import Vue from "vue";
import { PostService } from "~/apis/post_service";
import { LikeService } from "~/apis/like_service";
import {
  FETCH_POST,
  FETCH_EDITING_POST,
  FAVORITE_ADD,
  FAVORITE_REMOVE,
  UPDATE_EDITING_POST,
  POST_EDIT_ADD_TAG,
  POST_EDIT_REMOVE_TAG,
  POST_DELETE,
  CHECK_OVERLAP_POST_ID,
  CREATE_PAID_POSTS,
  FETCH_POST_ISLIKED,
  POST_CREATE,
  POST_UPDATE,
  FETCH_POST_FROM_ID,
  CREATE_EDITING_POST,
  EDITING_POST_DELETE
} from "./actions_type";
import {
  SET_POST,
  TAG_ADD,
  TAG_REMOVE,
  FETCH_START,
  FETCH_END,
  LOAD_END,
  SET_EDITINGPOST,
  RESET_STATE
} from "./mutations_type";

export const state = {
  post: null,
  editingPost: null,
  comments: [],
  isLoading: true
};

export const actions = {
  async [FETCH_POST]({ commit }, { slug, currentUid }) {
    commit(FETCH_START);
    const post = await PostService.get(slug, currentUid);
    commit(FETCH_END, post);
    return post;
  },

  async [FETCH_POST_FROM_ID]({ commit }, postId) {
    const post = await PostService.getPostFromId(postId);
    commit(FETCH_END, post);
    return post;
  },

  async [FETCH_EDITING_POST]({ commit }, postId) {
    commit(FETCH_START);
    const editingPost = await PostService.getEditingPost(postId);
    commit(SET_EDITINGPOST, editingPost);
    return editingPost;
  },

  async [FAVORITE_ADD](context, { post, currentUid }) {
    // context.commit(FETCH_START);
    const returnPost = await LikeService.add(post, currentUid);
    context.commit(FETCH_END, returnPost);
    // return;
  },
  async [FAVORITE_REMOVE](context, { post, currentUid }) {
    // context.commit(FETCH_START);
    const returnPost = await LikeService.remove(post, currentUid);
    context.commit(FETCH_END, returnPost);
    // return;
  },

  async [FETCH_POST_ISLIKED]({ commit }, { post, currentUid }) {
    commit(FETCH_START);

    let { isLikedBool, isLikedExist } = await PostService.getIsLiked(
      post,
      currentUid
    );
    post.isLiked = isLikedBool;
    post.isLikedExist = isLikedExist;
    return post;
  },

  async [CREATE_EDITING_POST](context, editingPost) {
    editingPost = await PostService.createEditingPost(editingPost);

    context.commit(SET_EDITINGPOST, editingPost);

    return editingPost;
  },

  async [UPDATE_EDITING_POST](context, editingPost) {
    editingPost = await PostService.updateEditingPost(editingPost);
    context.commit(SET_EDITINGPOST, editingPost);
    return editingPost;
  },

  async [POST_CREATE](context, post) {
    post = await PostService.create(post);
    context.commit(FETCH_END, post);
    return post;
  },
  async [POST_UPDATE](context, { post, postId }) {
    post = await PostService.updatePost(post, postId);
    return post;
  },

  async [POST_DELETE](context, post) {
    return await PostService.delete(post);
  },

  async [EDITING_POST_DELETE](context, post) {
    return await PostService.deleteEditingPost(post);
  },

  [POST_EDIT_ADD_TAG](context, tag) {
    context.commit(TAG_ADD, tag);
  },
  [POST_EDIT_REMOVE_TAG](context, tag) {
    context.commit(TAG_REMOVE, tag);
  },

  [CREATE_PAID_POSTS]({ commit }, { post, currentUid }) {
    PostService.createPaidPosts(post, currentUid);
  },
  async [CHECK_OVERLAP_POST_ID](context, { postId }) {
    const isAvailable = await PostService.checkOverlapPostID(postId);
    return isAvailable;
  }
};

/* eslint no-param-reassign: ["error", { "props": false }] */
export const mutations = {
  [FETCH_START](state) {
    state.isLoading = true;
  },

  [FETCH_END](state, post) {
    state.isLoading = false;
    state.post = post;
  },
  [SET_EDITINGPOST](state, editingPost) {
    state.editingPost = editingPost;
  },
  [LOAD_END](state) {
    state.isLoading = false;
  },

  [TAG_ADD](state, tag) {
    state.post.tagList = state.post.tagList.concat([tag]);
  },
  [TAG_REMOVE](state, tag) {
    state.post.tagList = state.post.tagList.filter(t => t !== tag);
  },
  [RESET_STATE](state) {
    Object.assign(state, getDefaultState());
  }
};

export const getters = {
  post(state) {
    return state.post;
  },
  isLoading(state) {
    return state.isLoading;
  },
  editingPost(state) {
    return state.editingPost;
  }
};

const getDefaultState = () => {
  return {
    post: null,
    editingPost: null,
    comments: []
  };
};
