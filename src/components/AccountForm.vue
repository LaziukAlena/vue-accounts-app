<template>
  <el-form :model="account" label-width="80px" class="account-form">
    <el-form-item label="Метки">
      <el-input
        v-model="labelsString"
        placeholder="Введите метки через ;"
        @blur="onLabelsBlur"
      />
    </el-form-item>

    <el-form-item label="Тип записи">
      <el-select v-model="account.type" placeholder="Выберите тип">
        <el-option label="LDAP" value="LDAP" />
        <el-option label="Локальная" value="Local" />
      </el-select>
    </el-form-item>

    <el-form-item label="Логин">
      <el-input v-model="account.login" placeholder="Логин" />
    </el-form-item>

    <el-form-item label="Пароль" v-if="account.type === 'Local'">
      <el-input
        v-model="account.password"
        type="password"
        placeholder="Пароль"
      />
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ account: any }>()
const emit = defineEmits(['update'])

const labelsString = computed({
  get: () => props.account.labels.map((l: any) => l.text).join(';'),
  set: (value: string) => {
    props.account.labels = value
      .split(';')
      .map((t: string) => ({ text: t.trim() }))
      .filter((t: any) => t.text.length > 0)
    emit('update', props.account)
  }
})

function onLabelsBlur() {
  emit('update', props.account)
}
</script>

<style scoped>
.account-form {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
</style>
