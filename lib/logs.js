/*
 * Library to storing and rotating logs
 */

// Dependencies
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Container for the module
const lib = {};

// Base directory of the data folder
lib.baseDir = path.join(__dirname, '/../.logs/');

// Append a string to a file. Create a file if it does not exist.
lib.append = (file, string, callback) => {
  // Open the file for appending
  fs.open(lib.baseDir + file + '.log', 'a', (err, fileDescriptor) => {
    if (!err && fileDescriptor) {
      // Append to the file and close it
      fs.appendFile(fileDescriptor, string + '\n', (err) => {
        if (!err) {
          fs.close(fileDescriptor, (errr) => {
            if (!err) {
              callback(false);
            } else {
              callback('Error closing file that was being appended');
            }
          });
        } else {
          callback('Error appending to file');
        }
      });
    } else {
      callback('Could not open file for appending');
    }
  });
};

// List all the logs and optionally include the compressed logs
lib.list = (includeCompressedLogs, callback) => {
  fs.readdir(lib.baseDir, (err, data) => {
    if (!err && data && data.length > 0) {
      const trimmedFileNames = [];
      data.forEach((i) => {
        // Add the .log files
        if (i.indexOf('.log') > -1) {
          trimmedFileNames.push(i.replace('.log', ''));
        }

        // Optionally add on the .gz files
        if (i.indexOf('.gz.b64') > -1 && includeCompressedLogs) {
          trimmedFileNames.push(i.replace('.gz.b64', ''));
        }
      });
      callback(false, trimmedFileNames);
    } else {
      callback(err, data);
    }
  });
};

// Compress the contents of one .log file into a .gz.b64 file within the same directory
lib.compress = (logId, newFileId, callback) => {
  const sourceFile = logId + '.log';
  const destinationFile = newFileId + '.gz.b64';

  // Read the sourceFile
  fs.readFile(lib.baseDir + sourceFile, 'utf-8', (err, inputString) => {
    if (!err && inputString) {
      // Compress the data using gzip (the buffer will contain the compressed data)
      zlib.gzip(inputString, (err, buffer) => {
        if (!err && buffer) {
          // Send the compressed data to the destination file
          fs.open(
            lib.baseDir + destinationFile,
            'wx',
            (err, fileDescriptor) => {
              if (!err && fileDescriptor) {
                // Write to the destination file
                fs.writeFile(
                  fileDescriptor,
                  buffer.toString('base64'),
                  (err) => {
                    if (!err) {
                      // Close the destination file
                      fs.close(fileDescriptor, (err) => {
                        if (!err) {
                          callback(false);
                        } else {
                          callback(err);
                        }
                      });
                    } else {
                      callback(err);
                    }
                  }
                );
              } else {
                callback(err);
              }
            }
          );
        } else {
          callback(err);
        }
      });
    } else {
      callback(err);
    }
  });
};

// Decompress the contents of a .gz.b64 file into a string variable
lib.decompress = (fileId, callback) => {
  const fileName = fileId + '.gz.b64';
  fs.readFile(lib.baseDir + fileName, 'utf-8', (err, string) => {
    if (!err && string) {
      // Decompress the data (now we starting with the 'base64' encoded string)
      const inputBuffer = Buffer.from(string, 'base64');
      zlib.unzip(inputBuffer, (err, outputBuffer) => {
        if (!err && outputBuffer) {
          // Callback
          const string = outputBuffer.toString();
          callback(false, string);
        } else {
          callback(err);
        }
      });
    } else {
      callback(err);
    }
  });
};

// Truncating a log file
lib.truncate = (logId, callback) => {
  fs.truncate(lib.baseDir + logId + '.log', 0, (err) => {
    if (!err) {
      callback(false);
    } else {
      callback(err);
    }
  });
};

// Export the module
module.exports = lib;
