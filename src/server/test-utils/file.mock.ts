import { Readable } from "stream";

export function mockMulterFile({
  filename = "file.txt",
  path = "/temp/path",
  size = 1024,
  mimetype = "plain/txt",
  buffer = Buffer.from("yo"),
  destination = "destinationTest",
  fieldname = "fieldNameTest",
  stream = new Readable(),
  originalname = "originalNameTest",
  encoding = "",
}): Express.Multer.File {
  return {
    filename,
    path,
    size,
    mimetype,
    buffer,
    destination,
    fieldname,
    stream,
    originalname,
    encoding,
  };
}
