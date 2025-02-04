document.getElementById('uploadForm').addEventListener('submit', async function (event) {
    event.preventDefault();
    
    const fileInput = document.getElementById('fileInput');
    if (fileInput.files.length === 0) {
        alert('Please select a file to upload.');
        return;
    }

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);

    await fetch('/upload', {
        method: 'POST',
        body: formData
    });

    fileInput.value = ''; // clear input
    loadFileList();
});

async function loadFileList() {
    const response = await fetch('/');
    const html = await response.text();
    
    const files = html.match(/href="\/uploads\/(.*?)"/g);
    const fileList = document.getElementById('fileList');
    fileList.innerHTML = '';

    if (files) {
        files.forEach(file => {
            const filename = file.match(/\/uploads\/(.*?)"/)[1];
            const listItem = document.createElement('li');
            listItem.innerHTML = `<a href="/uploads/${filename}" download>${filename}</a>`;
            fileList.appendChild(listItem);
        });
    }
}

window.onload = loadFileList;
