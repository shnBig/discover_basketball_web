<template>
  <div
    class="min-h-screen bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 flex flex-col"
  >
    <div class="layout-container flex h-full grow flex-col">
      <!-- 顶部导航栏 -->
      <header
        class="flex items-center justify-between border-b border-solid border-slate-200 dark:border-slate-800 px-10 py-3 bg-white dark:bg-slate-900"
      >
        <!--  -->
        <div class="flex items-center gap-4">
          <!-- 展示logo -->
          <img src="/logo.png" alt="logo" class="size-10 rounded-full" />
          <h2
            class="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight -translate-y-[-3px]"
          >
            校园二手电子设备平台后台管理系统
          </h2>
        </div>
        <a-button
          class="bg-primary text-white border-none hover:bg-primary/90 h-10 px-4 font-bold rounded-lg"
          @click="()=>{
            message.info('连个登录都不会吗')
          }"
        >
          帮助
        </a-button>
      </header>

      <!-- 主要内容 -->
      <main class="flex-1 flex items-center justify-center p-6">
        <div
          class="w-full max-w-[480px] bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-8"
        >
          <!-- Header -->
          <div class="text-center mb-8">
            <h1
              class="text-slate-900 dark:text-slate-100 text-[32px] font-bold leading-tight"
            >
              欢迎回来
            </h1>
            <p class="text-slate-600 dark:text-slate-400 text-base mt-2">
              请输入您的详细信息以登录
            </p>
          </div>

          <!-- Ant Design Vue 表单 -->
          <a-form
            :model="formState"
            layout="vertical"
            @finish="handleLogin"
            class="space-y-4"
          >
            <!-- 用户名 -->
            <a-form-item
              label="用户名"
              name="username"
              :rules="[{ required: true, message: '请输入您的用户名!' }]"
            >
              <a-input
                v-model:value="formState.username"
                placeholder="请输入您的用户名"
                class="h-12 rounded-lg"
              />
            </a-form-item>

            <!-- 密码 -->
            <a-form-item
              label="密码"
              name="password"
              :rules="[{ required: true, message: '请输入您的密码!' }]"
            >
              <a-input-password
                v-model:value="formState.password"
                placeholder="请输入您的密码"
                class="h-12 rounded-lg"
              />
            </a-form-item>

            <!-- 记住我 & 忘记密码 -->
            <div class="flex items-center justify-between">
              <a-checkbox v-model:checked="formState.remember">
                <span class="text-slate-600 dark:text-slate-400 text-sm"
                  >记住我</span
                >
              </a-checkbox>
              <a
                class="text-sm font-medium text-primary hover:underline"
                href="#"
                @click="()=>{
                  message.info('请联系管理员')
                }"
                >忘记密码？</a
              >
            </div>

            <!-- 登录按钮 -->
            <a-form-item class="mb-0">
              <a-button
                type="primary"
                html-type="submit"
                block
                :loading="loading"
                class="h-12 bg-primary border-none text-base font-bold rounded-lg shadow-sm"
              >
                登录
              </a-button>
            </a-form-item>
          </a-form>
        </div>
      </main>

      <!-- 页脚 -->
      <footer
        class="py-6 px-10 text-center text-slate-400 dark:text-slate-600 text-xs flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4"
      >
        <!-- 版权信息 -->
        <span>© 2026 福尔摩斯蓝团队. 版权所有.</span>

        <!-- 分隔符（仅在宽屏显示） -->
        <span class="hidden sm:inline text-slate-200 dark:text-slate-800"
          >|</span
        >

        <!-- ICP 备案号链接 -->
        <a
          href="https://beian.miit.gov.cn/"
          target="_blank"
          rel="noopener noreferrer"
          class="hover:text-primary transition-colors flex items-center gap-1"
        >
          <!-- 如果有公安联网备案图标，可以放在这里 -->
          <span>京ICP备2026003110号-1</span>
        </a>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { message } from "ant-design-vue";
import { useUserStore } from "@/store/user";
import { useRouter, useRoute } from "vue-router";
import { loadDynamicRoutes } from "@/router";
const router = useRouter();
const userStore = useUserStore();
const loading = ref(false);

const formState = ref({
  username: "",
  password: "",
  remember: false,
});
const handleLogin = async () => {
  try {
    loading.value = true;
    await userStore.login(formState.value);
    const menus = await userStore.getMenuList();
    loadDynamicRoutes(menus);
    if (formState.value.remember) {
      localStorage.setItem('remembered', JSON.stringify(formState.value));
    } else {
      localStorage.removeItem('remembered');
    }
    message.success("登录成功");
    router.push({ path: "home" });
  } catch (error) {
    console.log("登录失败:", error);
  } finally {
    loading.value = false;
  }
};
onMounted(()=>{
  //读取本地的用户信息
  const remembered = JSON.parse(localStorage.getItem('remembered')) || {};
  if(remembered.remember){
    //如果有记住的用户名，填充到用户名输入框
    formState.value.username = remembered.username;
    formState.value.password = remembered.password;
    formState.value.remember = remembered.remember;
  }
  
})
</script>

<style lang="postcss" scoped>
/* 1. 基础标签颜色（浅色模式） */
:deep(.ant-form-item-label > label) {
  @apply text-slate-900 font-medium;
}

/* 2. 暗色模式下的标签颜色 */
.dark :deep(.ant-form-item-label > label) {
  @apply text-slate-100;
}

/* 3. 暗色模式下的输入框样式 */
.dark :deep(.ant-input),
.dark :deep(.ant-input-affix-wrapper) {
  /* 注意：这里去掉了 dark: 前缀，因为父级已经有 .dark 了 */
  @apply bg-background-dark border-slate-700 text-slate-100;
}

/* 4. 暗色模式下的占位符颜色 */
.dark :deep(.ant-input::placeholder) {
  @apply text-slate-500;
}

/* 5. 覆盖 Checkbox 颜色（使用你配置的 primary） */
:deep(.ant-checkbox-checked .ant-checkbox-inner) {
  /* 这里直接使用 primary 和 border-primary，因为你 config 里配了 */
  @apply bg-primary border-primary;
}

/* 6. 修正 Input 聚焦时的边框（AntD 默认是蓝色，如果你想强制用你的 primary） */
:deep(.ant-input:focus),
:deep(.ant-input-focused),
:deep(.ant-input-affix-wrapper-focused) {
  @apply border-primary ring-1 ring-primary !important;
}
</style>