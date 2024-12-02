const { exec } = require('child_process');
const path = require('path');
const os = require('os');

function convertirWordAPdf(rutaArchivo) {
    // Detecta el sistema operativo
    const sistemaOperativo = os.platform();

    let comando = '';
    
    if (sistemaOperativo === 'win32') {
        comando = `"C:\\Program Files\\LibreOffice\\program\\soffice.exe" --headless --convert-to pdf "${rutaArchivo}"`;
    } else if (sistemaOperativo === 'linux') {
        comando = `libreoffice --headless --convert-to pdf "${rutaArchivo}"`;
    } else {
        console.log('Sistema operativo no soportado.');
        return;
    }

    exec(comando, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error ejecutando el comando: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`stderr: ${stderr}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
        console.log('Archivo convertido a PDF exitosamente.');
    });
}

const archivoWord = './actividad.docx'; // Reemplaza con la ruta del archivo a convertir
convertirWordAPdf(archivoWord);
