import { useState } from "react";
import "./EditPageActions.css";

type Props = { isDirty: boolean; onCancel: () => void; onSave: () => void };

export function EditPageActions({ isDirty, onCancel, onSave }: Props) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  function cancel() {
    if (!isDirty) {
      onCancel();
      return;
    }
    setConfirmOpen(true);
  }

  function saveAndReturn() {
    setConfirmOpen(false);
    onSave();
  }

  return (
    <>
      <div className="fl-admin-edit-page-actions">
        <button className="fl-admin-secondary-button" type="button" onClick={cancel}>取消</button>
        <button className="fl-admin-button" type="button" onClick={onSave}>保存</button>
      </div>
      {confirmOpen ? (
        <div className="fl-admin-edit-confirm-backdrop" role="presentation">
          <section className="fl-admin-edit-confirm" role="alertdialog" aria-modal="true" aria-labelledby="fl-admin-edit-confirm-title">
            <h3 id="fl-admin-edit-confirm-title">保存当前修改？</h3>
            <p>当前页面有尚未保存的配置。你可以保存后返回列表，或放弃修改直接返回。</p>
            <div className="fl-admin-edit-confirm-actions">
              <button className="fl-admin-secondary-button" type="button" onClick={() => setConfirmOpen(false)}>继续编辑</button>
              <button className="fl-admin-secondary-button" type="button" onClick={onCancel}>不保存并返回</button>
              <button className="fl-admin-button" type="button" onClick={saveAndReturn}>保存并返回</button>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
