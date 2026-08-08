import re

with open('src/lib/adminService.ts', 'r') as f:
    content = f.read()

execute_write_old = """  const executeWrite = async (collectionName: string, docPath: string, action: () => Promise<void>) => {
    try {
      await action();
    } catch (err: any) {
      console.error(`Provisioning Error - Collection: ${collectionName} | Doc: ${docPath}`, err);
      throw new Error(
        `Provisioning Failed at Collection: ${collectionName}\\n` +
        `Document Path: ${docPath}\\n` +
        `Firebase Error Code: ${err.code || 'UNKNOWN'}\\n` +
        `Firebase Error Message: ${err.message || String(err)}`
      );
    }
  };"""

execute_write_new = """  const executeWrite = async (collectionName: string, docPath: string, action: () => Promise<void>) => {
    try {
      await action();
    } catch (error: any) {
      console.error("Provisioning Error:", error);
      if (error.code) { // checking if it's like a FirebaseError
        console.error("error.code:", error.code);
        console.error("error.message:", error.message);
        console.error("error.stack:", error.stack);
      }
      throw new Error(
        `Collection Name: ${collectionName}\\n` +
        `Document Path: ${docPath}\\n` +
        `Firebase Error Code: ${error.code || 'UNKNOWN'}\\n` +
        `Firebase Error Message: ${error.message || String(error)}`
      );
    }
  };"""

content = content.replace(execute_write_old, execute_write_new)

with open('src/lib/adminService.ts', 'w') as f:
    f.write(content)

