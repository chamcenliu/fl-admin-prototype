import { Check, RotateCcw, Search, X } from "lucide-react";
import { approvalOrders, orderSummary } from "../../mockData/orders";
import { PrdWrapper } from "../../components/prd/PrdWrapper";
import { Button } from "../../components/ui/Button";

const toneMap = {
  blue: "border-blue-200 bg-blue-50 text-blue-700",
  red: "border-red-200 bg-red-50 text-red-700",
  amber: "border-amber-200 bg-amber-50 text-amber-700"
};

export function OrderApprovalPage({ onOpenPrd }: { onOpenPrd: (noteId: string) => void }) {
  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-brand-dark">示例业务页面</p>
          <h2 className="text-2xl font-bold">订单审批</h2>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-muted">这个页面演示业务 UI 如何通过 PrdWrapper 绑定需求说明。真实项目中，页面只接收 mockData 或接口数据。</p>
        </div>
        <Button icon={<RotateCcw className="h-4 w-4" />}>创建新迭代</Button>
      </div>

      <PrdWrapper noteId="prd-risk-summary" onOpen={onOpenPrd}>
        <section className="grid gap-4 md:grid-cols-3">
          {orderSummary.map(item => (
            <article key={item.label} className={`border p-5 ${toneMap[item.tone as keyof typeof toneMap]}`} style={{ borderRadius: 8 }}>
              <span className="text-sm font-bold">{item.label}</span>
              <strong className="mt-3 block text-3xl">{item.value}</strong>
            </article>
          ))}
        </section>
      </PrdWrapper>

      <PrdWrapper noteId="prd-order-filter" onOpen={onOpenPrd}>
        <section className="panel p-4">
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex h-10 min-w-72 items-center gap-2 border border-line bg-white px-3 text-sm text-muted" style={{ borderRadius: 8 }}>
              <Search className="h-4 w-4" />
              <input className="w-full border-0 outline-none" placeholder="搜索订单号、客户或业务线" />
            </label>
            <select className="h-10 border border-line bg-white px-3 text-sm" style={{ borderRadius: 8 }}>
              <option>全部状态</option>
              <option>待审批</option>
              <option>复核中</option>
              <option>已退回</option>
            </select>
            <select className="h-10 border border-line bg-white px-3 text-sm" style={{ borderRadius: 8 }}>
              <option>全部风险</option>
              <option>高风险</option>
              <option>中风险</option>
              <option>低风险</option>
            </select>
            <span className="ml-auto text-sm text-muted">共 {approvalOrders.length} 条</span>
          </div>
        </section>
      </PrdWrapper>

      <PrdWrapper noteId="prd-approval-action" onOpen={onOpenPrd}>
        <section className="panel overflow-hidden">
          <table className="w-full min-w-[860px] border-collapse text-sm">
            <thead className="bg-slate-50 text-left text-muted">
              <tr>
                {["订单号", "客户", "业务线", "金额", "风险", "状态", "SLA", "操作"].map(column => (
                  <th key={column} className="border-b border-line px-4 py-3 font-bold">{column}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {approvalOrders.map(order => (
                <tr key={order.id} className="hover:bg-slate-50">
                  <td className="border-b border-line px-4 py-4 font-bold text-brand-dark">{order.id}</td>
                  <td className="border-b border-line px-4 py-4">{order.customer}</td>
                  <td className="border-b border-line px-4 py-4">{order.line}</td>
                  <td className="border-b border-line px-4 py-4">{order.amount}</td>
                  <td className="border-b border-line px-4 py-4">{order.risk}</td>
                  <td className="border-b border-line px-4 py-4">{order.status}</td>
                  <td className="border-b border-line px-4 py-4">{order.sla}</td>
                  <td className="border-b border-line px-4 py-4">
                    <div className="flex gap-2">
                      <Button icon={<Check className="h-4 w-4" />}>通过</Button>
                      <Button icon={<X className="h-4 w-4" />} disabled={order.status === "已退回"}>退回</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </PrdWrapper>
    </div>
  );
}
