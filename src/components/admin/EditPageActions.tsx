import "./EditPageActions.css";
type Props = { isDirty: boolean; onCancel: () => void; onSave: () => void };
export function EditPageActions({ isDirty, onCancel, onSave }: Props) { function cancel() { if (!isDirty) return onCancel(); if (window.confirm("当前页面有未保存的修改，是否保存？")) onSave(); else onCancel(); } return <div className="fl-admin-edit-page-actions"><button className="fl-admin-secondary-button" type="button" onClick={cancel}>取消</button><button className="fl-admin-button" type="button" onClick={onSave}>保存</button></div>; }
