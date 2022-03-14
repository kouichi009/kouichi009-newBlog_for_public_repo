<template>
  <v-card class="tab-card">
    <v-card-title class="text-center justify-center py-6">
      <h2>Account Settings</h2>
    </v-card-title>
    <v-tabs grow show-arrows>
      <v-tab to="/settings/account">Account</v-tab>
      <v-tab to="/settings/cardinfo">Credit card</v-tab>
      <v-tab to="/settings/bank_account">Bank account</v-tab>
      <v-tab to="/settings/sales_manage">Sales management</v-tab>
    </v-tabs>
  </v-card>
</template>

<script>
export default {
  data() {
    return {
      tab: null,
      items: ["Account", "Credit card", "Bank account"]
    };
  }
};
</script>

<style scoped>
.tab-card {
  padding: 2rem 2rem;
}
.v-tab {
  font-size: 1.6rem;
  text-transform: capitalize;
}

@media (max-width: 576px) {
  .tab-card {
    padding: 0.5rem 0.5rem;
  }
  .v-tab {
    font-size: 1.2rem;
  }
}
</style>
