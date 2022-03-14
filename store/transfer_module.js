import { TransferService } from "~/apis/transfer_service";
import {
  FETCH_TRANSFERS,
  FETCH_MONTHLY_TRANSFERS,
  APPLY_TRANSFER,
  GET_TOTAL_SALES_PROFIT_AMOUNT,
  FETCH_SALES_POSTS
} from "./actions_type";
import {
  FETCH_END,
  SET_MONEYTRANSFERS,
  SET_SALES_POSTS,
  SET_TOTAL_SALES_PROFIT_AMOUNT,
  RESET_STATE
} from "./mutations_type";

export const state = {
  depositAmount: 0,
  salesPosts: []
};

export const actions = {
  async [GET_TOTAL_SALES_PROFIT_AMOUNT]({ commit }, { currentUid }) {
    const depositAmount = await TransferService.getTotalSalesProfitAmount(
      currentUid
    );
    commit(SET_TOTAL_SALES_PROFIT_AMOUNT, {
      depositAmount
    });
  },
  async [APPLY_TRANSFER]({ commit }, { applyAmount, currentUid }) {
    await TransferService.applyTransfer(applyAmount, currentUid);
    return;
  },
  async [FETCH_SALES_POSTS]({ commit }, { currentUid }) {
    const salesPosts = await TransferService.fetchSalesPosts(currentUid);
    commit(SET_SALES_POSTS, {
      salesPosts
    });
  }
};

export const mutations = {
  [SET_TOTAL_SALES_PROFIT_AMOUNT](state, { depositAmount }) {
    state.depositAmount = depositAmount;
  },
  [SET_SALES_POSTS](state, { salesPosts }) {
    state.salesPosts = salesPosts;
  },

  [RESET_STATE](state) {
    state.salesPosts = [];
  }
};

export const getters = {
  depositAmount(state) {
    return state.depositAmount;
  },
  salesPosts(state) {
    return state.salesPosts;
  }
};
