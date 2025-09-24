<template>
  <el-card class="accounts-list" shadow="hover">
    <div class="header">
      <h2>Учетные записи</h2>
      <el-button type="primary" :icon="Plus" @click="addAccount">Добавить</el-button>
    </div>

    <p class="hint">
      Для указания нескольких меток для одной пары «логин/пароль» используйте разделитель <code>;</code>
    </p>
    <el-divider />

    <el-row class="table-header" type="flex" gutter="16" align="middle">
      <el-col :span="6"><strong>Метка</strong></el-col>
      <el-col :span="4"><strong>Тип записи</strong></el-col>
      <el-col :span="6"><strong>Логин</strong></el-col>
      <el-col :span="6"><strong>Пароль</strong></el-col>
      <el-col :span="2"><strong>Действия</strong></el-col>
    </el-row>

    <template v-if="accounts.length">
      <el-row
        v-for="account in accounts"
        :key="account.id"
        class="account-row"
        gutter="16"
        type="flex"
        align="top"
      >
        <el-col :span="6">
          <el-input
            v-model="labelsString[account.id]"
            placeholder="до 50 символов, через ;"
            :class="{ invalid: fieldErrors[account.id]?.labels }"
            @blur="() => validateField(account)"
            clearable
          />
          <p v-if="fieldErrors[account.id]?.labels" class="error-text">
            Метка не должна превышать 50 символов.
          </p>
        </el-col>

        <el-col :span="4">
          <el-select
            v-model="account.type"
            placeholder="Выберите тип"
            :class="{ invalid: fieldErrors[account.id]?.type }"
            @change="() => validateField(account)"
          >
            <el-option label="LDAP" value="LDAP" />
            <el-option label="Локальная" value="Local" />
          </el-select>
          <p v-if="fieldErrors[account.id]?.type" class="error-text">
            Выберите корректный тип записи.
          </p>
        </el-col>

        <el-col :span="6">
          <el-input
            v-model="account.login"
            placeholder="обязательное, до 100 символов"
            :class="{ invalid: fieldErrors[account.id]?.login }"
            @blur="() => validateField(account)"
            clearable
          />
          <p v-if="fieldErrors[account.id]?.login" class="error-text">
            Логин обязателен и не должен превышать 100 символов.
          </p>
        </el-col>

        <el-col :span="6" v-if="account.type === 'Local'">
          <el-input
            :type="showPasswords[account.id] ? 'text' : 'password'"
            v-model="account.password"
            placeholder="обязательное, до 100 символов"
            :class="{ invalid: fieldErrors[account.id]?.password }"
            @blur="() => validateField(account)"
            clearable
          >
            <template #suffix>
              <el-button type="text" @click="togglePassword(account.id)">
                <el-icon>
                  <component :is="showPasswords[account.id] ? View : Hide" />
                </el-icon>
              </el-button>
            </template>
          </el-input>
          <p v-if="fieldErrors[account.id]?.password" class="error-text">
            Пароль обязателен и не должен превышать 100 символов.
          </p>
        </el-col>

        <el-col :span="6" v-else>
          <span class="disabled">—</span>
        </el-col>

        <el-col :span="2">
          <el-button
            type="danger"
            circle
            :icon="Delete"
            @click="onRemove(account.id)"
          />
        </el-col>
      </el-row>
    </template>

    <div v-else style="text-align: center; color: #999; padding: 20px;">
      Нет учетных записей
    </div>
  </el-card>
</template>

<script lang="ts">
import { defineComponent, reactive, watch, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useAccountsStore, Account } from '@/stores/accounts'
import { Plus, Delete, View, Hide } from '@element-plus/icons-vue'

export default defineComponent({
  name: 'AccountsList',
  components: { Plus, Delete, View, Hide },
  setup() {
    const store = useAccountsStore()
    const { accounts } = storeToRefs(store)

    const showPasswords = reactive<Record<string, boolean>>({})
    const labelsString = reactive<Record<string, string>>({})
    const fieldErrors = reactive<Record<string, { login: boolean; password: boolean; labels: boolean; type: boolean }>>({})

    const initAccount = (account: Account) => {
      const key = account.id
      if (!(key in labelsString)) labelsString[key] = account.labels.map(l => l.text).join(';')
      if (!(key in showPasswords)) showPasswords[key] = false
      if (!(key in fieldErrors)) fieldErrors[key] = { login: false, password: false, labels: false, type: false }
      validateField(account)
    }

    const validateField = (account: Account) => {
      const key = account.id
      fieldErrors[key] = {
        login: !account.login || account.login.trim() === '' || account.login.length > 100,
        password: account.type === 'Local' && (!account.password || account.password.trim() === '' || account.password.length > 100),
        labels: labelsString[key].split(';').some(l => l.trim().length > 50),
        type: !(account.type === 'LDAP' || account.type === 'Local')
      }

      const isValid = !fieldErrors[key].login && !fieldErrors[key].password && !fieldErrors[key].labels
      if (isValid) updateAccount(account)
    }

    const updateAccount = (account: Account) => {
      const key = account.id
      account.labels = labelsString[key]
        .split(';')
        .map(t => ({ text: t.trim() }))
        .filter(t => t.text.length > 0 && t.text.length <= 50)
      if (account.type === 'LDAP') account.password = null
      store.updateAccount(account)
    }

    const addAccount = () => {
      const newId = store.addAccount()
      const newAcc = store.accounts.find(a => a.id === newId)
      if (newAcc) {
        labelsString[newId] = ''
        showPasswords[newId] = false
        fieldErrors[newId] = { login: true, password: true, labels: false, type: false }
      }
    }

    const onRemove = (id: string) => {
      store.removeAccount(id)
      delete labelsString[id]
      delete showPasswords[id]
      delete fieldErrors[id]
    }

    const togglePassword = (id: string) => {
      showPasswords[id] = !showPasswords[id]
    }

    onMounted(() => {
      store.loadFromStorage()
      accounts.value.forEach(initAccount)
    })

    watch(accounts, (newVal) => {
      newVal.forEach(initAccount)
    }, { deep: true })

    return {
      accounts,
      labelsString,
      showPasswords,
      fieldErrors,
      addAccount,
      onRemove,
      togglePassword,
      validateField,
      updateAccount,
      Plus,
      Delete,
      View,
      Hide
    }
  }
})
</script>

<style scoped>
.accounts-list {
  max-width: 1000px;
  margin: 30px auto;
  padding: 20px;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.hint {
  font-size: 13px;
  color: #666;
  background-color: #f0fbff;
  padding: 8px 12px;
  border-radius: 6px;
  margin-bottom: 10px;
}
.table-header {
  margin-bottom: 8px;
  padding-bottom: 4px;
  border-bottom: 2px solid #ccc;
}
.account-row {
  margin-bottom: 16px;
}
.el-input.invalid,
.el-select.invalid {
  border-color: red;
}
.error-text {
  color: red;
  font-size: 12px;
  margin: 2px 0 0 0;
}
.disabled {
  color: #999;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 38px;
}
</style>




