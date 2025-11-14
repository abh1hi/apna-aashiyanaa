const Busboy = require('busboy');
const path = require('path');
const os = require('os');
const fs = require('fs');

const filesUploadMiddleware = (req, res, next) => {
    // Ensure it's a POST request and has multipart/form-data
    if (req.method !== 'POST' || !req.headers['content-type'] || !req.headers['content-type'].startsWith('multipart/form-data')) {
        return next(); // Not a multipart form, let other middleware handle it
    }

    const busboy = Busboy({ headers: req.headers });
    const fields = {};
    const uploads = []; // Use an array for multiple files

    // Note: os.tmpdir() points to an in-memory file system on GCF
    // Thus, any files in it must fit in the instance's memory.
    const tmpdir = os.tmpdir();

    busboy.on('field', (fieldname, val, info) => {
        fields[fieldname] = val;
    });

    busboy.on('file', (fieldname, file, info) => {
        const { filename, encoding, mimetype } = info;
        const filepath = path.join(tmpdir, filename);
        const writeStream = fs.createWriteStream(filepath);
        
        const upload = { fieldname, filepath, filename, originalname: filename, encoding, mimetype };
        uploads.push(upload);

        file.pipe(writeStream);

        writeStream.on('finish', () => {
            // File has been written to disk, now read it into a buffer
            fs.readFile(filepath, (err, buffer) => {
                if (err) {
                    console.error('Error reading temp file:', err);
                    return next(err);
                }
                upload.buffer = buffer;
                upload.size = buffer.length;
                // Optionally, delete the temporary file after reading into buffer
                fs.unlink(filepath, (unlinkErr) => {
                    if (unlinkErr) console.error('Error deleting temp file:', unlinkErr);
                });
            });
        });
        writeStream.on('error', (err) => {
            console.error('Error writing file stream:', err);
            next(err);
        });
    });

    busboy.on('finish', () => {
        req.body = fields;
        req.files = uploads; // Attach the array of uploaded files to req.files
        next();
    });

    busboy.on('error', (err) => {
        console.error('Busboy error:', err);
        next(err);
    });

    // Crucial for Firebase Cloud Functions: feed the raw body to busboy
    busboy.end(req.rawBody);
};

module.exports = filesUploadMiddleware;
