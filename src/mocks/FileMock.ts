import {Readable} from "stream";

export function fileMock({name = "file.txt", size = 1024, type = "plain/txt"}) {
    const blob = new Blob(["a".repeat(size)], {type});

    return new File([blob], name);
};

export function multerFileMock(
    {
        filename = "file.txt",
        path = "/temp/path",
        size = 1024,
        mimetype = "plain/txt",
        buffer = new Buffer(""),
        destination = "destinationTest",
        fieldname = "fieldNameTest",
        stream = new Readable(),
        originalname = "originalNameTest",
        encoding = ""
    }): Express.Multer.File {

    return {filename, path, size, mimetype, buffer, destination, fieldname, stream, originalname, encoding};
}
