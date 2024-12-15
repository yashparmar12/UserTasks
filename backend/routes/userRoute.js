import express from 'express';
import Authenticated from '../middleware/Authenticate.js';

import {login, register, userData, forgetPassword, updateProfile, 
    allUserData, userDataById, deleteUser, dummyData, documentDownloadPdf, 
    documentDownloadCsv, task, showTask, taskDuration, uploadPhoto, searchData} from '../controller/userController.js';

import multer from 'multer'
const upload = multer({ dest: 'upload/' })

const router = express.Router();

router.route("/register").post(register);
router.route("/login").post(login);
// router.route("/user-login").post(Authenticated,login);
// router.route("/logout").get(logout);
router.route('/userData').get(Authenticated, userData);
router.route('/userData/:userId').get(userDataById);
router.route("/allUsers").get(allUserData);
router.route("/updateProfile").post(Authenticated, upload.single('photo'), updateProfile);
router.route('/updatePassword').post(forgetPassword);
router.route('/delete').delete(deleteUser);
router.route('/searchData').post(searchData);
router.route('/dummyData').post(dummyData);
router.route('/pdfDownload').post(documentDownloadPdf);
router.route('/csvDownload').post(documentDownloadCsv);
router.route('/task').post(task);
router.route('/showTask').get(showTask);
router.route('/taskDuration').post(taskDuration);





export default router;