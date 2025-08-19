<template>
  <div class="user-info-container">
    <Card :title="'用户信息'" class="mb-4">
      <div class="flex items-center mb-6">
        <AvatarUploader
          :value="imageUrl"
          :loading="loading"
          :before-upload="beforeUpload"
          @change="handleChange"
        />
        <div class="ml-4">
          <p class="text-lg font-medium">{{ userInfo.realName || '未设置' }}</p>
          <p class="text-gray-500">{{ userInfo.loginName }}</p>
          <p class="text-gray-500">{{ userType === 1 ? '个人用户' : '企业用户' }}</p>
        </div>
      </div>

      <ProForm
        :model="userInfo"
        layout="horizontal"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 18 }"
      >
        <ProFormText
          label="姓名"
          name="realName"
          placeholder="请输入姓名"
          rules={[{ required: true, message: '用户姓名不能为空' }]}
        />
        <ProFormSelect
          label="性别"
          name="sex"
          :options="[{ label: '男', value: 1 }, { label: '女', value: 2 }]"
        />
        <ProFormText
          label="邮箱"
          name="email"
          placeholder="请输入邮箱"
          rules={[
            { required: true, message: '邮箱不能为空' },
            { type: 'email', message: '邮箱格式不正确' }
          ]}
        />
        <ProFormText
          label="手机号"
          name="mobile"
          placeholder="请输入手机号"
          :disabled="true"
        />
        <ProFormTextArea
          label="个性签名"
          name="sign"
          placeholder="请输入个性签名"
          :rows="4"
        />
        <ProFormText
          label="公司名称"
          name="companyName"
          placeholder="请输入公司名称"
          :disabled="userType === 1"
        />
      </ProForm>

      <div class="mt-6 flex justify-end">
        <Button type="primary" @click="saveUserInfo">保存</Button>
      </div>
    </Card>

    <Card :title="'账号安全'" class="mb-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-gray-50 p-4 rounded-md">
          <p class="font-medium mb-3">修改密码</p>
          <ProForm
            :model="passwordForm"
            layout="vertical"
            :submitter="false"
          >
            <ProFormPassword
              label="原密码"
              name="oldPassword"
              placeholder="请输入原密码"
              rules={[{ required: true, message: '原密码不能为空' }]}
            />
            <ProFormPassword
              label="新密码"
              name="newPassword"
              placeholder="请输入新密码"
              rules={[{ required: true, message: '新密码不能为空' }]}
            />
            <ProFormPassword
              label="确认密码"
              name="confirmPassword"
              placeholder="请输入确认密码"
              rules={[
                { required: true, message: '确认密码不能为空' },
                ({ confirmPassword, newPassword }) => ({
                  validator() {
                    if (confirmPassword !== newPassword) {
                      return new Error('两次输入密码不一致');
                    }
                    return true;
                  },
                }),
              ]}
            />
            <div class="flex justify-end mt-4">
              <Button type="primary" @click="saveUserPassword">修改密码</Button>
            </div>
          </ProForm>
        </div>

        <div class="bg-gray-50 p-4 rounded-md">
          <p class="font-medium mb-3">修改登录手机号</p>
          <ProForm
            :model="phoneForm"
            layout="vertical"
            :submitter="false"
          >
            <ProFormText
              label="新手机号"
              name="loginPhone"
              placeholder="请输入新手机号"
              rules={[
                { required: true, message: '手机号不能为空' },
                { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }
              ]}
            />
            <ProFormText
              label="验证码"
              name="vCode"
              placeholder="请输入验证码"
              rules={[{ required: true, message: '验证码不能为空' }]}
              addonAfter={
                <Button
                  type="link"
                  :disabled="isSendSms"
                  @click="sendSms"
                >
                  { codeContent }
                </Button>
              }
            />
            <div class="flex justify-end mt-4">
              <Button type="primary" @click="updateLoginPhone">修改手机号</Button>
            </div>
          </ProForm>
        </div>
      </div>
    </Card>

    <Card :title="'用户类型'" class="mb-4">
      <div class="flex items-center mb-4">
        <RadioGroup v-model:value="userType" @change="changeRoleData">
          <Radio :value="1">个人用户</Radio>
          <Radio :value="2">企业用户</Radio>
        </RadioGroup>
      </div>
      <Button @click="changeRole" type="primary">变更用户类型</Button>
    </Card>

    <Card :title="'其他操作'" class="mb-4">
      <Button danger @click="dimissionHandler">离职确认</Button>
    </Card>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { Card, Button, Avatar, ProForm, ProFormText, ProFormSelect, ProFormTextArea, ProFormPassword, RadioGroup, Radio } from 'ant-design-vue';
import { uploadFile, getUserInfo, save, savePwd, updateLoginPhone, sendUserCode, updateCompanyType, updateUserType, byebye } from '@/api/user';
import { message, Modal } from 'ant-design-vue';

const router = useRouter();
const store = useStore();

// 数据定义
const userInfo = reactive<Record<string, any>>({});
const imageUrl = ref('');
const loading = ref(false);
const userType = ref(1);
const realName = ref('');
const loginPhone = ref('');
const vCode = ref('');
const companyName = ref('');
const loadingRole = ref(false);
const updateUserTypeVisible = ref(false);
const isSendSms = ref(false);
const codeContent = ref('发送验证码');

// 表单数据
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
});

const phoneForm = reactive({
  loginPhone: '',
  vCode: ''
});

// 生命周期钩子
onMounted(() => {
  getUserInfoAction();
});

// 获取用户信息
const getUserInfoAction = async () => {
  try {
    const response = await getUserInfo();
    if (response.code === 200) {
      Object.assign(userInfo, response.data);
      userType.value = response.data.companyName ? 2 : 1;
      if (response.data.avatar) {
        imageUrl.value = response.data.avatar;
        loading.value = false;
        realName.value = response.data.realName;
      }
      phoneForm.loginPhone = response.data.mobile;
    }
  } catch (error) {
    message.error('获取用户信息失败');
  }
};

// 头像上传处理
const handleChange = (info: any) => {
  console.log(info);
  if (info.file.status === 'uploading') {
    loading.value = true;
    return;
  }
  if (info.file.status === 'done') {
    imageUrl.value = info.file.response.url;
    loading.value = false;
  }
};

// 上传前校验
const beforeUpload = (file: File) => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
  if (!isJpgOrPng) {
    message.error('只能选择图片!');
  }
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    message.error('图片不能超过2MB!');
  }
  return isJpgOrPng && isLt2M;
};

// 保存用户信息
const saveUserInfo = async () => {
  try {
    const sysUser = {
      avatar: imageUrl.value,
      sex: userInfo.sex,
      email: userInfo.email,
      sign: userInfo.sign,
      id: userInfo.userId,
      mobile: userInfo.mobile,
      realName: userInfo.realName
    };

    if (!sysUser.realName?.trim()) {
      message.error('用户姓名不能为空');
      return;
    }

    const emailTest = /^\w[-\w.+]*@([A-Za-z0-9][-A-Za-z0-9]+\.)+[A-Za-z]{2,14}/;
    if (!sysUser.email?.trim()) {
      message.error('邮箱不能为空');
      return;
    } else if (!emailTest.test(sysUser.email)) {
      message.error('邮箱格式不正确');
      return;
    }

    const response = await save(sysUser);
    if (response.code === 200) {
      store.commit('SET_AVATAR', imageUrl.value);
      message.success('保存成功');
      getUserInfoAction();
    } else {
      message.error(response.message);
    }
  } catch (error) {
    message.error('保存失败');
  }
};

// 保存用户密码
const saveUserPassword = async () => {
  try {
    const response = await savePwd(passwordForm);
    if (response.code === 200) {
      message.success('保存成功,请重新登录');
      setTimeout(() => {
        store.dispatch('Logout').then(() => {
          router.push({ path: 'login' });
        });
      }, 1000);
    } else {
      message.error(response.message);
    }
  } catch (error) {
    message.error('修改密码失败');
  }
};

// 修改登录手机号
const updateLoginPhone = async () => {
  try {
    const response = await updateLoginPhone({
      loginPhone: phoneForm.loginPhone,
      vCode: phoneForm.vCode
    });
    if (response.code === 200) {
      message.success('保存成功,请重新登录');
      setTimeout(() => {
        store.dispatch('Logout').then(() => {
          router.push({ path: 'login' });
        });
      }, 1000);
    } else {
      message.error(response.message);
    }
  } catch (error) {
    message.error('修改手机号失败');
  }
};

// 变更用户类型数据
const changeRoleData = (e: any) => {
  console.log(e);
  userType.value = e.target.value;
};

// 变更用户类型
const changeRole = () => {
  if (userInfo.companyName) {
    // 个人
    Modal.confirm({
      title: '确认',
      content: '<span style=\"color:red\">是否变更为个人用户？变更后，数据将不能恢复！</span>',
      onOk: async () => {
        loadingRole.value = true;
        try {
          const res = await updateCompanyType();
          if (res.code === 200) {
            loadingRole.value = false;
            message.success('变更成功请重新登录');
            setTimeout(() => {
              store.dispatch('Logout').then(() => {
                router.push({ path: '/user/login' });
              });
            }, 800);
          } else {
            loadingRole.value = false;
          }
        } catch (error) {
          loadingRole.value = false;
          message.error('变更失败');
        }
      },
      onCancel: () => {}
    });
  } else {
    // 企业
    updateUserTypeVisible.value = true;
  }
};

// 变更为公司用户
const updateUserType = async () => {
  updateUserTypeVisible.value = false;
  loadingRole.value = true;
  try {
    const response = await updateUserType({
      companyName: companyName.value
    });
    if (response.code === 200) {
      loadingRole.value = false;
      message.success('变更成功,请重新登录');
      setTimeout(() => {
        store.dispatch('Logout').then(() => {
          router.push({ path: '/user/login' });
        });
      }, 1000);
    } else {
      loadingRole.value = false;
    }
  } catch (error) {
    loadingRole.value = false;
    message.error('变更失败');
  }
};

// 发送短信验证码
const sendSms = async () => {
  if (!phoneForm.loginPhone || phoneForm.loginPhone.length !== 11) {
    message.error('请输入正确的手机号');
    return;
  }

  try {
    const response = await sendUserCode({
      userPhone: phoneForm.loginPhone
    });
    if (response.code === 200) {
      message.success('发送成功');
      let t = 60;
      isSendSms.value = true;
      const code = setInterval(() => {
        if (t === 0) {
          codeContent.value = '发送验证码';
          isSendSms.value = false;
          clearInterval(code);
          return;
        }
        codeContent.value = `获取验证码(${t--})`;
      }, 1000);
    } else {
      message.error(response.message);
    }
  } catch (error) {
    message.error('发送验证码失败');
  }
};

// 离职处理
const dimissionHandler = () => {
  Modal.confirm({
    title: '确认',
    content: '是否确认离职？',
    onOk: async () => {
      try {
        const res = await byebye({
          id: userInfo.id
        });
        if (res.code === 200) {
          message.success('离职成功');
          setTimeout(() => {
            store.dispatch('Logout').then(() => {
              router.push({ path: 'login' });
            });
          }, 800);
        }
      } catch (error) {
        message.error('离职申请失败');
      }
    },
    onCancel: () => {}
  });
};
</script>

<style lang="less">
@import '~@/style/purchase/voucher.less';

.user-info-container {
  .ant-card {
    margin-bottom: 16px;
  }

  .avatar-uploader {
    > .ant-upload {
      width: 110px;
      height: 110px;
    }
  }

  .ant-upload-select-picture-card {
    i {
      font-size: 32px;
      color: #999;
    }

    .ant-upload-text {
      margin-top: 8px;
      color: #666;
    }
  }

  .user-class {
    .ant-form-item {
      margin-bottom: 2px !important;
    }
  }
}
</style>