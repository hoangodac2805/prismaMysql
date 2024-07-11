import { initializeApp } from "firebase/app";
import {
    getStorage,
    ref,
    getDownloadURL,
    uploadBytesResumable,
    deleteObject
} from "firebase/storage";
import { IFileObject } from "../../types/File";


const FIREBASE_STORAGE = {
    apiKey: process.env.API_KEY,
    authDomain: process.env.AUTH_DOMAN,
    projectId: process.env.PROJECT_ID,
    storageBucket: process.env.STORAGE_BUCKET,
    messagingSenderId: process.env.MESSAGING_SENDER_ID,
    appId: process.env.APP_ID,
}
initializeApp(FIREBASE_STORAGE);

const storage = getStorage();

export const uploadToFireBase = async (file: IFileObject, folder: string) => {
    try {
        const buffer = file.buffer;
        const dateTime = Date.now().toString();
        const fileName = dateTime + '_' + file.originalname;
        const storageRef = ref(storage, `${folder}/${fileName}`);

        const metadata = {
            contentType: file.mimetype,
        };
        const snapshot = await uploadBytesResumable(storageRef, buffer, metadata);
        const downloadURL = await getDownloadURL(snapshot.ref);

        return {
            status: true,
            message: "Upload successfully!!!",
            data: {
                name: file.originalname,
                fileName,
                type: file.mimetype,
                downloadURL: downloadURL,
            },
        };
    } catch (error) {
        return {
            status: false, message: "Upload failed!!",
            data: {
                name: file.originalname,
                fileName: null,
                type: file.mimetype,
                downloadURL: null,
            },
        };
    }
};


export const deleteFileFromFireBase = async (file: string) => {
    const desertRef = ref(storage, file);
    deleteObject(desertRef).then(() => {
        console.log("File deleted successfully");
        return { status: true, message: "Delete file successfully!!!" };
    }).catch((error) => {
        console.log(error);
        return { status: false, message: "Delete file failed!!" };
    });
}