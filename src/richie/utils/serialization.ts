import { ClassConstructor, instanceToPlain, plainToInstance } from 'class-transformer';
import { readFile, writeFile } from 'fs/promises';

export async function loadAndDeserializeJson<T>(filePath: string, serializationClass: ClassConstructor<T>): Promise<T> {
  const fileBuffer = await readFile(filePath);
  const fileJson = fileBuffer.toString();
  const fileData = JSON.parse(fileJson);

  return plainToInstance(serializationClass, fileData);
}

export async function saveAndSerializeJson<T>(filePath: string, classInstance: T): Promise<void> {
  const fileData = instanceToPlain(classInstance);
  const fileJson = JSON.stringify(fileData, null, 4);

  await writeFile(filePath, fileJson);
}
