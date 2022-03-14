<template>
  <div>
    <div class="wrapper-table">
      <table>
        <tr style="background-color: #f2f2f2; margin: 0px;">
          <th>Sales period</th>
          <th>Sales amount</th>
          <th>Status</th>
        </tr>
        <template v-for="(monthlyData, index) in monthlyDatas">
          <tr
            :key="index"
            style="text-align: center; line-height: 200%;"
            v-if="
              (type === `${UNAPPLIED}` &&
                monthlyData.unAppliedMonthlyAmount > 0) ||
                (type === `${APPLIED}` && monthlyData.appliedMonthlyAmount > 0)
            "
          >
            <td>
              {{ monthlyData.soldMonthStr }} in {{ monthlyData.soldYear }}
            </td>
            <td v-if="type === `${UNAPPLIED}`">
              ${{ monthlyData.unAppliedMonthlyAmount }}
            </td>
            <td v-else-if="type === `${APPLIED}`">
              ${{ monthlyData.appliedMonthlyAmount }}
            </td>
            <td v-if="type === `${UNAPPLIED}`">
              {{ monthlyData.status0Str }}
            </td>
            <td v-else-if="type === `${APPLIED}`">
              {{ monthlyData.status1or2Str }}
            </td>
            <td
              class="detail-button"
              @click="showDetailDialog(monthlyDatas[index])"
            >
              Detail
            </td>
          </tr>
        </template>
      </table>
    </div>
  </div>
</template>

<script>
import { FETCH_MONTHLY_TRANSFERS } from "~/store/actions_type";
import { UNAPPLIED, APPLIED } from "~/apis/constant_type";
export default {
  props: ["monthlyDatas", "type"],
  data() {
    return {
      UNAPPLIED: UNAPPLIED,
      APPLIED: APPLIED
    };
  },
  methods: {
    async showDetailDialog(monthlyData) {
      let currentUser = AuthService.getAuthCurrentUser();
      console.log("monthlyDatas ", this.monthlyDatas);
      console.log("monthlyData ", this.type, monthlyData, currentUser);

      await this.$store.dispatch(`transfer_module/${FETCH_MONTHLY_TRANSFERS}`, {
        soldYear: monthlyData.soldYear,
        soldMonth: monthlyData.soldMonth,
        uid: currentUser.uid,
        type: this.type
      });

      this.$emit("show-detail-dialog", monthlyData);
    }
  }
};
</script>

<style scoped>
.wrapper-table > table {
  width: 100%;
  margin-bottom: 20px;
  font-size: 14px;
}

.detail-button {
  color: #2cb696;
  cursor: pointer;
}
</style>
