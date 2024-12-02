const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const os = require("os");

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(express.json());

app.post("/convert", upload.single("file"), (req, res) => {
  try {
    const wordFilePath = req.file.path; // Ruta temporal del archivo subido
    const originalFileName = req.file.originalname;
    const fileNameWithoutExt = path.basename(
      originalFileName,
      path.extname(originalFileName)
    );
    const sistemaOperativo = os.platform();
    const outputDir = "uploads";

    let comando = "";
    if (sistemaOperativo === "win32") {
      comando = `"C:\\Program Files\\LibreOffice\\program\\soffice.exe" --headless --convert-to pdf "${wordFilePath}" --outdir ${outputDir}`;
    } else if (sistemaOperativo === "linux") {
      comando = `libreoffice --headless --convert-to pdf "${wordFilePath}" --outdir ${outputDir}`;
    } else {
      return res.status(500).json({ error: "Sistema operativo no soportado." });
    }

    console.log("Ejecutando comando:", comando);

    exec(comando, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error ejecutando el comando: ${error.message}`);
        return res.status(500).json({ error: "Error al convertir el archivo" });
      }
      if (stderr) {
        console.error(`stderr: ${stderr}`);
        return res.status(500).json({ error: stderr });
      }

      console.log("Archivo convertido correctamente.");

      // Buscar el archivo PDF generado
      console.log(path.join(`${wordFilePath}.pdf`),'aca')
      const outputPdfPath = path.join(`${wordFilePath}.pdf`);
      if (!fs.existsSync(outputPdfPath)) {
        console.error("El archivo convertido no existe:", outputPdfPath);
        return res
          .status(500)
          .json({ error: "El archivo convertido no se encontró" });
      }

      // Enviar el archivo PDF como respuesta
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=${fileNameWithoutExt}.pdf`
      );
      res.sendFile(path.resolve(outputPdfPath), (err) => {
        if (err) {
          console.error("Error al enviar el archivo PDF:", err.message);
          return res
            .status(500)
            .json({ error: "Error al enviar el archivo PDF" });
        }
        console.log("Archivo enviado correctamente.");
        fs.unlinkSync(wordFilePath);
        fs.unlinkSync(outputPdfPath);
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al procesar el archivo" });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
