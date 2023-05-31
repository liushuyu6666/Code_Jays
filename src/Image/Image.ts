export class Image {
    public imageId: string;
    public userId: string;
    public fileName: string;
    public url: string;
    public uploadDate: Date;

    constructor(
        imageId: string,
        userId: string,
        fileName: string,
        url: string,
        uploadDate: Date,
    ) {
        this.imageId = imageId;
        this.userId = userId;
        this.fileName = fileName;
        this.url = url;
        this.uploadDate = uploadDate;
    }
}
