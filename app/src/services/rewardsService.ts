import api from "../api/axiosClient";

export const rewardsService = {
  getItems(category?: string) {
    const params = category && category !== "all" ? { category } : {};
    return api.get("/rewards/items", { params }).then((r) => r.data);
  },

  redeemReward(rewardItemId: string) {
    return api.post("/rewards/redeem", { rewardItemId }).then((r) => r.data);
  },
};
