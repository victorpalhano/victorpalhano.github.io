const form = document.getElementById('pdf-form');
const progressBar = document.getElementById('progress-bar');
const progressContainer = document.getElementById('progress-container');
const downloadContainer = document.getElementById('download-container');
const orientationContainer = document.getElementById('orientation-container');

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  console.log('Formulário enviado!');

  const pdfFiles = document.getElementById('pdf-files').files;
  const formData = new FormData();
  for (let i = 0; i < pdfFiles.length; i++) {
    formData.append('pdfFiles', pdfFiles[i]);
  }

  const response = await fetch('/merge-pdf', {
    method: 'POST',
    body: formData,
    onUploadProgress: (progressEvent) => {
      const progress = (progressEvent.loaded / progressEvent.total) * 100;
      progressBar.style.width = `${progress}%`;
    },
  });

  if (response.ok) {
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = 'arquivo_comprimido.pdf';
    link.textContent = 'Download arquivo comprimido';
    downloadContainer.innerHTML = '';
    downloadContainer.appendChild(link);

    const orientations = await getOrientations(pdfFiles);
    orientationContainer.innerHTML = '';
    for (let i = 0; i < orientations.length; i++) {
      const orientation = document.createElement('div');
      orientation.textContent = `Página ${i + 1}: ${orientations[i]}`;
      orientationContainer.appendChild(orientation);
    }

    progressContainer.style.display = 'none';
  } else {
    console.error('Erro ao mesclar PDFs');
  }
});

async function getOrientations(pdfFiles) {
  const orientations = [];

  for (let i = 0; i < pdfFiles.length; i++) {
    const pdfFile = pdfFiles[i];
    const pdfBytes = await pdfFile.arrayBuffer();
    const pdf = await PDFDocument.load(pdfBytes);
    for (let j = 0; j < pdf.getPageCount(); j++) {
      const page = await pdf.getPage(j);
      const orientation = page.getOrientation().toString();
      orientations.push(orientation);
    }
  }

  return orientations;
}