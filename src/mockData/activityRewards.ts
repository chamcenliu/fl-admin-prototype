export type RewardStatus = "未生效" | "进行中" | "已结束" | "已停用";
export type RewardType = "现金" | "羽币" | "邀请次数" | "瓜分资格" | "积分";
export type ClaimMethod = "手动领取" | "自动到账";
export type RewardPeriod = "天" | "周" | "月";
export type RewardStatistics = {
  yesterdayAmount?: string;
  yesterdayCount?: string;
  yesterdayUsers?: string;
  totalAmount: string;
  totalCount?: string;
  totalUsers: string;
};

export type Reward = {
  id: string;
  name: string;
  type: RewardType;
  amount: string;
  listMode: "自动生成" | "手动添加";
  review: boolean;
  validity: string;
  startAt?: string;
  endAt?: string;
  releaseAt?: string;
  winnerUsers?: string[];
  status: RewardStatus;
  activity: string;
  group: string;
  description: string;
  note: string;
  claimMethod?: ClaimMethod;
  ruleType?: "完成指定任务" | "完成任一任务" | "完成所有任务";
  ruleCount?: string;
  conditionType?: "满足以下所有条件" | "满足以下任一条件";
  taskName?: string;
  releaseLimitEnabled?: boolean;
  releaseLimit?: string;
  releasePeriod?: RewardPeriod;
  perUserLimit?: string;
  mutualExclusion?: boolean;
  mutualExclusionRewards?: string[];
};

export type RewardRecord = { id: string; rewardId: string; reward: string; user: string; date: string; amount: string; status: "待审核" | "已发放" | "已拒绝" | "已扣除"; activity: string };

export const activityRewards: Reward[] = [
  { id: "RS000802", name: "新手任务 - 资源任务奖励", type: "现金", amount: "7", listMode: "自动生成", validity: "2026-08-06 00:00 至 2026-08-26 00:00", startAt: "2026-08-06T00:00", endAt: "2026-08-26T00:00", status: "进行中", activity: "新手大作战", group: "新手任务奖励", description: "完成资源任务后获得奖励", note: "新用户首个资源任务奖励", claimMethod: "自动到账", ruleType: "完成指定任务", ruleCount: "1", conditionType: "满足以下所有条件", taskName: "资源任务 · 上架一个全新资源", releaseLimitEnabled: false, releasePeriod: "天", perUserLimit: "1", mutualExclusion: false, mutualExclusionRewards: [] },
  { id: "RS000803", name: "内测调研 - 6元奖励", type: "现金", amount: "6", listMode: "自动生成", validity: "2026-08-06 00:00 至 2026-08-26 00:00", startAt: "2026-08-06T00:00", endAt: "2026-08-26T00:00", status: "已结束", activity: "有奖调查问卷", group: "用户调研奖励", description: "完成问卷并通过审核后发放", note: "内测调研奖励", claimMethod: "手动领取", ruleType: "完成指定任务", ruleCount: "1", conditionType: "满足以下所有条件", taskName: "完成有奖调查问卷", releaseLimitEnabled: true, releaseLimit: "1000", releasePeriod: "天", perUserLimit: "1", mutualExclusion: true, mutualExclusionRewards: ["RS000802"] },
  { id: "RS000804", name: "2025贺岁纪 - 一等奖", type: "羽币", amount: "100", listMode: "手动添加", validity: "2026-08-26 00:00 起", startAt: "2026-08-26T00:00", releaseAt: "2026-08-26T00:00", status: "未生效", activity: "推荐有奖", group: "新春锦鲤奖励", description: "活动一等奖奖励", note: "手工导入获奖名单", claimMethod: "自动到账", winnerUsers: ["Tom1", "Tom2", "Tom3"], mutualExclusion: true, mutualExclusionRewards: ["RS000803"] },
  { id: "RS000805", name: "邀请注册 - 新人奖励", type: "羽币", amount: "20", listMode: "自动生成", validity: "长期有效", startAt: "2026-08-26T00:00", status: "未生效", activity: "邀请注册", group: "邀请注册奖励", description: "邀请好友注册并完成首个任务", note: "邀请注册奖励", claimMethod: "自动到账", ruleType: "完成指定任务", ruleCount: "1", conditionType: "满足以下所有条件", taskName: "邀请一位好友", releaseLimitEnabled: false, releasePeriod: "天", perUserLimit: "1", mutualExclusion: false, mutualExclusionRewards: [] }
];

export const activityRewardRecords: RewardRecord[] = [
  { id: "RR20260924001", rewardId: "RS000802", reward: "新手任务 - 资源任务奖励", user: "chtes", date: "2026-09-24", amount: "7", status: "待审核", activity: "新手大作战" },
  { id: "RR20260924002", rewardId: "RS000803", reward: "内测调研 - 6元奖励", user: "chamcen", date: "2026-09-24", amount: "6", status: "已发放", activity: "有奖调查问卷" },
  { id: "RR20260924003", rewardId: "RS000804", reward: "2025贺岁纪 - 一等奖", user: "tom1", date: "2026-09-23", amount: "100", status: "已拒绝", activity: "推荐有奖" },
  { id: "RR20260924004", rewardId: "RS000802", reward: "新手任务 - 资源任务奖励", user: "tom2", date: "2026-09-23", amount: "7", status: "已扣除", activity: "新手大作战" }
];

export const activityRewardStatistics: Record<string, RewardStatistics> = {
  RS000802: { yesterdayAmount: "14 元", yesterdayCount: "2 次", yesterdayUsers: "2 人", totalAmount: "126 元", totalCount: "18 次", totalUsers: "18 人" },
  RS000803: { yesterdayAmount: "6 元", yesterdayCount: "1 次", yesterdayUsers: "1 人", totalAmount: "96 元", totalCount: "16 次", totalUsers: "16 人" },
  RS000804: { totalAmount: "300 枚", totalUsers: "3 人" },
  RS000805: { yesterdayAmount: "40 枚", yesterdayCount: "2 次", yesterdayUsers: "2 人", totalAmount: "480 枚", totalCount: "24 次", totalUsers: "24 人" }
};
