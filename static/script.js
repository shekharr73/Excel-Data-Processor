const fileInput = document.getElementById('file-input');
const fileInfo = document.getElementById('file-info');
const selectedFile = document.getElementById('selected-file');
const processBtn = document.getElementById('process-btn');
const uploadArea = document.getElementById('upload-area');
const uploadForm = document.getElementById('upload-form');
const processingSection = document.getElementById('processing-section');
const downloadSection = document.getElementById('download-section');

uploadArea.addEventListener('dragover', e => {
  e.preventDefault(); uploadArea.classList.add('dragover');
});
uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('dragover'));
uploadArea.addEventListener('drop', e => {
  e.preventDefault(); uploadArea.classList.remove('dragover');
  if (e.dataTransfer.files.length > 0) {
    fileInput.files = e.dataTransfer.files;
    handleFileSelect();
  }
});
fileInput.addEventListener('change', handleFileSelect);

function handleFileSelect() {
  const file = fileInput.files[0];
  if (file) {
    selectedFile.textContent = file.name;
    fileInfo.style.display = 'block';
    processBtn.disabled = false;
  } else {
    fileInfo.style.display = 'none';
    processBtn.disabled = true;
  }
}

uploadForm.addEventListener('submit', async e => {
  e.preventDefault();
  if (!fileInput.files.length) return alert('Please select a file.');
  uploadForm.style.display = 'none';
  processingSection.style.display = 'block';
  const formData = new FormData();
  formData.append('file', fileInput.files[0]);
  try {
    const res = await fetch('/upload', { method: 'POST', body: formData });
    const data = await res.json();
    if (data.success) {
      document.getElementById('download-link').href = data.download_url;
      processingSection.style.display = 'none';
      downloadSection.style.display = 'block';
    } else {
      alert('Error: ' + data.error);
      resetForm();
    }
  } catch (err) {
    alert('Error: ' + err.message);
    resetForm();
  }
});

function resetForm() {
  uploadForm.reset();
  fileInfo.style.display = 'none';
  processBtn.disabled = true;
  uploadForm.style.display = 'block';
  processingSection.style.display = 'none';
  downloadSection.style.display = 'none';
}
