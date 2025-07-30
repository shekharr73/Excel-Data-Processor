const fileInput = document.getElementById('file-input');
const fileInfo = document.getElementById('file-info');
const processBtn = document.getElementById('process-btn');
const fileUploadArea = document.getElementById('file-upload-area');
const browseBtn = document.getElementById('browse-btn');
const uploadForm = document.getElementById('upload-form');

fileInput.addEventListener('change', handleFileSelect);

fileUploadArea.addEventListener('dragover', handleDragOver);
fileUploadArea.addEventListener('dragleave', handleDragLeave);
fileUploadArea.addEventListener('drop', handleDrop);

browseBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  fileInput.click();
});

fileUploadArea.addEventListener('click', (e) => {
  if (e.target === fileUploadArea || e.target.classList.contains('upload-icon') || e.target.closest('.upload-icon')) {
    fileInput.click();
  }
});

uploadForm.addEventListener('submit', handleFormSubmit);

function handleFileSelect() {
  if (fileInput.files.length) {
    const file = fileInput.files[0];
    displayFileInfo(file);
    processBtn.disabled = false;
  } else {
    hideFileInfo();
    processBtn.disabled = true;
  }
}

function handleDragOver(e) {
  e.preventDefault();
  fileUploadArea.classList.add('dragover');
}

function handleDragLeave(e) {
  e.preventDefault();
  fileUploadArea.classList.remove('dragover');
}

function handleDrop(e) {
  e.preventDefault();
  fileUploadArea.classList.remove('dragover');
  
  const files = e.dataTransfer.files;
  if (files.length) {
    fileInput.files = files;
    handleFileSelect();
  }
}

function displayFileInfo(file) {
  const fileName = document.getElementById('file-name');
  const fileSize = document.getElementById('file-size');
  
  fileName.textContent = file.name;
  fileSize.textContent = formatFileSize(file.size);
  
  fileInfo.style.display = 'block';
  fileUploadArea.style.display = 'none';
}

function hideFileInfo() {
  fileInfo.style.display = 'none';
  fileUploadArea.style.display = 'block';
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function removeFile() {
  fileInput.value = '';
  hideFileInfo();
  processBtn.disabled = true;
}

async function handleFormSubmit(e) {
  e.preventDefault();
  
  if (!fileInput.files.length) {
    showNotification('Please select a file first', 'error');
    return;
  }

  const formData = new FormData();
  formData.append('file', fileInput.files[0]);
  
  showProcessingSection();
  
  try {
    const response = await fetch('/upload', { 
      method: 'POST', 
      body: formData 
    });
    
    const data = await response.json();
    
    if (data.success) {
      await simulateProgressSteps();
      
      showDownloadSection(data);
      showNotification('File processed successfully!', 'success');
    } else {
      hideProcessingSection();
      showNotification('Error: ' + data.error, 'error');
    }
  } catch (err) {
    hideProcessingSection();
    showNotification('Network error: ' + err.message, 'error');
  }
}

function showProcessingSection() {
  document.getElementById('processing').style.display = 'block';
  document.getElementById('upload-form').style.display = 'none';
}

function hideProcessingSection() {
  document.getElementById('processing').style.display = 'none';
  document.getElementById('upload-form').style.display = 'block';
}

async function simulateProgressSteps() {
  const steps = ['step-2', 'step-3', 'step-4'];
  
  for (let i = 0; i < steps.length; i++) {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const currentStep = document.getElementById(steps[i]);
    const prevStep = i > 0 ? document.getElementById(steps[i-1]) : document.querySelector('.step.active');
    
    if (prevStep) {
      prevStep.classList.remove('active');
      prevStep.classList.add('completed');
      prevStep.querySelector('i').className = 'bi bi-check-circle-fill';
    }
    
    currentStep.classList.add('active');
  }
  
  const lastStep = document.getElementById('step-4');
  lastStep.classList.remove('active');
  lastStep.classList.add('completed');
  lastStep.querySelector('i').className = 'bi bi-check-circle-fill';
}

function showDownloadSection(data) {
  hideProcessingSection();
  
  const downloadLink = document.getElementById('download-link');
  downloadLink.href = data.download_url;
  downloadLink.download = data.filename;
  
  document.getElementById('download-section').style.display = 'block';
}

function resetForm() {
  fileInput.value = '';
  hideFileInfo();
  processBtn.disabled = true;
  document.getElementById('download-section').style.display = 'none';
  document.getElementById('upload-form').style.display = 'block';
  
  const steps = document.querySelectorAll('.step');
  steps.forEach((step, index) => {
    step.classList.remove('active', 'completed');
    const icon = step.querySelector('i');
    if (index === 0) {
      step.classList.add('active');
      icon.className = 'bi bi-check-circle-fill';
    } else {
      icon.className = 'bi bi-circle';
    }
  });
}

function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <i class="bi bi-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
      <span>${message}</span>
      <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
        <i class="bi bi-x"></i>
      </button>
    </div>
  `;
  
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'success' ? '#48bb78' : type === 'error' ? '#f56565' : '#4299e1'};
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 10px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    z-index: 1000;
    animation: slideInRight 0.3s ease-out;
    max-width: 400px;
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    if (notification.parentElement) {
      notification.style.animation = 'slideOutRight 0.3s ease-out';
      setTimeout(() => notification.remove(), 300);
    }
  }, 5000);
}

const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOutRight {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
  
  .notification-content {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  
  .notification-close {
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    padding: 0;
    margin-left: auto;
  }
  
  .notification-close:hover {
    opacity: 0.8;
  }
`;
document.head.appendChild(style);

function setButtonLoading(button, loading) {
  if (loading) {
    button.disabled = true;
    button.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Processing...';
  } else {
    button.disabled = false;
    button.innerHTML = '<i class="bi bi-gear-wide-connected"></i> Process Data';
  }
}

window.addEventListener('error', (e) => {
  console.error('JavaScript error:', e.error);
  showNotification('An unexpected error occurred. Please try again.', 'error');
});

document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
    e.preventDefault();
    fileInput.click();
  }
  
  if (e.key === 'Escape') {
    resetForm();
  }
});

function validateFile(file) {
  const allowedTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel'
  ];
  
  const maxSize = 10 * 1024 * 1024;
  
  if (!allowedTypes.includes(file.type)) {
    showNotification('Please select a valid Excel file (.xlsx or .xls)', 'error');
    return false;
  }
  
  if (file.size > maxSize) {
    showNotification('File size must be less than 10MB', 'error');
    return false;
  }
  
  return true;
}

const originalHandleFileSelect = handleFileSelect;
handleFileSelect = function() {
  if (fileInput.files.length) {
    const file = fileInput.files[0];
    if (validateFile(file)) {
      displayFileInfo(file);
      processBtn.disabled = false;
    } else {
      removeFile();
    }
  } else {
    hideFileInfo();
    processBtn.disabled = true;
  }
};
