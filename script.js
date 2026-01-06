// 简单的前端逻辑：点击“导入”触发隐藏的 file input，选中文件后显示文件名
document.addEventListener('DOMContentLoaded', function () {
  // 绑定导入按钮
  document.querySelectorAll('.btn-import').forEach(function(btn){
    btn.addEventListener('click', function(){
      const targetId = btn.getAttribute('data-target');
      const input = document.getElementById(targetId);
      if(input) input.click();
    });
  });

  // 当文件变更时展示文件名
  function bindFile(inputId, displayId){
    const input = document.getElementById(inputId);
    const display = document.getElementById(displayId);
    if(!input || !display) return;
    input.addEventListener('change', function(){
      if(input.files && input.files.length > 0){
        display.value = input.files[0].name;
        display.classList.remove('invalid');
      } else {
        display.value = '';
      }
    });
  }

  bindFile('ipaInput','ipaFilename');
  bindFile('p12Input','p12Filename');
  bindFile('mobileInput','mobileFilename');

  // 表单提交（示例：前端验证 + 模拟上传）
  const form = document.getElementById('signForm');
  const message = document.getElementById('message');

  form.addEventListener('submit', function(e){
    e.preventDefault();
    message.textContent = '';

    // 基本验证
    const ipa = document.getElementById('ipaInput').files[0];
    const p12 = document.getElementById('p12Input').files[0];
    const mobile = document.getElementById('mobileInput').files[0];
    const p12Pwd = document.getElementById('p12Password').value.trim();

    if(!ipa){
      message.style.color = '#d43c3c';
      message.textContent = '请导入 IPA 文件';
      return;
    }
    if(!p12){
      message.style.color = '#d43c3c';
      message.textContent = '请导入 P12 证书';
      return;
    }
    if(!p12Pwd){
      message.style.color = '#d43c3c';
      message.textContent = '请输入 P12 密码';
      return;
    }
    if(!mobile){
      message.style.color = '#d43c3c';
      message.textContent = '请导入 mobileprovision 文件';
      return;
    }

    // 演示上传：将文件和其它字段打包成 FormData，并发送到你的后端签名接口（请替换下面的 URL）
    message.style.color = '#2b7a2b';
    message.textContent = '正在上传并开始签名，请稍候...';

    const fd = new FormData();
    fd.append('ipa', ipa);
    fd.append('p12', p12);
    fd.append('mobileprovision', mobile);
    fd.append('p12password', p12Pwd);
    fd.append('bundleId', document.getElementById('bundleId').value || '');
    fd.append('appName', document.getElementById('appName').value || '');

    // TODO: 把 /api/sign 替换为你自己的签名服务端点
    fetch('/api/sign', {
      method: 'POST',
      body: fd
    }).then(resp => {
      if(!resp.ok) throw new Error('网络错误');
      return resp.json();
    }).then(data => {
      // 假设后端返回 { success: true, downloadUrl: "..." }
      if(data && data.success){
        message.style.color = '#2b7a2b';
        message.innerHTML = '签名完成：<a href="' + (data.downloadUrl || '#') + '">点击下载</a>';
      } else {
        throw new Error(data.message || '签名失败');
      }
    }).catch(err => {
      message.style.color = '#d43c3c';
      message.textContent = '出错：' + err.message;
    });
  });
});