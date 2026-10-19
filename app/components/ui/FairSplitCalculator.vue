<script setup lang="ts">
import { ArrowRight, QrCode, Check } from 'lucide-vue-next'
import type { DecisionRoom, UserProfile, Expense, DebtTransfer } from '~/types'

const props = defineProps<{
  room: DecisionRoom
  participants: UserProfile[]
  settledKeys: Record<string, boolean>
}>()

const emit = defineEmits<{
  addExpense: [expense: Omit<Expense, 'id'>]
  openQr: [transfer: DebtTransfer]
  toggleSettled: [key: string]
}>()

const title = ref('')
const amount = ref('')
const paidBy = ref('user-local')

function handleSubmit() {
  const num = parseFloat(amount.value)
  if (!title.value.trim() || isNaN(num) || num <= 0) return

  emit('addExpense', {
    title: title.value.trim(),
    amount: num,
    paidBy: paidBy.value,
    splitAmong: props.participants.slice(0, 5).map(p => p.id),
  })

  title.value = ''
  amount.value = ''
}

// Minimum Transfers Debt Simplification Algorithm
const splitCalculations = computed(() => {
  const activeMembers = props.participants.slice(0, 5)
  const balances: Record<string, number> = {}
  activeMembers.forEach(m => {
    balances[m.id] = 0
  })

  let total = 0
  props.room.expenses.forEach(exp => {
    total += exp.amount
    const splitCount = exp.splitAmong.length || 1
    const share = exp.amount / splitCount
    if (balances[exp.paidBy] !== undefined) {
      balances[exp.paidBy] += exp.amount
    }
    exp.splitAmong.forEach(memberId => {
      if (balances[memberId] !== undefined) {
        balances[memberId] -= share
      }
    })
  })

  const debtors: { person: UserProfile; amount: number }[] = []
  const creditors: { person: UserProfile; amount: number }[] = []
  Object.entries(balances).forEach(([id, bal]) => {
    const person = activeMembers.find(p => p.id === id)
    if (person && bal < -0.01) debtors.push({ person, amount: -bal })
    if (person && bal > 0.01) creditors.push({ person, amount: bal })
  })

  const calculatedTransfers: DebtTransfer[] = []
  let i = 0
  let j = 0
  while (i < debtors.length && j < creditors.length) {
    const d = debtors[i]
    const c = creditors[j]
    if (!d || !c) break
    const settledAmt = Math.min(d.amount, c.amount)

    calculatedTransfers.push({
      key: `${d.person.id}->${c.person.id}`,
      from: d.person,
      to: c.person,
      amount: settledAmt,
    })

    d.amount -= settledAmt
    c.amount -= settledAmt
    if (d.amount < 0.01) i++
    if (c.amount < 0.01) j++
  }

  return {
    totalSpent: total,
    perPersonShare: activeMembers.length > 0 ? total / activeMembers.length : 0,
    transfers: calculatedTransfers,
  }
})
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
    <!-- Left Column: Expense Log & Add Form -->
    <div class="lg:col-span-7 space-y-5">
      <div class="bg-card border border-line rounded-[16px] p-5 sm:p-6">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="text-lg font-bold text-text-primary">Shared Group Expenses</h3>
            <p class="text-xs text-text-muted">
              Log who paid for what — we’ll calculate the minimum transfers needed.
            </p>
          </div>
          <div class="text-right">
            <div class="text-xs text-text-muted font-mono">Total Group Bill</div>
            <div class="text-xl font-black text-sky-soft font-mono">
              ${{ splitCalculations.totalSpent.toFixed(2) }}
            </div>
          </div>
        </div>

        <!-- Add Expense Inline Form -->
        <form
          class="grid grid-cols-1 sm:grid-cols-12 gap-2.5 mb-6 bg-canvas p-3 rounded-xl border border-line"
          @submit.prevent="handleSubmit"
        >
          <input
            v-model="title"
            type="text"
            placeholder="Item (e.g. Hotpot Bill, Taxi)"
            class="sm:col-span-5 bg-card border border-line rounded-xl px-3 py-2 text-xs text-text-primary placeholder-text-muted/50 focus:outline-none focus:ring-1 focus:ring-sky-end"
            required
          />
          <input
            v-model="amount"
            type="number"
            step="0.01"
            placeholder="$ Amount"
            class="sm:col-span-3 bg-card border border-line rounded-xl px-3 py-2 text-xs text-text-primary placeholder-text-muted/50 focus:outline-none focus:ring-1 focus:ring-sky-end"
            required
          />
          <select
            v-model="paidBy"
            class="sm:col-span-2 bg-card border border-line rounded-xl px-2 py-2 text-xs text-text-primary focus:outline-none"
          >
            <option v-for="p in participants.slice(0, 5)" :key="p.id" :value="p.id">
              {{ p.emoji }} {{ p.name }}
            </option>
          </select>
          <button
            type="submit"
            class="sm:col-span-2 bg-sky-gradient text-canvas font-bold text-xs rounded-xl py-2 transition-all hover:opacity-95 active:scale-98 shadow-sm cursor-pointer"
          >
            + Add Bill
          </button>
        </form>

        <!-- Expense Items List -->
        <div class="space-y-2.5">
          <div
            v-for="exp in room.expenses"
            :key="exp.id"
            class="flex items-center justify-between p-3.5 rounded-xl bg-canvas border border-line"
          >
            <div class="flex items-center gap-3">
              <div
                class="w-9 h-9 rounded-xl bg-card border border-line flex items-center justify-center text-base"
              >
                {{ participants.find(p => p.id === exp.paidBy)?.emoji || '👤' }}
              </div>
              <div>
                <div class="text-sm font-bold text-text-primary">{{ exp.title }}</div>
                <div class="text-xs text-text-muted">
                  Paid by
                  <span class="text-sky-soft font-medium">
                    {{ participants.find(p => p.id === exp.paidBy)?.name || 'Member' }}
                  </span>
                  • Split equally ({{ exp.splitAmong.length }} ways)
                </div>
              </div>
            </div>
            <div class="text-base font-extrabold text-text-primary font-mono">
              ${{ exp.amount.toFixed(2) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Column: Smart Minimum Transfers & QR Code Settler -->
    <div class="lg:col-span-5">
      <div class="bg-card border border-line rounded-[16px] p-5 sm:p-6">
        <div class="flex items-center justify-between mb-4">
          <div>
            <span class="text-[11px] font-bold uppercase tracking-wider text-sky-soft font-mono">
              Smart Debt Simplifier
            </span>
            <h3 class="text-lg font-bold text-text-primary">Who Pays Whom</h3>
          </div>
          <div class="text-right">
            <span class="text-[11px] text-text-muted font-mono">Each Person’s Share</span>
            <div class="text-sm font-bold text-text-primary font-mono">
              ~${{ splitCalculations.perPersonShare.toFixed(2) }} / person
            </div>
          </div>
        </div>

        <div class="space-y-3">
          <div
            v-if="splitCalculations.transfers.length === 0"
            class="text-center py-8 text-xs text-text-muted"
          >
            Everyone is completely settled up!
          </div>

          <div
            v-for="t in splitCalculations.transfers"
            :key="t.key"
            class="p-4 rounded-xl border transition-all"
            :class="[
              settledKeys[t.key]
                ? 'bg-canvas border-emerald/50 opacity-80'
                : 'bg-canvas border-line',
            ]"
          >
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-2 text-xs">
                <span class="text-base">{{ t.from.emoji }}</span>
                <span class="font-bold text-text-primary">{{ t.from.name }}</span>
                <ArrowRight class="w-3.5 h-3.5 text-text-muted" />
                <span class="text-base">{{ t.to.emoji }}</span>
                <span class="font-bold text-sky-soft">{{ t.to.name }}</span>
              </div>
              <span class="text-sm font-black font-mono text-emerald">
                ${{ t.amount.toFixed(2) }}
              </span>
            </div>

            <div class="flex items-center gap-2">
              <button
                type="button"
                class="flex-1 py-1.5 px-3 rounded-xl bg-card hover:bg-line text-text-primary font-semibold text-xs flex items-center justify-center gap-1.5 border border-line cursor-pointer transition-colors"
                @click="emit('openQr', t)"
              >
                <QrCode class="w-3.5 h-3.5 text-sky-soft" />
                <span>Scan QR to Pay</span>
              </button>

              <button
                type="button"
                class="px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1 cursor-pointer"
                :class="[
                  settledKeys[t.key]
                    ? 'bg-canvas border-emerald text-emerald'
                    : 'bg-card border-line text-text-muted hover:text-text-primary',
                ]"
                @click="emit('toggleSettled', t.key)"
              >
                <Check class="w-3.5 h-3.5" />
                <span>{{ settledKeys[t.key] ? 'Paid' : 'Mark Paid' }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
