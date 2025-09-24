import { defineStore } from 'pinia'

export interface Account {
  id: string
  labels: { text: string }[]
  type: 'LDAP' | 'Local'
  login: string
  password: string | null
}

interface State {
  accounts: Account[]
  nextId: number
}

export const useAccountsStore = defineStore('accounts', {
  state: (): State => ({
    accounts: [],
    nextId: 1
  }),
  actions: {
    loadFromStorage() {
      const data = localStorage.getItem('accounts')
      if (data) {
        const parsed = JSON.parse(data)
        this.accounts = parsed.accounts || []
        this.nextId = parsed.nextId || 1
      }
    },
    saveToStorage() {
      localStorage.setItem('accounts', JSON.stringify({
        accounts: this.accounts,
        nextId: this.nextId
      }))
    },
    addAccount(): string {
      const id = this.nextId.toString()
      this.accounts.push({
        id,
        labels: [],
        type: 'LDAP',
        login: '',
        password: null
      })
      this.nextId++
      this.saveToStorage()
      return id
    },
    removeAccount(id: string) {
      this.accounts = this.accounts.filter(a => a.id !== id)
      this.saveToStorage()
    },
    updateAccount(account: Account) {
      const index = this.accounts.findIndex(a => a.id === account.id)
      if (index !== -1) {
        this.accounts[index] = { ...account }
        this.saveToStorage()
      }
    }
  }
})
