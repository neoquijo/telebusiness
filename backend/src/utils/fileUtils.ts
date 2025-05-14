import { Dirent, promises as fsPromises } from 'fs';
import { move } from 'fs-extra';
import { dirname, join } from 'path';

export class FileUtils {
  static async moveFile(
    sourcePath: string,
    destinationPath: string,
  ): Promise<void> {
    try {
      const destinationDir = dirname(destinationPath);
      try {
        await fsPromises.access(destinationDir);
      } catch {
        await fsPromises.mkdir(destinationDir, { recursive: true });
      }
      const fileContent = await fsPromises.readFile(sourcePath);
      await fsPromises.writeFile(destinationPath, fileContent);
      await fsPromises.unlink(sourcePath);
    } catch (error) {
      throw new Error(`Error moving file: ${error.message}`);
    }
  }

  static async createTempUploadFolder(name: string) {
    try {
      await fsPromises.access(name);
    } catch (error) {
      try {
        await fsPromises.mkdir(name, { recursive: true });
      } catch (mkdirError) {
        throw new Error(`Error creating folder ${mkdirError.message}`);
      }
    }
  }

  static async copyFile(
    sourcePath: string,
    destinationPath: string,
  ): Promise<void> {
    try {
      const fileContent = await fsPromises.readFile(sourcePath);
      await fsPromises.writeFile(destinationPath, fileContent);
    } catch (error) {
      throw new Error(`Error copying file: ${error.message}`);
    }
  }

  static async moveDir(sourcePath: string, destinationPath: string) {
    try {
      await move(sourcePath, destinationPath);
    } catch (err) {
      console.error(`Error moving directory: ${err}`);
    }
  }

  static async readDir(directoryPath: string): Promise<Dirent[]> {
    try {
      const directoryContents = await fsPromises.readdir(directoryPath, {
        withFileTypes: true,
      });
      return directoryContents;
    } catch (error) {
      return [];
    }
  }

  static async deleteFile(filePath: string): Promise<void> {
    try {
      await fsPromises.unlink(filePath);
    } catch (error) {
      throw new Error(`Error deleting file: ${error.message}`);
    }
  }

  static async deleteAllFilesInDir(directoryPath: string): Promise<void> {
    try {
      const entries = await fsPromises.readdir(directoryPath, { withFileTypes: true });
      const fileDeletions = entries
        .filter(entry => entry.isFile())
        .map(entry => fsPromises.unlink(join(directoryPath, entry.name)));

      await Promise.all(fileDeletions);
    } catch (error) {
      throw new Error(`Error deleting files in directory: ${error.message}`);
    }
  }

  static async deleteDir(directoryPath: string): Promise<void> {
    try {
      await fsPromises.rm(directoryPath, { recursive: true, force: true });
    } catch (error) {
      throw new Error(`Error deleting directory: ${error.message}`);
    }
  }
}
