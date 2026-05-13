// ES: Vista del recibo de venta o devolución
// EN: Sale or return receipt view

import type { Receipt } from '../../core/types/receipt.types'

interface ReceiptViewProps {
  receipt: Receipt
}

const fmt = (n: number) => `$${n.toLocaleString('es-CO', { minimumFractionDigits: 0 })}`

export function ReceiptView({ receipt }: ReceiptViewProps) {
  const isReturn = receipt.receiptType !== 'SALE'
  const isCreditMemo = isReturn && receipt.paymentType === 'CREDIT'
  const storeName = import.meta.env.VITE_STORE_NAME || 'Supermercado POS'

  return (
    <div className="receipt-print mx-auto max-w-sm overflow-hidden rounded-2xl border border-slate-200 bg-white p-7 font-mono text-sm shadow-pos-lg print:border-none print:shadow-none">
      <div className="mb-6 text-center">
        <p className="text-[0.6rem] font-bold uppercase tracking-[0.35em] text-slate-500">
          Ticket
        </p>
        <h1 className="mt-2 text-lg font-bold uppercase tracking-wide text-slate-900">
          {storeName}
        </h1>
        {isCreditMemo ? (
          <div className="mt-4 inline-flex rounded-full bg-slate-900 px-4 py-1.5 text-[0.65rem] font-bold uppercase tracking-wide text-white">
            Nota de crédito / Credit note
          </div>
        ) : (
          isReturn && (
            <div className="mt-4 inline-flex rounded-full bg-slate-800 px-4 py-1.5 text-[0.65rem] font-bold uppercase tracking-wide text-white">
              {receipt.receiptType === 'FULL_RETURN'
                ? 'Devolución total / Full return'
                : 'Devolución parcial / Partial'}
            </div>
          )
        )}
        <div className="mt-5 space-y-1 text-[0.72rem] text-slate-500">
          <p>Terminal · {receipt.terminalId}</p>
          <p>Cajero · {receipt.cashierId}</p>
          <p>{new Date(receipt.createdAt).toLocaleString('es-CO')}</p>
          {receipt.customerName && (
            <p className="text-slate-600">Cliente · {receipt.customerName}</p>
          )}
        </div>
        {isCreditMemo && (
          <p className="mx-auto mt-3 max-w-[14rem] text-[0.65rem] leading-relaxed text-slate-500">
            Ajuste en cuenta cliente — sin reembolso en efectivo / Customer account credit · no cash refund
          </p>
        )}
      </div>

      <div className="mb-6 h-px w-full bg-slate-200" />

      <ul className="mb-6 space-y-2">
        {receipt.items.map((item, i) => (
          <li key={i} className="flex justify-between gap-3 border-b border-slate-100 pb-2 last:border-0">
            <span className="min-w-0 flex-1 truncate text-[0.72rem] text-slate-700">
              <span className="font-semibold text-slate-900">{item.productName}</span>
              {' ×'}
              {item.quantity}
            </span>
            <span className="shrink-0 text-[0.72rem] font-semibold tabular-nums text-slate-900">
              {fmt(item.lineTotal)}
            </span>
          </li>
        ))}
      </ul>

      <div className="h-px w-full bg-slate-200" />

      <dl className="mt-5 space-y-2 text-[0.72rem]">
        <div className="flex justify-between text-slate-500">
          <dt>Subtotal</dt>
          <dd className="tabular-nums font-medium text-slate-800">{fmt(receipt.subtotal)}</dd>
        </div>
        <div className="flex justify-between text-slate-500">
          <dt>Iva / Tax</dt>
          <dd className="tabular-nums font-medium text-slate-800">{fmt(receipt.tax)}</dd>
        </div>
        {receipt.discount > 0 && (
          <div className="flex justify-between text-slate-600">
            <dt>Dto. / Discount</dt>
            <dd className="tabular-nums font-semibold">−{fmt(receipt.discount)}</dd>
          </div>
        )}
        <div className="flex justify-between border-t border-slate-200 pt-4 text-base font-bold text-slate-900">
          <dt>TOTAL</dt>
          <dd className="tabular-nums">{fmt(receipt.total)}</dd>
        </div>
      </dl>

      <div className="my-6 h-px w-full bg-slate-200" />

      <div className="space-y-2 text-[0.72rem]">
        <p>
          <span className="text-slate-500">Pago / Payment · </span>
          <span className="font-bold text-slate-900">{receipt.paymentType}</span>
        </p>
        {receipt.paymentType === 'CASH' && (
          <>
            <p>
              <span className="text-slate-500">Recibido / Received · </span>
              <span className="tabular-nums font-medium">{fmt(receipt.amountReceived ?? 0)}</span>
            </p>
            <p>
              <span className="text-slate-500">Vuelto / Change · </span>
              <span className="tabular-nums font-bold text-slate-900">{fmt(receipt.changeAmount ?? 0)}</span>
            </p>
          </>
        )}
        {receipt.paymentType === 'CREDIT' && receipt.creditReference && (
          <p>
            <span className="text-slate-500">Ref. crédito · </span>
            <span className="font-semibold">{receipt.creditReference}</span>
          </p>
        )}
        {isReturn && receipt.originalTransactionId && (
          <p className="break-all">
            <span className="text-slate-500">TX original · </span>
            <span>{receipt.originalTransactionId}</span>
          </p>
        )}
      </div>

      <div className="mt-8 rounded-xl bg-slate-900 px-4 py-3 text-center">
        <p className="text-[0.6rem] font-medium uppercase tracking-widest text-slate-400">Transacción</p>
        <p className="mt-1 font-mono text-xs font-semibold tracking-wide text-slate-200">
          {receipt.transactionId}
        </p>
      </div>
      <p className="mt-5 text-center text-[0.65rem] font-medium text-slate-400">
        Gracias · Thank you!
      </p>
    </div>
  )
}
