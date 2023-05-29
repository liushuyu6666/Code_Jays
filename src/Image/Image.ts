export class Image {
    public imageId: string;
    public fileName: string;
    public url: string;
    public uploadDate: Date;

    constructor(
        imageId: string,
        fileName: string,
        url: string,
        uploadDate: Date,
    ) {
        this.imageId = imageId;
        this.fileName = fileName;
        this.url = url;
        this.uploadDate = uploadDate;
    }
}
