import { adminUsers } from "./adminPrototype";

export type RewardWinner = {
  id: string;
  name: string;
  avatar: string;
  contacts: string[];
  registeredAt: string;
  tags: string[];
  lastLogin: string;
  status: string;
};

export const rewardWinnerUsers: Record<string, RewardWinner[]> = {
  RS000804: [
    { id: "reward-user-tom1", name: "Tom1", avatar: "T1", contacts: ["tom1@example.com"], registeredAt: "2024-01-18", tags: ["消费者"], lastLogin: "2026-09-26 10:42", status: "正常" },
    { id: "reward-user-tom2", name: "Tom2", avatar: "T2", contacts: ["138 0000 0002"], registeredAt: "2024-02-06", tags: ["资源作者"], lastLogin: "2026-09-25 16:18", status: "正常" },
    { id: "reward-user-tom3", name: "Tom3", avatar: "T3", contacts: ["tom3@example.com"], registeredAt: "2024-03-12", tags: ["测试"], lastLogin: "2026-09-20 09:06", status: "冻结" }
  ]
};

export const rewardUserCandidates: RewardWinner[] = [
  ...adminUsers.map(user => ({
    id: user.id,
    name: user.name,
    avatar: user.name.slice(0, 2).toUpperCase(),
    contacts: user.contacts,
    registeredAt: user.registeredAt,
    tags: user.tags,
    lastLogin: user.lastLogin,
    status: user.status
  })),
  { id: "reward-user-tom1", name: "Tom1", avatar: "T1", contacts: ["tom1@example.com"], registeredAt: "2024-01-18", tags: ["消费者"], lastLogin: "2026-09-26 10:42", status: "正常" },
  { id: "reward-user-tom2", name: "Tom2", avatar: "T2", contacts: ["138 0000 0002"], registeredAt: "2024-02-06", tags: ["资源作者"], lastLogin: "2026-09-25 16:18", status: "正常" },
  { id: "reward-user-tom3", name: "Tom3", avatar: "T3", contacts: ["tom3@example.com"], registeredAt: "2024-03-12", tags: ["测试"], lastLogin: "2026-09-20 09:06", status: "冻结" },
  { id: "reward-user-lina", name: "Lina", avatar: "LI", contacts: ["lina@example.com"], registeredAt: "2024-04-20", tags: ["小说"], lastLogin: "2026-09-24 12:30", status: "正常" }
];

export const rewardWinnerTags = ["消费者", "资源作者", "节点商", "小说", "测试"];
